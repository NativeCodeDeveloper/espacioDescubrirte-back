export default class NotificacionAgendamiento {
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
                                                     id_reserva
                                                 }) {
        const { BREVO_API_KEY, CORREO_RECEPTOR, NOMBRE_EMPRESA, API_URL } = process.env;

        // No romper el flujo principal si falta configuración
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

        // En Brevo, el 'from' debe ser un remitente verificado.
        const fromEmail = process.env.CORREO_REMITENTE || "desarrollo.native.code@gmail.com";
        const fromName = NOMBRE_EMPRESA || "Sistema de Agendamiento";

        if (!fromEmail) {
            console.warn("[MAIL] CORREO_REMITENTE no configurado. Correo no enviado.");
            return;
        }

        const subject = `Tu cita en ${fromName} ha sido registrada`;

        // Construir URLs
        const baseUrl = process.env.BACKEND_URL || "https://siluetachic.nativecode.cl";
        const urlConfirmar = `${baseUrl}/notificacion/confirmar?id_reserva=${id_reserva}&nombrePaciente=${encodeURIComponent(nombrePaciente)}&apellidoPaciente=${encodeURIComponent(apellidoPaciente)}&fechaInicio=${encodeURIComponent(fechaInicio)}&horaInicio=${encodeURIComponent(horaInicio)}`;
        const urlCancelar = `${baseUrl}/notificacion/cancelar?id_reserva=${id_reserva}&nombrePaciente=${encodeURIComponent(nombrePaciente)}&apellidoPaciente=${encodeURIComponent(apellidoPaciente)}&fechaInicio=${encodeURIComponent(fechaInicio)}&horaInicio=${encodeURIComponent(horaInicio)}`;
        const empresa = process.env.NOMBRE_EMPRESA || "Sistema de Agendamiento";

        const text =
            `¡Tu cita en ${empresa} ha sido registrada! 🩺🏥\n\n` +
            `Detalle de tu reserva:\n` +
            `• Nombre: ${nombrePaciente} ${apellidoPaciente}\n` +
            `• RUT: ${rut}\n` +
            `• Teléfono: ${telefono}\n` +
            `• Inicio: ${fechaInicio} ${horaInicio}\n` +
            `• Término: ${fechaFinalizacion} ${horaFinalizacion}\n` +
            `• Estado: ${estadoReserva}\n\n` +
            `Te recordamos confirmar tu cita a través de los enlaces de este correo.\n` +
            `En caso de no poder asistir, te pedimos cancelarla con anticipación para poder reasignar ese horario a otro paciente.\n` +
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
            <tr><td style="padding: 8px;"><b>Inicio:</b></td><td style="padding: 8px;">${fechaInicio} ${horaInicio}</td></tr>
            <tr><td style="padding: 8px;"><b>Término:</b></td><td style="padding: 8px;">${fechaFinalizacion} ${horaFinalizacion}</td></tr>
            <tr><td style="padding: 8px;"><b>Estado:</b></td><td style="padding: 8px;">${estadoReserva}</td></tr>
          </table>

          <div style="text-align: center; margin: 30px 0;">
            <p style="margin-bottom: 15px; font-weight: bold; color: #374151;">¿Confirmas tu asistencia?</p>
            <a href="${urlConfirmar}" style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 0 10px; font-weight: bold;">Confirmar Cita</a>
            <a href="${urlCancelar}" style="display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 0 10px; font-weight: bold;">Cancelar Cita</a>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;" />
          <p style="font-size: 13px; color: #6b7280;">
            En caso de no poder asistir, te pedimos cancelar tu cita con anticipación para poder reasignar ese horario a otro paciente.
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

        // Node 18+ trae fetch. Si tu runtime es más antiguo, actualiza Node.
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

    // Envía notificación al equipo cuando un paciente confirma, cancela o agenda una cita
    static async enviarCorreoConfirmacionEquipo({
                                                    nombrePaciente,
                                                    apellidoPaciente,
                                                    fechaInicio,
                                                    horaInicio,
                                                    accion, // "CONFIRMADA", "CANCELADA" o "AGENDADA"
                                                    id_reserva
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
                    `• Fecha: ${fechaInicio}\n` +
                    `• Hora: ${horaInicio}\n\n` +
                    `${detalleAccion}`;
                break;

            case "AGENDADA":
                subject = `🗓️ Nueva Reserva (Agenda Clínica) - ${nombrePaciente} ${apellidoPaciente}`;
                textoAccion = "NUEVA RESERVA";
                iconoAccion = "🗓️";
                colorAccion = "#3b82f6"; // Azul para nueva reserva
                detalleAccion = "La reserva fue creada manualmente desde la agenda clínica.";
                text = `Se ha creado una nueva reserva desde la agenda clínica para ${nombrePaciente} ${apellidoPaciente}.\n\n` +
                    `• ID Reserva: ${id_reserva}\n` +
                    `• Fecha: ${fechaInicio}\n` +
                    `• Hora: ${horaInicio}\n\n` +
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
                    `• Fecha: ${fechaInicio}\n` +
                    `• Hora: ${horaInicio}\n\n` +
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
          <p><b>Fecha:</b> ${fechaInicio}</p>
          <p><b>Hora:</b> ${horaInicio}</p>
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
