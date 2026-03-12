import {Router} from 'express';
import ReservaPacienteController from "../controller/ReservaPacienteController.js";

const router = Router();

// Rutas para gestión de reservas existentes
router.get("/seleccionarReservados", ReservaPacienteController.seleccionarReservados);
router.post("/seleccionarSegunEstado", ReservaPacienteController.seleccionarSegunEstado);
router.post("/insertarReservaPacienteFicha", ReservaPacienteController.insertarReservaPaciente); // INSERTAR PACIENTE SIN FICHA PARA CAMBIARA MODO FICHA DEBE CAMBIARSE EL METODO
router.post("/validar", ReservaPacienteController.validacionDisponibilidad);
router.post("/actualizarEstado", ReservaPacienteController.actualizarEstado);
router.post("/seleccionarNombre", ReservaPacienteController.buscarSimilitudNombre);
router.post("/seleccionarRut", ReservaPacienteController.buscarSimilitudRut);
router.post("/buscarEntreFechas", ReservaPacienteController.buscarEntreFechas);
router.post("/eliminarReserva", ReservaPacienteController.eliminarReserva);
router.post("/seleccionarEspecifica", ReservaPacienteController.seleccionarReservaEspecifica);
router.post("/actualizarReservacion", ReservaPacienteController.actualizarInformacionReserva);
router.post("/seleccionarPorProfesional", ReservaPacienteController.seleccionarReservaSegunId_Profesional);



export default router;
