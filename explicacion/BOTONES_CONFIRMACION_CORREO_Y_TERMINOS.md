# Botones de Confirmacion/Cancelacion por Correo Electronico y Boton de Terminos y Condiciones

---

## 1. RESUMEN GENERAL DEL SISTEMA

Cuando un paciente agenda una cita, el sistema le envia un correo electronico con **dos botones**:
- **Confirmar Cita** (verde)
- **Cancelar Cita** (rojo)

El paciente hace clic en uno de estos botones desde su correo (Gmail, Outlook, etc.) y es redirigido a una pagina del backend donde confirma la accion. El sistema actualiza la base de datos y notifica al equipo.

---

## 2. ARCHIVOS INVOLUCRADOS

| Componente | Archivo |
|---|---|
| Servicio de correo | `backend/services/notificacionAgendamiento.js` |
| Controlador | `backend/controller/NotificacionAgendamientoController.js` |
| Rutas | `backend/view/notificacionAgendamientoRoutes.js` |
| Modelo BD | `backend/model/ReservaPacientes.js` |

---

## 3. COMO SE CONSTRUYE EL CORREO CON LOS BOTONES

### Archivo: `services/notificacionAgendamiento.js`

El metodo `enviarCorreoConfirmacionReserva()` construye el HTML del correo usando template literals (backticks). No usa archivos de plantilla externos.

### Construccion de las URLs de los botones

```javascript
const baseUrl = process.env.BACKEND_URL || "https://siluetachic.nativecode.cl";

const urlConfirmar = `${baseUrl}/notificacion/confirmar?id_reserva=${id_reserva}&nombrePaciente=${encodeURIComponent(nombrePaciente)}&apellidoPaciente=${encodeURIComponent(apellidoPaciente)}&fechaInicio=${encodeURIComponent(fechaInicio)}&horaInicio=${encodeURIComponent(horaInicio)}`;

const urlCancelar = `${baseUrl}/notificacion/cancelar?id_reserva=${id_reserva}&nombrePaciente=${encodeURIComponent(nombrePaciente)}&apellidoPaciente=${encodeURIComponent(apellidoPaciente)}&fechaInicio=${encodeURIComponent(fechaInicio)}&horaInicio=${encodeURIComponent(horaInicio)}`;
```

**Importante:** Los parametros se codifican con `encodeURIComponent()` para que caracteres especiales (tildes, espacios) no rompan la URL.

### HTML de los botones en el correo (lineas 88-93)

```html
<!-- Botones de accion -->
<div style="text-align: center; margin: 30px 0;">
  <p style="margin-bottom: 15px; font-weight: bold; color: #374151;">Confirmas tu asistencia?</p>
  <a href="${urlConfirmar}" style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 0 10px; font-weight: bold;">Confirmar Cita</a>
  <a href="${urlCancelar}" style="display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 0 10px; font-weight: bold;">Cancelar Cita</a>
</div>
```

**Los botones son etiquetas `<a>` (enlaces), no `<button>`**, porque los correos electronicos no soportan formularios ni JavaScript. Solo funcionan enlaces.

### Envio del correo via API Brevo

El correo se envia a la API de Brevo (`https://api.brevo.com/v3/smtp/email`) con:
- `sender`: nombre y correo de la empresa (desde `CORREO_RECEPTOR` y `NOMBRE_EMPRESA`)
- `to`: correo del paciente
- `subject`: asunto del correo
- `textContent`: version texto plano (para clientes de correo que no soportan HTML)
- `htmlContent`: version HTML completa con los botones

---

## 4. FLUJO COMPLETO: QUE PASA CUANDO EL PACIENTE HACE CLIC

### Por que se usa un sistema de 2 pasos (GET + POST)?

**Problema:** Los clientes de correo (Gmail, Outlook) pre-cargan automaticamente todos los enlaces del correo para verificar seguridad. Si el boton de "Confirmar" ejecutara la accion directamente con un GET, Gmail confirmaria la cita automaticamente sin que el paciente haga nada.

