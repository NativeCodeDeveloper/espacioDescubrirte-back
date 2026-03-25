# Envio de correos de recordatorios

Este archivo explica el flujo real del envio de correos de recordatorio de citas en el backend: donde esta la logica, que funciones participan y desde donde se llaman.

## 1. Archivo principal del envio

El envio de recordatorios no esta en una clase. La logica vive en este archivo:

- [services/notificacionPreviaDia.js](/Users/nicolas/Documents/proyectos/AgendaClinica/Multiple/espacioDescubrirte/backend/services/notificacionPreviaDia.js)

Ese archivo exporta 2 funciones:

- `ejecutarRecordatoriosAutomaticos()`: funcion principal que revisa las reservas proximas y decide si debe enviar el recordatorio de 12h o de 6h.
- `enviarRecordatorioManual()`: helper para pruebas manuales.

Tambien define funciones internas:

- `enviarCorreoRecordatorio(...)`: construye el correo y lo envia a Brevo.
- `marcarRecordatorioEnviado(...)`: marca en BD si ya se envio el recordatorio.
- `obtenerReservasParaRecordatorio()`: consulta las reservas que pueden recibir recordatorio.
- `formatearFecha(...)`: formatea la fecha para mostrarla en el correo.

## 2. Funcion que realmente envia el correo

La funcion que hace el envio HTTP a Brevo es:

