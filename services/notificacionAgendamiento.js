export default class NotificacionAgendamiento {
    static formatearFechaCorreo(fecha) {
        if (!fecha) return "";

        const fechaObj = fecha instanceof Date ? fecha : new Date(fecha);
        if (Number.isNaN(fechaObj.getTime())) {
            return String(fecha);
        }

        return fechaObj.toLocaleDateString("es-CL", {
            weekday: "short",
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    }

    static normalizarSesiones(sesiones = []) {
        if (!Array.isArray(sesiones)) return [];

        return sesiones.map((sesion) => ({
            fecha: NotificacionAgendamiento.formatearFechaCorreo(sesion.fechaInicio),
            horaInicio: sesion.horaInicio || "",
            horaFinalizacion: sesion.horaFinalizacion || ""
        }));
    }

    static construirDetalleSesionesTexto(sesiones = []) {
        return sesiones
            .map((sesion, index) => `${index + 1}. ${sesion.fecha} ${sesion.horaInicio}-${sesion.horaFinalizacion}`)
            .join("\n");
    }

    static construirDetalleSesionesHtml(sesiones = []) {
        return `
          <table style="width: 100%; border-collapse: collapse;">
            ${sesiones.map((sesion, index) => `
              <tr>
                <td style="padding: 6px 0; border-bottom: 1px solid #d1d5db; width: 32px;">${index + 1}.</td>
                <td style="padding: 6px 0; border-bottom: 1px solid #d1d5db;">${sesion.fecha}</td>
                <td style="padding: 6px 0; border-bottom: 1px solid #d1d5db; text-align: right;">${sesion.horaInicio}-${sesion.horaFinalizacion}</td>
              </tr>
            `).join("")}
          </table>
        `;
    }

    static async enviarCorreoConfirmacionReserva({
        to,
        nombrePaciente,
        apellidoPaciente,
        rut,
        telefono,
        fechaInicio,
        horaInicio,
        fechaFinalizacion,
        horaFinalizacion,
        estadoReserva,
        id_reserva,
        sesiones = []
    }) {
        const { BREVO_API_KEY, NOMBRE_EMPRESA } = process.env;

        if (!BREVO_API_KEY) {
            console.warn("[MAIL] BREVO_API_KEY no configurada. Correo no enviado.");
            return;
        }

        if (!to) {
            console.warn("[MAIL] Destinatario vacío. Correo no enviado.");
            return;
        }

        const emailOk = typeof to === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to);
        if (!emailOk) {
            console.warn("[MAIL] Email inválido:", to, "Correo no enviado.");
            return;
        }

        const fromEmail = process.env.CORREO_REMITENTE || "desarrollo.native.code@gmail.com";
        const fromName = NOMBRE_EMPRESA || "Sistema de Agendamiento";

        if (!fromEmail) {
            console.warn("[MAIL] CORREO_REMITENTE no configurado. Correo no enviado.");
            return;
        }

        const subject = `Tu cita en ${fromName} ha sido registrada`;
        const empresa = process.env.NOMBRE_EMPRESA || "Sistema de Agendamiento";
        const baseUrl = process.env.BACKEND_URL || "https://siluetachic.nativecode.cl";
        const sesionesNormalizadas = NotificacionAgendamiento.normalizarSesiones(sesiones);
        const tieneMultiplesSesiones = sesionesNormalizadas.length > 1;
        const fechaInicioFormateada = NotificacionAgendamiento.formatearFechaCorreo(fechaInicio);
        const fechaFinalizacionFormateada = NotificacionAgendamiento.formatearFechaCorreo(fechaFinalizacion);
        const detalleSesionesTexto = NotificacionAgendamiento.construirDetalleSesionesTexto(sesionesNormalizadas);
        const detalleSesionesHtml = NotificacionAgendamiento.construirDetalleSesionesHtml(sesionesNormalizadas);

        const urlConfirmar = `${baseUrl}/notificacion/confirmar?id_reserva=${id_reserva}&nombrePaciente=${encodeURIComponent(nombrePaciente)}&apellidoPaciente=${encodeURIComponent(apellidoPaciente)}&fechaInicio=${encodeURIComponent(fechaInicioFormateada)}&horaInicio=${encodeURIComponent(horaInicio)}`;
        const urlCancelar = `${baseUrl}/notificacion/cancelar?id_reserva=${id_reserva}&nombrePaciente=${encodeURIComponent(nombrePaciente)}&apellidoPaciente=${encodeURIComponent(apellidoPaciente)}&fechaInicio=${encodeURIComponent(fechaInicioFormateada)}&horaInicio=${encodeURIComponent(horaInicio)}`;

        const text =
            `¡Tu cita en ${empresa} ha sido registrada! 🩺🏥\n\n` +
            `Detalle de tu reserva:\n` +
            `• Nombre: ${nombrePaciente} ${apellidoPaciente}\n` +
            `• RUT: ${rut}\n` +
            `• Teléfono: ${telefono}\n` +
            (
                tieneMultiplesSesiones
                    ? `• Sesiones agendadas: ${sesionesNormalizadas.length}\n${detalleSesionesTexto}\n`
                    : `• Inicio: ${fechaInicioFormateada} ${horaInicio}\n` +
                      `• Término: ${fechaFinalizacionFormateada} ${horaFinalizacion}\n`
            ) +
            `• Estado: ${estadoReserva}\n\n` +
            `Te recordamos confirmar tu cita a través de los enlaces de este correo.\n` +
            `En caso de no poder asistir, te pedimos cancelarla con anticipación para poder reasignar ese horario a otro usuario.\n` +
            `¡Muchas gracias por tu colaboración! 🗓️\n\n` +
            `Saludos, ${empresa}.`;

        const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111; max-width: 600px; margin: 0 auto;">
        <div style="background: #667eea; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">Tu cita en ${fromName} ha sido registrada</h2>
        </div>

        <div style="padding: 20px; background: #ffffff; border: 1px solid #e5e7eb; border-top: none;">
          <p>Hola <b>${nombrePaciente} ${apellidoPaciente}</b>,</p>
          <p>Te informamos que tu cita ha sido registrada exitosamente. A continuación el detalle:</p>

          <table style="width: 100%; background: #f3f4f6; padding: 15px; border-radius: 8px; border-collapse: collapse;">
            <tr><td style="padding: 8px;"><b>RUT:</b></td><td style="padding: 8px;">${rut}</td></tr>
            <tr><td style="padding: 8px;"><b>Teléfono:</b></td><td style="padding: 8px;">${telefono}</td></tr>
            ${tieneMultiplesSesiones
                ? `
            <tr>
              <td style="padding: 8px; vertical-align: top;"><b>Sesiones:</b></td>
              <td style="padding: 8px;">${detalleSesionesHtml}</td>
            </tr>
            `
                : `
            <tr><td style="padding: 8px;"><b>Inicio:</b></td><td style="padding: 8px;">${fechaInicioFormateada} ${horaInicio}</td></tr>
            <tr><td style="padding: 8px;"><b>Término:</b></td><td style="padding: 8px;">${fechaFinalizacionFormateada} ${horaFinalizacion}</td></tr>
            `}
            <tr><td style="padding: 8px;"><b>Estado:</b></td><td style="padding: 8px;">${estadoReserva}</td></tr>
          </table>

          <div style="text-align: center; margin: 30px 0;">
            <p style="margin-bottom: 15px; font-weight: bold; color: #374151;">¿Confirmas tu asistencia?</p>
            <a href="${urlConfirmar}" style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 0 10px; font-weight: bold;">Confirmar Cita</a>
            <a href="${urlCancelar}" style="display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 0 10px; font-weight: bold;">Cancelar Cita</a>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;" />
          <p style="font-size: 13px; color: #6b7280;">
            En caso de no poder asistir, te pedimos cancelar tu cita con anticipación para poder reasignar ese horario a otro usuario.
          </p>
        </div>

        <div style="background: #f9fafb; padding: 15px; text-align: center; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="margin: 0; color: #6b7280; font-size: 13px;">
            Si tienes dudas, responde este correo o contáctanos directamente.
          </p>
          <p style="margin: 8px 0 0; color: #667eea; font-weight: bold; font-size: 14px;">
            ${fromName}
          </p>
        </div>
      </div>
    `;

        const payload = {
            sender: { name: fromName, email: fromEmail },
            to: [{ email: to }],
            subject,
            textContent: text,
            htmlContent: html
        };

        if (typeof fetch !== "function") {
            console.warn("[MAIL] Tu Node no tiene fetch (requiere Node 18+). Correo no enviado.");
            return;
        }

        console.log("[MAIL] Enviando a:", to, "| id_reserva:", id_reserva, "| from:", fromEmail);

        const resp = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                accept: "application/json",
                "content-type": "application/json",
                "api-key": BREVO_API_KEY
            },
            body: JSON.stringify(payload)
        });

        if (!resp.ok) {
            const errText = await resp.text().catch(() => "");
            console.error("[MAIL] Brevo error:", resp.status, errText);
            return;
        }

        console.log("[MAIL] Enviado OK a:", to, "| id_reserva:", id_reserva);
    }

    static async enviarCorreoConfirmacionEquipo({
        nombrePaciente,
        apellidoPaciente,
        fechaInicio,
        horaInicio,
        accion,
        id_reserva,
        sesiones = []
    }) {
        const { BREVO_API_KEY, NOMBRE_EMPRESA } = process.env;

        if (!BREVO_API_KEY) {
            console.warn("[MAIL EQUIPO] BREVO_API_KEY no configurada. Correo no enviado.");
            return;
        }

        const fromEmail = process.env.CORREO_REMITENTE || "desarrollo.native.code@gmail.com";
        const fromName = NOMBRE_EMPRESA || "Sistema de Agendamiento";

        if (!fromEmail) {
            console.warn("[MAIL EQUIPO] CORREO_REMITENTE no configurado. Correo no enviado.");
            return;
        }

        const destinatario = process.env.CORREO_RECEPTOR || "siluetachicestudio@gmail.com";
        const sesionesNormalizadas = NotificacionAgendamiento.normalizarSesiones(sesiones);
        const tieneMultiplesSesiones = sesionesNormalizadas.length > 1;
        const fechaInicioFormateada = NotificacionAgendamiento.formatearFechaCorreo(fechaInicio);
        const detalleSesionesTexto = NotificacionAgendamiento.construirDetalleSesionesTexto(sesionesNormalizadas);
        const detalleSesionesHtml = NotificacionAgendamiento.construirDetalleSesionesHtml(sesionesNormalizadas);

        let subject, text, colorAccion, iconoAccion, textoAccion, detalleAccion;

        switch (accion) {
            case "CONFIRMADA":
                subject = `✅ Cita CONFIRMADA por ${nombrePaciente} ${apellidoPaciente}`;
                textoAccion = "CONFIRMADA";
                iconoAccion = "✅";
                colorAccion = "#10b981";
                detalleAccion = "El paciente confirmó su cita desde el enlace del correo.";
                text = `El paciente ${nombrePaciente} ${apellidoPaciente} ha CONFIRMADO su cita.\n\n` +
                    `• ID Reserva: ${id_reserva}\n` +
                    (
                        tieneMultiplesSesiones
                            ? `• Sesiones: ${sesionesNormalizadas.length}\n${detalleSesionesTexto}\n\n`
                            : `• Fecha: ${fechaInicioFormateada}\n• Hora: ${horaInicio}\n\n`
                    ) +
                    `${detalleAccion}`;
                break;

            case "AGENDADA":
                subject = `🗓️ Nueva Reserva (Agenda Clínica) - ${nombrePaciente} ${apellidoPaciente}`;
                textoAccion = "NUEVA RESERVA";
                iconoAccion = "🗓️";
                colorAccion = "#3b82f6";
                detalleAccion = "La reserva fue creada manualmente desde la agenda clínica.";
                text = `Se ha creado una nueva reserva desde la agenda clínica para ${nombrePaciente} ${apellidoPaciente}.\n\n` +
                    `• ID Reserva: ${id_reserva}\n` +
                    (
                        tieneMultiplesSesiones
                            ? `• Sesiones: ${sesionesNormalizadas.length}\n${detalleSesionesTexto}\n\n`
                            : `• Fecha: ${fechaInicioFormateada}\n• Hora: ${horaInicio}\n\n`
                    ) +
                    `${detalleAccion}`;
                break;

            case "CANCELADA":
            default:
                subject = `❌ Cita CANCELADA por ${nombrePaciente} ${apellidoPaciente}`;
                textoAccion = "CANCELADA";
                iconoAccion = "❌";
                colorAccion = "#ef4444";
                detalleAccion = "El paciente canceló su cita desde el enlace del correo.";
                text = `El paciente ${nombrePaciente} ${apellidoPaciente} ha CANCELADO su cita.\n\n` +
                    `• ID Reserva: ${id_reserva}\n` +
                    (
                        tieneMultiplesSesiones
                            ? `• Sesiones: ${sesionesNormalizadas.length}\n${detalleSesionesTexto}\n\n`
                            : `• Fecha: ${fechaInicioFormateada}\n• Hora: ${horaInicio}\n\n`
                    ) +
                    `${detalleAccion}`;
                break;
        }

        const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
        <div style="background: ${colorAccion}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0; font-size: 24px;">${iconoAccion} Cita ${textoAccion}</h2>
        </div>
        <div style="padding: 20px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
          <p><b>Paciente:</b> ${nombrePaciente} ${apellidoPaciente}</p>
          <p><b>ID Reserva:</b> ${id_reserva}</p>
          ${tieneMultiplesSesiones
            ? `
          <p><b>Sesiones:</b></p>
          ${detalleSesionesHtml}
          `
            : `
          <p><b>Fecha:</b> ${fechaInicioFormateada}</p>
          <p><b>Hora:</b> ${horaInicio}</p>
          `}
          <p><b>Acción:</b> ${detalleAccion}</p>
          <hr style="border: none; border-top: 1px solid #d1d5db; margin: 20px 0;" />
          <p style="font-size: 12px; color: #6b7280;">
            Este es un correo automático del sistema de agendamiento de ${fromName}.
          </p>
        </div>
      </div>
    `;

        const payload = {
            sender: { name: fromName, email: fromEmail },
            to: [{ email: destinatario }],
            subject,
            textContent: text,
            htmlContent: html
        };

        if (typeof fetch !== "function") {
            console.warn("[MAIL EQUIPO] Tu Node no tiene fetch (requiere Node 18+). Correo no enviado.");
            return;
        }

        const resp = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                accept: "application/json",
                "content-type": "application/json",
                "api-key": BREVO_API_KEY
            },
            body: JSON.stringify(payload)
        });

        if (!resp.ok) {
            const errText = await resp.text().catch(() => "");
            console.error("[MAIL EQUIPO] Brevo error:", resp.status, errText);
            return;
        }

        console.log(`[MAIL EQUIPO] Notificación enviada: Cita ${textoAccion}`);
    }
}