**Solucion implementada:**
1. **Paso 1 (GET):** El enlace del correo lleva a una pagina HTML que muestra "Estas seguro?" con un formulario POST
2. **Paso 2 (POST):** Solo cuando el paciente hace clic en "Si, confirmar" se ejecuta la accion real

Los clientes de correo NUNCA ejecutan formularios POST, asi que la cita queda protegida.

### Flujo de CONFIRMACION

```
1. Paciente hace clic en "Confirmar Cita" en el correo
   |
2. GET /notificacion/confirmar?id_reserva=123&nombrePaciente=Juan&...
   |
3. Controller: confirmarCita() -> Muestra pagina HTML "Confirmar tu cita?"
   - Muestra datos de la cita (nombre, fecha, hora)
   - Formulario con method="POST" action="/notificacion/confirmar/ejecutar"
   - Campos hidden: id_reserva, nombrePaciente, apellidoPaciente, fechaInicio, horaInicio
   - Boton verde: "Si, confirmar mi cita"
   |
4. Paciente hace clic en "Si, confirmar mi cita"
   |
5. POST /notificacion/confirmar/ejecutar (con datos del formulario)
   |
6. Controller: ejecutarConfirmacion()
   - Valida campos requeridos
   - Llama a ReservaPacientes.actualizarEstado("CONFIRMADA", id_reserva)
   - Si affectedRows > 0:
     * Envia correo al equipo (enviarCorreoConfirmacionEquipo)
     * Muestra pagina de exito: "Cita Confirmada!"
   - Si affectedRows = 0:
     * NO envia correo
     * Muestra pagina de error: "Cita no encontrada"
```

### Flujo de CANCELACION

Identico al de confirmacion pero:
- URL: `/notificacion/cancelar` y `/notificacion/cancelar/ejecutar`
- Estado en BD: "ANULADA" (en vez de "CONFIRMADA")
- Pagina muestra advertencia: "Esta accion no se puede deshacer"
- Color rojo en vez de verde

---

## 5. RUTAS DEL BACKEND

```
GET  /notificacion/confirmar           -> Muestra pagina "Estas seguro?" (seguro para pre-carga)
POST /notificacion/confirmar/ejecutar  -> Ejecuta confirmacion en BD + notifica equipo

GET  /notificacion/cancelar            -> Muestra pagina "Estas seguro?" (seguro para pre-carga)
POST /notificacion/cancelar/ejecutar   -> Ejecuta cancelacion en BD + notifica equipo
```

---

## 6. CAMBIOS EN LA BASE DE DATOS

Tabla: `reservaPacientes`
Campo afectado: `estadoReserva`

| Accion | Valor nuevo |
|---|---|
| Confirmar | `"CONFIRMADA"` |
| Cancelar | `"ANULADA"` |

---

## 7. NOTIFICACION AL EQUIPO

Despues de confirmar o cancelar exitosamente, se envia un correo al equipo (`desarrollo.native.code@gmail.com`) con:
- Nombre del paciente
- ID de reserva
- Fecha y hora
- Que accion tomo el paciente (CONFIRMADA o CANCELADA)

Esto se hace con el metodo `enviarCorreoConfirmacionEquipo()` en el mismo servicio.

---

## 8. COMO AGREGAR EL BOTON DE TERMINOS Y CONDICIONES

El boton de terminos y condiciones es mas simple que los de confirmar/cancelar porque **no requiere logica de backend**. Solo es un enlace que lleva al paciente a una pagina del frontend.

### Paso 1: Definir la URL de terminos y condiciones

Tienes dos opciones:

**Opcion A: Pagina en el frontend (RECOMENDADA)**
Crear una pagina en el frontend, por ejemplo `/terminos-y-condiciones`, y apuntar el boton ahi:
```
https://siluetachic.cl/terminos-y-condiciones
```

**Opcion B: Variable de entorno**
Agregar una variable de entorno para que sea configurable:
```env
FRONTEND_URL=https://siluetachic.cl
```

