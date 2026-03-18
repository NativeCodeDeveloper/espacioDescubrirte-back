import dotenv from 'dotenv';
import mercadopago, * as mpNamed from 'mercadopago';
import PedidoCompras from "../model/PedidoCompras.js";
import ReservaPacientes from "../model/ReservaPacientes.js";
import Pacientes from "../model/Pacientes.js";
import NotificacionAgendamiento from "../services/notificacionAgendamiento.js";

dotenv.config();

const BACKEND = process.env.BACKEND_URL;


//SE DEFINE LA FUNCION CREATE ORDER ESTA FUNCION PERMITE CREAR LA ORDEN DE PAGO
export const createOrder = async (req, res) => {
    try {

        const {
            tituloProducto,
            precio,
            cantidad = 1,
            nombrePaciente,
            apellidoPaciente,
            rut,
            telefono,
            email,
            horasSeleccionadas,
            estadoReserva ,
            totalPago,
            id_profesional
        } = req.body;

        if (!nombrePaciente || !apellidoPaciente || !rut || !telefono || !email || !id_profesional) {
            return res.status(400).json({ error: 'Faltan datos obligatorios para la reserva' });
        }

        if (!horasSeleccionadas || !Array.isArray(horasSeleccionadas) || horasSeleccionadas.length === 0) {
            return res.status(400).json({ error: 'Debe seleccionar al menos una hora' });
        }

        if (horasSeleccionadas.length > 4) {
            return res.status(400).json({ error: 'Máximo 4 horas por semana' });
        }

        // Validar que cada slot tenga los campos necesarios
        for (const slot of horasSeleccionadas) {
            if (!slot.fecha || !slot.horaInicio || !slot.horaFin) {
                return res.status(400).json({ error: 'Cada hora seleccionada debe tener fecha, horaInicio y horaFin' });
            }
        }

        if (!totalPago || Number(totalPago) <= 0) {
            return res.status(400).json({ error: 'El monto a pagar debe ser mayor a 0' });
        }

        const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

        if (!ACCESS_TOKEN) {
            return res.status(500).json({ error: 'No hay access token configurado en el servidor' });
        }

        const items = [{
            title: tituloProducto || 'Reserva consulta',
            quantity: Number(cantidad),
            unit_price: Number(totalPago),
            currency_id: "CLP"
        }];

        // Preparar el objeto 'preference' usando los items y metadata
        const preference = {
            items,
            back_urls: {
                success: `${BACKEND}/pagosMercadoPago/success`,
                failure: `${BACKEND}/pagosMercadoPago/failure`,
                pending: `${BACKEND}/pagosMercadoPago/pending`,
            },
            metadata: {
                nombre_comprador: nombrePaciente,
                email: email,
                telefono: telefono
            },
            auto_return: "approved",
            notification_url: `${BACKEND}/pagosMercadoPago/notificacionPago`,
        };


        let resultBody;

        const client = new mpNamed.MercadoPagoConfig({ accessToken: ACCESS_TOKEN });
        const prefClient = new mpNamed.Preference(client);

        const resp = await prefClient.create({ body: preference });
        resultBody = resp;

        if (!resultBody) {
            console.error('No se pudo crear la preferencia.');
            return res.status(500).json({ error: 'Error al crear la orden de pago' });
        }

        const preference_id = resultBody.id;

        // --- INSERTAR UNA RESERVA POR CADA SLOT CON MISMO preference_id ---
        try {
            const reservaPacienteClass = new ReservaPacientes();
            const estadoPeticion = 0;

            let totalInserted = 0;
            for (const slot of horasSeleccionadas) {
                const resultadoInsert = await reservaPacienteClass.insertarReservaPacienteBackend(
                    nombrePaciente, apellidoPaciente, rut, telefono, email,
                    slot.fecha, slot.horaInicio, slot.fecha, slot.horaFin,
                    estadoReserva, preference_id, estadoPeticion, id_profesional
                );
                if (resultadoInsert && resultadoInsert.affectedRows > 0) {
                    totalInserted++;
                }
            }

            if (totalInserted === horasSeleccionadas.length) {
                console.log(`${totalInserted} reserva(s) insertada(s) con estado "pendiente pago", preference_id:`, preference_id);
                return res.status(200).json({
                    id: resultBody.id,
                    init_point: resultBody.init_point,
                    sandbox_init_point: resultBody.sandbox_init_point,
                });
            } else {
                console.error(`Solo se insertaron ${totalInserted}/${horasSeleccionadas.length} reservas`);
                return res.status(500).json({ error: 'No se pudieron insertar todas las reservas' });
            }
        } catch (errReserva) {
            console.error('Error insertando reserva desde createOrder:', errReserva);
            return res.status(500).json({ error: 'Error al insertar la reserva', details: errReserva.message });
        }

    } catch (error) {
        console.error('Error creando preferencia:', error);
        const message = error?.response?.body || error.message || 'Error al crear la orden de pago';
        return res.status(500).json({ error: 'Error al crear la orden de pago', details: message });
    }
};


