# Sistema de Notificaciones y Recordatorios de Citas

> **NOTA IMPORTANTE:** El sistema actual envia notificaciones y recordatorios por **correo electronico**, NO por WhatsApp. Se utiliza la API de **Brevo (ex Sendinblue)** como servicio de envio de emails transaccionales.

---

## Tabla de Contenidos

1. [Resumen General](#1-resumen-general)
2. [Tecnologias y Dependencias](#2-tecnologias-y-dependencias)
3. [Variables de Entorno Requeridas](#3-variables-de-entorno-requeridas)
4. [Estructura de Archivos](#4-estructura-de-archivos)
5. [Flujo Completo del Sistema](#5-flujo-completo-del-sistema)
6. [Recordatorios Automaticos (Cron Job)](#6-recordatorios-automaticos-cron-job)
7. [Notificaciones de Agendamiento](#7-notificaciones-de-agendamiento)
8. [Confirmacion y Cancelacion por el Paciente](#8-confirmacion-y-cancelacion-por-el-paciente)
9. [Base de Datos - Campos de Control](#9-base-de-datos---campos-de-control)
10. [API de Brevo - Como se Envian los Correos](#10-api-de-brevo---como-se-envian-los-correos)
11. [Rutas y Endpoints](#11-rutas-y-endpoints)
12. [Casos de Uso para Modificaciones](#12-casos-de-uso-para-modificaciones)
13. [Troubleshooting](#13-troubleshooting)

---

## 1. Resumen General

El sistema envia **correos electronicos automaticos** a los pacientes como recordatorios de sus citas agendadas. Funciona asi:

1. Cuando se **crea una reserva**, se envia un correo de confirmacion al paciente con botones para confirmar o cancelar.
2. Paralelamente, se notifica al **equipo de la clinica** que se creo una nueva reserva.
3. Un **cron job** revisa cada 5 minutos la base de datos buscando citas proximas.
4. Se envian **2 recordatorios**: uno **12 horas antes** y otro **6 horas antes** de la cita.
5. Cada recordatorio se marca en la BD para evitar duplicados.
6. Si el paciente confirma o cancela desde el correo, se actualiza el estado y se notifica al equipo.

### Que hace y que NO hace el sistema

| Hace | No hace |
|------|---------|
| Envia correos de recordatorio automaticos | No envia mensajes de WhatsApp |
| Envia confirmacion de reserva al paciente | No envia SMS |
| Permite confirmar/cancelar desde el correo | No tiene notificaciones push |
| Notifica al equipo de acciones del paciente | No usa Twilio ni servicios de mensajeria |

---

## 2. Tecnologias y Dependencias

| Tecnologia | Uso |
|------------|-----|
| **Node.js** (v18+) | Runtime del backend. Se requiere v18+ porque usa `fetch` nativo |
| **Express.js** (v5) | Framework web para las rutas y middleware |
| **Brevo API** (REST) | Servicio de envio de correos transaccionales |
| **MySQL** (mysql2/promise) | Base de datos para reservas y flags de recordatorios |
| **setInterval** (nativo JS) | Cron job cada 5 minutos para revisar recordatorios pendientes |
| **dotenv** | Carga variables de entorno desde `.env` |

### Dependencias en package.json relevantes

```
express: ^5.1.0
mysql2: ^3.15.1
dotenv: ^17.2.2
cookie-parser: ^1.4.7
cors: ^2.8.5
```

> **Nota:** No se usa ninguna libreria externa para enviar correos (como nodemailer). Se usa directamente `fetch` nativo de Node.js 18+ contra la API REST de Brevo.

---

## 3. Variables de Entorno Requeridas

Estas variables deben estar configuradas en el archivo `.env` para que las notificaciones funcionen:

```env
# API Key de Brevo (obtener en https://app.brevo.com > SMTP & API > API Keys)
BREVO_API_KEY=tu_api_key_de_brevo_aqui

# Correo remitente verificado en Brevo (debe estar verificado en la plataforma)
CORREO_REMITENTE=correo_remitente@ejemplo.com

# Correo donde llegan las notificaciones al equipo
CORREO_RECEPTOR=correo_equipo@ejemplo.com

# Nombre que aparece como remitente en los correos
NOMBRE_EMPRESA=NombreDeTuClinica

# URL base del backend (necesaria para generar links de confirmar/cancelar)
BACKEND_URL=https://tu-dominio-backend.com

# Puerto del servidor
PORT=3001
```

### Que pasa si falta alguna variable

| Variable faltante | Comportamiento |
|-------------------|---------------|
| `BREVO_API_KEY` | No se envia ningun correo. Se muestra warning en consola |
| `CORREO_REMITENTE` | No se envia ningun correo. Se muestra warning en consola |
| `CORREO_RECEPTOR` | No se envian notificaciones al equipo |
| `NOMBRE_EMPRESA` | Se usa "Clinica" o "Sistema de Agendamiento" como fallback |
| `BACKEND_URL` | Se usa una URL por defecto. Los links de confirmar/cancelar no funcionaran correctamente |

---

## 4. Estructura de Archivos

```
backend/
├── app.js                                          # Servidor + cron job de recordatorios
│
├── services/
│   ├── notificacionPreviaDia.js                    # Motor de recordatorios automaticos (12h y 6h)
│   └── notificacionAgendamiento.js                 # Correos de agendamiento, confirmacion y equipo
│
├── controller/
│   ├── NotificacionAgendamientoController.js       # Maneja confirmar/cancelar desde el correo
│   └── ReservaPacienteController.js                # CRUD de reservas (dispara correos al crear)
│
├── view/
│   ├── notificacionAgendamientoRoutes.js           # Rutas de confirmar/cancelar
│   └── reservaPacienteRoutes.js                    # Rutas de reservas
│
├── model/
│   └── ReservaPacientes.js                         # Queries SQL de reservas
│
├── config/
│   └── Database.js                                 # Pool de conexion MySQL (singleton)
│
├── scripts/
│   └── agregar_campos_recordatorio.sql             # SQL para agregar campos de control
│
└── .env                                            # Variables de entorno (NO subir al repo)
```

### Relacion entre archivos

```
app.js
  ├── Importa ejecutarRecordatoriosAutomaticos() de services/notificacionPreviaDia.js
  ├── Monta ruta /notificacion → view/notificacionAgendamientoRoutes.js
  ├── Monta ruta /reservaPacientes → view/reservaPacienteRoutes.js
  └── Monta ruta GET /recordatorios/ejecutar (testing manual)

services/notificacionPreviaDia.js
  ├── Consulta BD via config/Database.js
  └── Envia correos via API de Brevo (fetch directo)

services/notificacionAgendamiento.js
  └── Envia correos via API de Brevo (fetch directo)

controller/ReservaPacienteController.js
  ├── Usa model/ReservaPacientes.js para queries
  └── Llama a services/notificacionAgendamiento.js al crear reserva

controller/NotificacionAgendamientoController.js
  ├── Usa model/ReservaPacientes.js para actualizar estado
  └── Llama a services/notificacionAgendamiento.js para notificar equipo
```

---

## 5. Flujo Completo del Sistema

### Flujo 1: Creacion de reserva

```
Paciente agenda cita (frontend)
        │
        v
POST /reservaPacientes/insertarReservaPaciente
        │
        v
ReservaPacienteController.insertarReservaPaciente()
        │
        ├── 1. Valida disponibilidad horaria
        ├── 2. Inserta reserva en BD
        ├── 3. Envia correo al PACIENTE (confirmacion con botones)
        │       → NotificacionAgendamiento.enviarCorreoConfirmacionReserva()
        └── 4. Envia correo al EQUIPO (nueva reserva)
                → NotificacionAgendamiento.enviarCorreoConfirmacionEquipo({ accion: "AGENDADA" })
```

**Archivo:** `controller/ReservaPacienteController.js` lineas 279-356

### Flujo 2: Recordatorios automaticos

```
Servidor arranca
        │
        ├── 10 seg despues: primera revision
        └── Cada 5 min: revision automatica
                │
                v
        ejecutarRecordatoriosAutomaticos()
                │
                v
        obtenerReservasParaRecordatorio()
        → SELECT citas con estado 'reservada' o 'CONFIRMADA'
          que estan entre ahora y 13 horas en el futuro
                │
                v
        Para cada reserva encontrada:
                │
                ├── Si faltan 690-750 min (11.5h-12.5h) Y recordatorio12h = 0
                │       → enviarCorreoRecordatorio({ tipoRecordatorio: '12h' })
                │       → marcarRecordatorioEnviado(id, '12h')  →  UPDATE recordatorio12h = 1
                │
                └── Si faltan 330-390 min (5.5h-6.5h) Y recordatorio6h = 0
                        → enviarCorreoRecordatorio({ tipoRecordatorio: '6h' })
                        → marcarRecordatorioEnviado(id, '6h')  →  UPDATE recordatorio6h = 1
```

**Archivo:** `services/notificacionPreviaDia.js` lineas 245-331

### Flujo 3: Paciente confirma/cancela desde el correo

```
Paciente hace clic en "Confirmar Cita" (link del correo)
        │
        v
GET /notificacion/confirmar?id_reserva=X&nombrePaciente=...
        │
        v
Muestra pagina HTML con boton "Si, confirmar mi cita"
        │
        v
Paciente hace clic en el boton
        │
        v
POST /notificacion/confirmar/ejecutar (formulario HTML)
        │
        v
NotificacionAgendamientoController.ejecutarConfirmacion()
        │
        ├── UPDATE estadoReserva = 'CONFIRMADA' en BD
        └── Envia correo al EQUIPO
                → enviarCorreoConfirmacionEquipo({ accion: "CONFIRMADA" })
```

> La cancelacion funciona igual pero cambia el estado a `'ANULADA'` y la accion a `"CANCELADA"`.

**Archivo:** `controller/NotificacionAgendamientoController.js` lineas 121-257 (confirmar) y 396-532 (cancelar)

---

## 6. Recordatorios Automaticos (Cron Job)

### Como se inicia el cron job

En `app.js` lineas 86-96, despues de que el servidor arranca:

```javascript
// Se ejecuta una vez 10 segundos despues de iniciar
setTimeout(async () => {
    await ejecutarRecordatoriosAutomaticos();
}, 10000);

// Luego se repite cada 5 minutos
setInterval(async () => {
    await ejecutarRecordatoriosAutomaticos();
}, 5 * 60 * 1000);
```

### Ventanas de tiempo para envio

El sistema usa **ventanas de tiempo** (rangos en minutos) para decidir cuando enviar cada recordatorio. Esto es necesario porque el cron corre cada 5 minutos y podria "saltar" el momento exacto.

| Recordatorio | Rango en minutos | Equivalente en horas | Condicion adicional |
|-------------|-----------------|---------------------|-------------------|
| 12 horas | 690 - 750 min | 11.5h - 12.5h antes | `recordatorio12h = 0` |
| 6 horas | 330 - 390 min | 5.5h - 6.5h antes | `recordatorio6h = 0` |

**Archivo:** `services/notificacionPreviaDia.js` lineas 279-318

### Query SQL que busca las reservas

```sql
SELECT
    id_reserva, nombrePaciente, apellidoPaciente, email,
    fechaInicio, horaInicio, estadoReserva,
    COALESCE(recordatorio12h, 0) as recordatorio12h,
    COALESCE(recordatorio6h, 0) as recordatorio6h,
    TIMESTAMPDIFF(MINUTE, NOW(), TIMESTAMP(fechaInicio, horaInicio)) as minutos_restantes
FROM reservaPacientes
WHERE estadoReserva IN ('reservada', 'CONFIRMADA')
    AND estadoPeticion <> 0
    AND TIMESTAMP(fechaInicio, horaInicio) > NOW()
    AND TIMESTAMP(fechaInicio, horaInicio) <= DATE_ADD(NOW(), INTERVAL 13 HOUR)
```

**Solo busca citas que:**
- Tengan estado `'reservada'` o `'CONFIRMADA'`
- No esten eliminadas logicamente (`estadoPeticion <> 0`)
- Sean en el futuro
- Esten dentro de las proximas 13 horas

### Funciones del servicio de recordatorios

| Funcion | Lineas | Descripcion |
|---------|--------|-------------|
| `ejecutarRecordatoriosAutomaticos()` | 245-331 | Funcion principal. Orquesta todo el proceso |
| `obtenerReservasParaRecordatorio()` | 197-227 | Consulta SQL que trae citas proximas |
| `enviarCorreoRecordatorio()` | 18-176 | Arma el HTML y envia via Brevo API |
| `marcarRecordatorioEnviado()` | 181-191 | UPDATE del flag en la BD |
| `formatearFecha()` | 232-236 | Convierte fecha a formato legible en espanol |
| `enviarRecordatorioManual()` | 336-345 | Para testing manual |

---

## 7. Notificaciones de Agendamiento

### Tipos de correo que se envian

**Archivo:** `services/notificacionAgendamiento.js`

| Tipo | Destinatario | Funcion | Se dispara cuando |
|------|-------------|---------|-------------------|
| Confirmacion de reserva | Paciente | `enviarCorreoConfirmacionReserva()` | Se crea una reserva |
| Nueva reserva (equipo) | Equipo clinica | `enviarCorreoConfirmacionEquipo({ accion: "AGENDADA" })` | Se crea una reserva |
| Cita confirmada (equipo) | Equipo clinica | `enviarCorreoConfirmacionEquipo({ accion: "CONFIRMADA" })` | Paciente confirma |
| Cita cancelada (equipo) | Equipo clinica | `enviarCorreoConfirmacionEquipo({ accion: "CANCELADA" })` | Paciente cancela |
| Recordatorio 12h | Paciente | `enviarCorreoRecordatorio({ tipo: '12h' })` | Cron job automatico |
| Recordatorio 6h | Paciente | `enviarCorreoRecordatorio({ tipo: '6h' })` | Cron job automatico |

### Correo de confirmacion al paciente

Incluye:
- Detalle de la cita (RUT, telefono, fecha, hora, estado)
- Boton verde "Confirmar Cita" (link GET que lleva a pagina de confirmacion)
- Boton rojo "Cancelar Cita" (link GET que lleva a pagina de cancelacion)

**Archivo:** `services/notificacionAgendamiento.js` lineas 2-139

### Correos al equipo

Tienen un header con color segun la accion:
- **Azul** (`#3b82f6`): Nueva reserva
- **Verde** (`#10b981`): Cita confirmada por paciente
- **Rojo** (`#ef4444`): Cita cancelada por paciente

**Archivo:** `services/notificacionAgendamiento.js` lineas 142-260

---

## 8. Confirmacion y Cancelacion por el Paciente

### Patron de seguridad GET + POST

Los correos contienen links GET que muestran una pagina intermedia con un formulario POST. Esto evita que los clientes de correo (Gmail, Outlook) ejecuten acciones al precargar links.

```
Link en el correo (GET) → Muestra pagina con boton → Paciente hace clic → POST ejecuta accion
```

### Rutas

**Archivo:** `view/notificacionAgendamientoRoutes.js`

```
GET  /notificacion/confirmar            → Muestra pagina de confirmacion
POST /notificacion/confirmar/ejecutar   → Ejecuta la confirmacion
GET  /notificacion/cancelar             → Muestra pagina de cancelacion
POST /notificacion/cancelar/ejecutar    → Ejecuta la cancelacion
```

### Parametros (query string en GET, body en POST)

```
id_reserva        - ID numerico de la reserva
nombrePaciente    - Nombre del paciente
apellidoPaciente  - Apellido del paciente
fechaInicio       - Fecha de la cita (YYYY-MM-DD)
horaInicio        - Hora de la cita (HH:MM)
```

### Estados de la reserva

| Estado | Significado |
|--------|-------------|
| `'reservada'` | Cita agendada, sin confirmar por el paciente |
| `'CONFIRMADA'` | Paciente confirmo asistencia |
| `'ANULADA'` | Paciente cancelo la cita |

---

## 9. Base de Datos - Campos de Control

### Script SQL necesario

**Archivo:** `scripts/agregar_campos_recordatorio.sql`

```sql
ALTER TABLE reservaPacientes
ADD COLUMN IF NOT EXISTS recordatorio12h TINYINT(1) DEFAULT 0;

ALTER TABLE reservaPacientes
ADD COLUMN IF NOT EXISTS recordatorio6h TINYINT(1) DEFAULT 0;
```

> Este script debe ejecutarse **una sola vez** en la base de datos si los campos no existen.

### Significado de los flags

| Campo | Valor 0 | Valor 1 |
|-------|---------|---------|
| `recordatorio12h` | Recordatorio de 12h NO enviado | Recordatorio de 12h YA enviado |
| `recordatorio6h` | Recordatorio de 6h NO enviado | Recordatorio de 6h YA enviado |

Estos flags **previenen el envio duplicado**. Una vez que se envia un recordatorio, se marca con `1` y no se vuelve a enviar.

### Campos de la tabla reservaPacientes usados por el sistema

```
id_reserva          - PK autoincremental
nombrePaciente      - Nombre del paciente
apellidoPaciente    - Apellido del paciente
email               - Correo del paciente (donde llegan los recordatorios)
rut                 - RUT del paciente
telefono            - Telefono del paciente
fechaInicio         - Fecha de la cita
horaInicio          - Hora de inicio
fechaFinalizacion   - Fecha de fin
horaFinalizacion    - Hora de fin
estadoReserva       - Estado: 'reservada', 'CONFIRMADA', 'ANULADA'
estadoPeticion      - Eliminacion logica (0 = eliminada)
id_profesional      - FK al profesional asignado
recordatorio12h     - Flag de recordatorio de 12 horas
recordatorio6h      - Flag de recordatorio de 6 horas
```

---

## 10. API de Brevo - Como se Envian los Correos

### Endpoint utilizado

```
POST https://api.brevo.com/v3/smtp/email
```

### Headers

```
accept: application/json
content-type: application/json
api-key: <BREVO_API_KEY del .env>
```

### Estructura del payload

```json
{
    "sender": {
        "name": "<NOMBRE_EMPRESA>",
        "email": "<CORREO_REMITENTE>"
    },
    "to": [
        {
            "email": "correo_del_paciente@ejemplo.com"
        }
    ],
    "subject": "Asunto del correo",
    "textContent": "Version texto plano del correo",
    "htmlContent": "<html>Version HTML del correo</html>"
}
```

### Requisitos para que Brevo funcione

1. Tener una cuenta en [Brevo](https://www.brevo.com/)
2. Generar una API Key desde SMTP & API > API Keys
3. **Verificar el correo remitente** en la plataforma de Brevo (el correo que aparece en `CORREO_REMITENTE`)
4. El plan gratuito de Brevo permite 300 correos/dia

### Manejo de errores

- Si el envio falla, se registra en consola pero **NO bloquea** la operacion principal (crear reserva, etc.)
- Los correos de confirmacion al equipo usan `.catch()` para no bloquear la respuesta al paciente

---

## 11. Rutas y Endpoints

### Resumen completo de endpoints relacionados

| Metodo | Ruta | Descripcion | Archivo |
|--------|------|-------------|---------|
| GET | `/recordatorios/ejecutar` | Ejecutar recordatorios manualmente (testing) | `app.js:72-79` |
| GET | `/notificacion/confirmar` | Pagina de confirmacion de cita | `view/notificacionAgendamientoRoutes.js` |
| POST | `/notificacion/confirmar/ejecutar` | Ejecutar confirmacion | `view/notificacionAgendamientoRoutes.js` |
| GET | `/notificacion/cancelar` | Pagina de cancelacion de cita | `view/notificacionAgendamientoRoutes.js` |
| POST | `/notificacion/cancelar/ejecutar` | Ejecutar cancelacion | `view/notificacionAgendamientoRoutes.js` |
| POST | `/reservaPacientes/insertarReservaPaciente` | Crear reserva (dispara correos) | `view/reservaPacienteRoutes.js` |
| POST | `/reservaPacientes/insertarReservaPacienteFicha` | Crear reserva + ficha paciente (dispara correos) | `view/reservaPacienteRoutes.js` |

---

## 12. Casos de Uso para Modificaciones

### Caso 1: Quiero que solo se envie UN recordatorio (no dos)

**Opcion A - Eliminar el recordatorio de 6 horas:**

En `services/notificacionPreviaDia.js`, comentar o eliminar las lineas **301-318** (el bloque del recordatorio de 6h):

```javascript
// Comentar este bloque completo:
// if (minutos_restantes >= 330 && minutos_restantes <= 390 && !recordatorio6h) {
//     ... todo el bloque ...
// }
```

**Opcion B - Eliminar el recordatorio de 12 horas:**

En `services/notificacionPreviaDia.js`, comentar o eliminar las lineas **280-298** (el bloque del recordatorio de 12h).

### Caso 2: Quiero cambiar las horas de los recordatorios

En `services/notificacionPreviaDia.js`, modificar las ventanas de tiempo:

```javascript
// Linea 280 - Recordatorio de 12h (actualmente 690-750 minutos)
if (minutos_restantes >= 690 && minutos_restantes <= 750 && !recordatorio12h) {

// Linea 301 - Recordatorio de 6h (actualmente 330-390 minutos)
if (minutos_restantes >= 330 && minutos_restantes <= 390 && !recordatorio6h) {
```

**Formula:** Horas deseadas x 60 = minutos centrales. Luego restar/sumar 30 para la ventana.

Ejemplo para recordatorio de **24 horas antes**:
- 24 x 60 = 1440 minutos
- Ventana: 1410 a 1470 (23.5h a 24.5h)
- Tambien hay que cambiar el `INTERVAL 13 HOUR` en la query SQL (linea 218) a `INTERVAL 25 HOUR`

### Caso 3: Quiero agregar un tercer recordatorio (ej: 2 horas antes)

1. **Agregar campo en la BD:**
   ```sql
   ALTER TABLE reservaPacientes
   ADD COLUMN IF NOT EXISTS recordatorio2h TINYINT(1) DEFAULT 0;
   ```

2. **Modificar la query SQL** en `services/notificacionPreviaDia.js` linea 211:
   ```sql
   COALESCE(recordatorio2h, 0) as recordatorio2h,
   ```

3. **Agregar bloque de envio** en `services/notificacionPreviaDia.js` despues de la linea 318:
   ```javascript
   // Recordatorio de 2 horas (entre 90 y 150 minutos = 1.5h a 2.5h)
   if (minutos_restantes >= 90 && minutos_restantes <= 150 && !recordatorio2h) {
       const enviado = await enviarCorreoRecordatorio({
           email, nombrePaciente, apellidoPaciente,
           fecha: formatearFecha(fechaInicio),
           hora: horaInicio,
           tipoRecordatorio: '2h'
       });
       if (enviado) {
           await marcarRecordatorioEnviado(id_reserva, '2h');
           enviados++;
       } else { errores++; }
   }
   ```

4. **Actualizar `marcarRecordatorioEnviado`** en linea 184 para que acepte `'2h'`:
   ```javascript
   const campo = tipoRecordatorio === '12h' ? 'recordatorio12h'
               : tipoRecordatorio === '6h' ? 'recordatorio6h'
               : 'recordatorio2h';
   ```

### Caso 4: Quiero cambiar la frecuencia del cron job

En `app.js` linea 90, cambiar el intervalo:

```javascript
// Actual: cada 5 minutos
setInterval(async () => {
    await ejecutarRecordatoriosAutomaticos();
}, 5 * 60 * 1000);

// Ejemplo: cada 10 minutos
}, 10 * 60 * 1000);

// Ejemplo: cada 1 minuto
}, 1 * 60 * 1000);
```

> Si cambias la frecuencia, ajusta las ventanas de tiempo en los recordatorios para que sean al menos tan amplias como el intervalo del cron.

### Caso 5: Quiero desactivar TODOS los recordatorios automaticos

En `app.js`, comentar las lineas 87-96:

```javascript
// Comentar todo esto:
// console.log("[CRON] Iniciando cron job de recordatorios...");
// setInterval(async () => {
//     await ejecutarRecordatoriosAutomaticos();
// }, 5 * 60 * 1000);
// setTimeout(async () => {
//     await ejecutarRecordatoriosAutomaticos();
// }, 10000);
```

Los correos de confirmacion de reserva seguiran funcionando (son independientes del cron).

### Caso 6: Quiero desactivar los correos al crear una reserva

En `controller/ReservaPacienteController.js`:

- **Para desactivar correo al paciente:** Comentar lineas 314-330 (bloque `enviarCorreoConfirmacionReserva`)
- **Para desactivar correo al equipo:** Comentar lineas 334-343 (bloque `enviarCorreoConfirmacionEquipo`)

> Hay que hacerlo tanto en `insertarReservaPaciente()` (linea 279) como en `insertarReservaPacienteFicha()` (linea 362) si ambos metodos se usan.

### Caso 7: Quiero cambiar el contenido/diseno del correo de recordatorio

Editar el HTML en `services/notificacionPreviaDia.js` lineas 42-123 (variable `html`).

La direccion de la clinica se cambia en la constante de la linea 13:
```javascript
const DIRECCION_CLINICA = "SILUETA CHIC, Avenida Irarrázaval 1989 OF 204 SUR, Ñuñoa, Santiago, Chile";
```

### Caso 8: Quiero cambiar el correo de destino del equipo

Modificar la variable `CORREO_RECEPTOR` en el archivo `.env`.

### Caso 9: Quiero que los recordatorios solo se envien a citas confirmadas (no a todas)

En `services/notificacionPreviaDia.js` linea 215, cambiar la condicion SQL:

```sql
-- Actual: envia a reservadas Y confirmadas
WHERE estadoReserva IN ('reservada', 'CONFIRMADA')

-- Solo confirmadas:
WHERE estadoReserva = 'CONFIRMADA'
```

---

## 13. Troubleshooting

### Los correos no se envian

1. Verificar que `BREVO_API_KEY` este configurada en `.env`
2. Verificar que `CORREO_REMITENTE` este **verificado** en la plataforma de Brevo
3. Revisar la consola del servidor por mensajes `[RECORDATORIO]` o `[MAIL]`
4. Verificar que Node.js sea version 18+ (`node -v`)
5. Probar manualmente: `GET /recordatorios/ejecutar`

### Los recordatorios no se disparan

1. Verificar que el cron este corriendo (buscar en consola: `[CRON] Iniciando cron job...`)
2. Verificar que existan reservas con estado `'reservada'` o `'CONFIRMADA'` en las proximas 13 horas
3. Verificar que los campos `recordatorio12h` y `recordatorio6h` existan en la tabla (ejecutar el script SQL)
4. Verificar que `estadoPeticion <> 0` en las reservas

### Se envian correos duplicados

Los campos `recordatorio12h` y `recordatorio6h` deberian prevenir esto. Si ocurre:
1. Verificar que los campos existan en la tabla
2. Verificar que `COALESCE(recordatorio12h, 0)` retorne correctamente
3. Verificar que el UPDATE se ejecute sin error (revisar logs `[RECORDATORIO] Marcado...`)

### Los links de confirmar/cancelar no funcionan

1. Verificar que `BACKEND_URL` en `.env` apunte al backend correcto y sea accesible desde internet
2. Si se usa ngrok u otro tunel, asegurarse de que la URL este actualizada

---

## Resumen Rapido de Archivos a Tocar Segun lo que Quieras Modificar

| Que quiero cambiar | Archivo | Lineas aprox |
|--------------------|---------|----|
| Cantidad de recordatorios | `services/notificacionPreviaDia.js` | 280-318 |
| Horario de recordatorios | `services/notificacionPreviaDia.js` | 280, 301 |
| Frecuencia del cron | `app.js` | 90 |
| Desactivar cron completo | `app.js` | 87-96 |
| Contenido del correo recordatorio | `services/notificacionPreviaDia.js` | 42-123 |
| Contenido del correo de reserva | `services/notificacionAgendamiento.js` | 65-104 |
| Direccion de la clinica | `services/notificacionPreviaDia.js` | 13 |
| Correos de confirmacion al crear reserva | `controller/ReservaPacienteController.js` | 314-343 |
| Paginas HTML de confirmar/cancelar | `controller/NotificacionAgendamientoController.js` | 32-106, 294-381 |
| Rutas de notificacion | `view/notificacionAgendamientoRoutes.js` | 10-15 |
| Query SQL de busqueda de citas | `services/notificacionPreviaDia.js` | 202-218 |
| Campos de BD para recordatorios | `scripts/agregar_campos_recordatorio.sql` | 5-10 |
| Variables de entorno | `.env` | - |