### Paso 2: Modificar el HTML del correo

En el archivo `services/notificacionAgendamiento.js`, dentro del metodo `enviarCorreoConfirmacionReserva()`, agregar el boton despues de los botones de confirmar/cancelar.

**Ubicacion exacta:** Despues de la linea 93 (cierre del div de botones de accion), agregar un nuevo bloque.

**Codigo a agregar:**

```javascript
// Construir URL de terminos (agregar junto a urlConfirmar y urlCancelar, alrededor de linea 73)
const frontendUrl = process.env.FRONTEND_URL || "https://siluetachic.cl";
const urlTerminos = `${frontendUrl}/terminos-y-condiciones`;
```

**HTML del boton (agregar despues de la linea 93 en el HTML del correo):**

```html
<!-- Boton de Terminos y Condiciones -->
<div style="text-align: center; margin: 20px 0;">
  <a href="${urlTerminos}"
     style="display: inline-block; background: #667eea; color: white; padding: 10px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 13px;">
    Terminos y Condiciones
  </a>
</div>
```

### Paso 3: Tambien agregar en la version texto plano

En la variable `text` (alrededor de la linea 40-68), agregar al final antes del cierre:

```javascript
`\nTerminos y Condiciones: ${urlTerminos}\n`
```

### Resultado final del bloque de botones en el correo

El HTML de los 3 botones quedaria asi:

```html
<!-- Botones de accion -->
<div style="text-align: center; margin: 30px 0;">
  <p style="margin-bottom: 15px; font-weight: bold; color: #374151;">Confirmas tu asistencia?</p>
  <a href="${urlConfirmar}" style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 0 10px; font-weight: bold;">Confirmar Cita</a>
  <a href="${urlCancelar}" style="display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 0 10px; font-weight: bold;">Cancelar Cita</a>
</div>

<!-- Boton de Terminos y Condiciones -->
<div style="text-align: center; margin: 20px 0;">
  <p style="margin-bottom: 10px; font-size: 13px; color: #6b7280;">Al confirmar tu cita, aceptas nuestros terminos y condiciones:</p>
  <a href="${urlTerminos}" style="display: inline-block; background: #667eea; color: white; padding: 10px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 13px;">Terminos y Condiciones</a>
</div>
```

### Paso 4 (Opcional): Crear la pagina en el frontend

Si no existe la pagina de terminos, crear:
```
frontend/src/app/(public)/terminos-y-condiciones/page.jsx
```

Esta pagina puede ser un Server Component (no necesita `'use client'`) y mostrar el contenido legal de la clinica.

---

## 9. VARIABLES DE ENTORNO REQUERIDAS

| Variable | Uso | Ejemplo |
|---|---|---|
| `BREVO_API_KEY` | API key de Brevo para enviar correos | `xkeysib-xxxxx` |
| `CORREO_RECEPTOR` | Email remitente (debe estar verificado en Brevo) | `contacto@siluetachic.cl` |
| `NOMBRE_EMPRESA` | Nombre que aparece en el correo | `SiluetaChic` |
| `BACKEND_URL` | URL base para botones confirmar/cancelar | `https://siluetachic.nativecode.cl` |
| `FRONTEND_URL` | **(NUEVA)** URL base para el boton de terminos | `https://siluetachic.cl` |

---

## 10. RESUMEN DE CAMBIOS NECESARIOS PARA AGREGAR TERMINOS Y CONDICIONES

1. **`services/notificacionAgendamiento.js`:**
   - Agregar variable `FRONTEND_URL` en el destructuring de `process.env`
   - Agregar `urlTerminos` junto a `urlConfirmar` y `urlCancelar`
   - Agregar HTML del boton de terminos despues de los botones existentes
   - Agregar URL de terminos en la version texto plano

2. **`.env`:**
   - Agregar `FRONTEND_URL=https://siluetachic.cl`

3. **Frontend (opcional):**
   - Crear pagina `/terminos-y-condiciones` si no existe