/*
INFORMACIÓN RECIBIDA DESDE EL WEEBHOOK

Webhook:
-> Es un "mensaje automático" que un servicio externo envía a tu servidor cuando ocurre un evento.
-> Es una notificación en tiempo real.
-> Cuando ocurre un evento, ese servicio (Mercado Pago, Stripe, Clerk, GitHub, etc.)
-> Te manda un POST a esa URL automáticamente.
-> Tú respondes 200 OK rápido para que no lo reenvíen.
-> Tu backend recibe un body con información en el caso de mercado pago:

{
  action: "payment.updated",
  api_version: "v1",
  data: {"id":"123456"},
  date_created: "2021-11-01T02:02:02Z",
  id: "123456",
  live_mode: false,
  type: "payment",
  user_id: 2964661140
                       }

IMPORTANTE
1. paymentId = body.data.id, que es el ID del pago en Mercado Pago.
2. Se devuelve un status 200 para que Mercado Pago no re-intente el webhook.
3. Se consulta a la API de mercado pago por la transacción realizada.

 * */


export const recibirPago = async (req, res) => {
    const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

    if (!ACCESS_TOKEN) {
        return res.status(500).json({ error: 'No hay access token configurado en el servidor' });
    }

    const body = req.body;

    try {
        // 1) CASO PAYMENT
        if (body.type === 'payment' || body.topic === 'payment') {
            const paymentId = body.data && body.data.id;
            if (!paymentId) {
                console.error('No viene data.id en webhook de payment');
                return res.status(200).json({ received: true, lookup_error: true });
            }

            const url = `https://api.mercadopago.com/v1/payments/${paymentId}`;
            const resp = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${ACCESS_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            });

            const payment = await resp.json();
            return res.status(200).json({ received: true });
        }

        // 2) CASO MERCHANT_ORDER
        if (body.topic === 'merchant_order' && body.resource) {
            const merchantOrderUrl = body.resource;

            const resp = await fetch(merchantOrderUrl, {
                headers: {
                    Authorization: `Bearer ${ACCESS_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!resp.ok) {
                const txt = await resp.text();
                console.error('Error consultando merchant_order:', resp.status, txt);
                return res.status(200).json({ received: true, lookup_error: true });
            }

            const merchantOrder = await resp.json();
            console.log('MERCHANT ORDER DETAIL:', merchantOrder);

            const payments = merchantOrder.payments || [];
            const pagoAprobado = payments.some(p => p.status === 'approved');
            const preference_id = merchantOrder.preference_id;

            console.log("");
            console.log("-----------------------------------------");
            console.log('WEB HOOK ENVIA : preference_id:', preference_id);
            console.log('WEB HOOK ENVIA : pagoAprobado:', pagoAprobado);
            console.log("-----------------------------------------");
            console.log("");

            if (!pagoAprobado) {
                console.log("--------> PAGO NO APROBADO para preference_id:", preference_id);
                return res.status(200).json({ received: true, pago_aprobado: false });
            }

            try {
                // --- CAMBIAR ESTADO DE LA RESERVA A "reservada" ---
                const reservaPacientesClass = new ReservaPacientes();
                const resultadoQuery = await reservaPacientesClass.cambiarReservaPagadaVisible(preference_id);

                if (resultadoQuery && resultadoQuery.affectedRows > 0) {
                    console.log("--------> RESERVA(S) ACTUALIZADA(S) A 'reservada' para preference_id:", preference_id);

                    // Obtener TODAS las reservas asociadas a este preference_id
                    const dataCliente = await reservaPacientesClass.seleccionarFichasReservadasPreference(preference_id);
                    const reservas = Array.isArray(dataCliente) && dataCliente.length > 0 ? dataCliente : [];

                    if (reservas.length > 0) {
                        const primera = reservas[0];

                        // --- INSERTAR PACIENTE ---
                        try {
                            const instanciaPacientes = new Pacientes();
                            await instanciaPacientes.insertPacientemp(
                                primera.nombrePaciente,
                                primera.apellidoPaciente,
                                primera.rut,
                                null,
                                '---',
                                0,
                                primera.telefono ?? 'NO INGRESADO',
                                primera.email ?? 'NO INGRESADO',
                                '---',
                                '---'
                            );
                            console.log("Paciente insertado/verificado para:", primera.rut);
                        } catch (errPaciente) {
                            console.error("Error insertando paciente:", errPaciente);
                        }

                        // Construir resumen combinado de todas las citas para el email
                        const resumenFechas = reservas.map(r => `${r.fechaInicio} ${r.horaInicio}-${r.horaFinalizacion}`).join(' | ');
                        const idsReservas = reservas.map(r => r.id_reserva).join(', ');

                        // --- ENVIAR CORREO DE AGENDAMIENTO AL PACIENTE (con la primera reserva como base) ---
                        try {
                            await NotificacionAgendamiento.enviarCorreoConfirmacionReserva({
                                to: primera.email,
                                nombrePaciente: primera.nombrePaciente,
                                apellidoPaciente: primera.apellidoPaciente,
                                rut: primera.rut,
                                telefono: primera.telefono,
                                fechaInicio: reservas.length > 1 ? resumenFechas : primera.fechaInicio,
                                horaInicio: reservas.length > 1 ? `${reservas.length} sesiones` : primera.horaInicio,
                                fechaFinalizacion: reservas.length > 1 ? '' : primera.fechaFinalizacion,
                                horaFinalizacion: reservas.length > 1 ? '' : primera.horaFinalizacion,
                                estadoReserva: 'reservada',
                                id_reserva: primera.id_reserva
                            });
                            console.log('Correo de agendamiento enviado al paciente:', primera.email, `(${reservas.length} cita(s))`);
                        } catch (errMailPaciente) {
                            console.error('Error enviando correo de agendamiento al paciente:', errMailPaciente);
                        }

                        // --- NOTIFICAR AL EQUIPO ---
                        try {
                            await NotificacionAgendamiento.enviarCorreoConfirmacionEquipo({
                                nombrePaciente: primera.nombrePaciente,
                                apellidoPaciente: primera.apellidoPaciente,
                                fechaInicio: reservas.length > 1 ? resumenFechas : primera.fechaInicio,
                                horaInicio: reservas.length > 1 ? `${reservas.length} sesiones` : primera.horaInicio,
                                accion: 'AGENDADA',
                                id_reserva: reservas.length > 1 ? idsReservas : primera.id_reserva
                            });
                            console.log('Notificacion enviada al equipo para reserva(s):', idsReservas);
                        } catch (errMailEquipo) {
                            console.error('Error enviando notificacion al equipo:', errMailEquipo);
                        }
                    } else {
                        console.warn('No se encontro reserva para preference_id:', preference_id);
                    }

                    return res.status(200).json({ received: true });

                } else {
                    console.log("--------> NO HAY RESERVA ASOCIADA AL preference_id:", preference_id);
                    return res.status(200).json({ received: true });
                }

            } catch (error) {
                console.error('Error al validar preference_id:', error);
                return res.status(200).json({ received: true, error: true });
            }
        }

        // 3) CUALQUIER OTRO TIPO
        console.log('Webhook no manejado. topic/type:', body.topic, body.type);
        return res.status(200).json({ received: true, ignored: true });

    } catch (err) {
        console.error('Error en recibirPago:', err);
        return res.status(500).json({ error: 'Error interno al procesar webhook' });
    }
};