- [services/notificacionPreviaDia.js:18](/Users/nicolas/Documents/proyectos/AgendaClinica/Multiple/espacioDescubrirte/backend/services/notificacionPreviaDia.js#L18)

Nombre:

- `async function enviarCorreoRecordatorio({ email, nombrePaciente, apellidoPaciente, fecha, hora, tipoRecordatorio })`

Que hace:

1. Lee variables de entorno: `BREVO_API_KEY`, `CORREO_RECEPTOR`, `NOMBRE_EMPRESA`.
2. Valida que exista API key y destinatario.
3. Construye `subject`, `html` y `textContent`.
4. Hace `fetch("https://api.brevo.com/v3/smtp/email", ...)`.
5. Si Brevo responde OK, devuelve `true`.
6. Si falla, devuelve `false`.

El payload que envia a Brevo se arma en:

- [services/notificacionPreviaDia.js:145](/Users/nicolas/Documents/proyectos/AgendaClinica/Multiple/espacioDescubrirte/backend/services/notificacionPreviaDia.js#L145)

La llamada a Brevo se hace en:

- [services/notificacionPreviaDia.js:154](/Users/nicolas/Documents/proyectos/AgendaClinica/Multiple/espacioDescubrirte/backend/services/notificacionPreviaDia.js#L154)

## 3. Funcion principal que decide cuando enviar

La funcion principal del sistema es:

- [services/notificacionPreviaDia.js:245](/Users/nicolas/Documents/proyectos/AgendaClinica/Multiple/espacioDescubrirte/backend/services/notificacionPreviaDia.js#L245)

Nombre:

- `export async function ejecutarRecordatoriosAutomaticos()`

Esta funcion:

1. Llama a `obtenerReservasParaRecordatorio()`.
2. Recorre cada reserva encontrada.
3. Si faltan entre `690` y `750` minutos y `recordatorio12h` esta en `0`, envia el recordatorio de 12 horas.
4. Si faltan entre `330` y `390` minutos y `recordatorio6h` esta en `0`, envia el recordatorio de 6 horas.
5. Si el envio sale bien, llama a `marcarRecordatorioEnviado(...)` para no repetir el correo.

Puntos exactos:

- Consulta de reservas: [services/notificacionPreviaDia.js:197](/Users/nicolas/Documents/proyectos/AgendaClinica/Multiple/espacioDescubrirte/backend/services/notificacionPreviaDia.js#L197)
- Evaluacion recordatorio 12h: [services/notificacionPreviaDia.js:280](/Users/nicolas/Documents/proyectos/AgendaClinica/Multiple/espacioDescubrirte/backend/services/notificacionPreviaDia.js#L280)
- Evaluacion recordatorio 6h: [services/notificacionPreviaDia.js:301](/Users/nicolas/Documents/proyectos/AgendaClinica/Multiple/espacioDescubrirte/backend/services/notificacionPreviaDia.js#L301)
- Marcado en BD: [services/notificacionPreviaDia.js:181](/Users/nicolas/Documents/proyectos/AgendaClinica/Multiple/espacioDescubrirte/backend/services/notificacionPreviaDia.js#L181)

## 4. Desde donde se llama el envio de recordatorios

El servicio de recordatorios se llama desde `app.js`.

Importacion:

- [app.js:27](/Users/nicolas/Documents/proyectos/AgendaClinica/Multiple/espacioDescubrirte/backend/app.js#L27)

```js
import { ejecutarRecordatoriosAutomaticos } from "./services/notificacionPreviaDia.js";
```

### Llamada manual por ruta

Existe una ruta para ejecutar el proceso manualmente:

- [app.js:72](/Users/nicolas/Documents/proyectos/AgendaClinica/Multiple/espacioDescubrirte/backend/app.js#L72)

```js
app.get('/recordatorios/ejecutar', async (req, res) => {
    const resultado = await ejecutarRecordatoriosAutomaticos();
    res.json({ ok: true, ...resultado });
});
```

Esto sirve para testing. Cuando llamas:

- `GET /recordatorios/ejecutar`

se dispara todo el proceso de revision y envio de recordatorios.

### Llamada automatica por cron interno

Tambien se llama automaticamente cuando el servidor inicia:

- [app.js:88](/Users/nicolas/Documents/proyectos/AgendaClinica/Multiple/espacioDescubrirte/backend/app.js#L88)

```js
setInterval(async () => {
    await ejecutarRecordatoriosAutomaticos();
}, 5 * 60 * 1000);
```

Eso significa:

- cada 5 minutos el backend revisa si hay reservas que necesitan recordatorio.

Ademas, hace una primera ejecucion 10 segundos despues de levantar el servidor:

- [app.js:93](/Users/nicolas/Documents/proyectos/AgendaClinica/Multiple/espacioDescubrirte/backend/app.js#L93)

## 5. Que reservas pueden recibir recordatorio

La consulta esta en:

- [services/notificacionPreviaDia.js:202](/Users/nicolas/Documents/proyectos/AgendaClinica/Multiple/espacioDescubrirte/backend/services/notificacionPreviaDia.js#L202)

La condicion principal es:

- `estadoReserva IN ('reservada', 'CONFIRMADA')`
- `estadoPeticion <> 0`
- la cita debe estar en el futuro
- la cita debe caer dentro de las proximas 13 horas

Ademas usa estos campos para evitar duplicados:

- `recordatorio12h`
- `recordatorio6h`

Si ya estan en `1`, ese recordatorio ya fue enviado.

## 6. Como entra una reserva al flujo de recordatorios

El recordatorio no se envia en el momento de crear la reserva. Primero se guarda la cita y despues el cron la detecta cuando se acerca la hora.

La insercion de la reserva se hace en:

- [model/ReservaPacientes.js:147](/Users/nicolas/Documents/proyectos/AgendaClinica/Multiple/espacioDescubrirte/backend/model/ReservaPacientes.js#L147)

La llamada a esa insercion desde el controlador ocurre en:

- [controller/ReservaPacienteController.js:309](/Users/nicolas/Documents/proyectos/AgendaClinica/Multiple/espacioDescubrirte/backend/controller/ReservaPacienteController.js#L309)
- [controller/ReservaPacienteController.js:417](/Users/nicolas/Documents/proyectos/AgendaClinica/Multiple/espacioDescubrirte/backend/controller/ReservaPacienteController.js#L417)

Despues de crear la reserva, ese controlador envia otro correo distinto:

- `NotificacionAgendamiento.enviarCorreoConfirmacionReserva(...)`

Ese correo inicial esta en:

- [services/notificacionAgendamiento.js:2](/Users/nicolas/Documents/proyectos/AgendaClinica/Multiple/espacioDescubrirte/backend/services/notificacionAgendamiento.js#L2)

Importante:

- `services/notificacionAgendamiento.js` envia el correo de agendamiento/confirmacion.
- `services/notificacionPreviaDia.js` envia los recordatorios automaticos de 12h y 6h.

## 7. Resumen corto del flujo

1. Se crea una reserva en `ReservaPacienteController`.
2. La reserva queda guardada en `reservaPacientes`.
3. `app.js` ejecuta `ejecutarRecordatoriosAutomaticos()` cada 5 minutos.
4. Esa funcion consulta reservas proximas.
5. Si corresponde, llama a `enviarCorreoRecordatorio(...)`.
6. El correo se envia por Brevo.
7. Si el envio fue exitoso, se actualiza `recordatorio12h` o `recordatorio6h` en la BD.

## 8. Archivos clave

- [app.js](/Users/nicolas/Documents/proyectos/AgendaClinica/Multiple/espacioDescubrirte/backend/app.js)
- [services/notificacionPreviaDia.js](/Users/nicolas/Documents/proyectos/AgendaClinica/Multiple/espacioDescubrirte/backend/services/notificacionPreviaDia.js)
- [services/notificacionAgendamiento.js](/Users/nicolas/Documents/proyectos/AgendaClinica/Multiple/espacioDescubrirte/backend/services/notificacionAgendamiento.js)
- [controller/ReservaPacienteController.js](/Users/nicolas/Documents/proyectos/AgendaClinica/Multiple/espacioDescubrirte/backend/controller/ReservaPacienteController.js)
- [model/ReservaPacientes.js](/Users/nicolas/Documents/proyectos/AgendaClinica/Multiple/espacioDescubrirte/backend/model/ReservaPacientes.js)
