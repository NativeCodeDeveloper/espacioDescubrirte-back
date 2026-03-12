import { Router } from "express";
const router = Router();
import BloqueoAgendaController from "../controller/BloqueoAgendaController.js";


router.post('/InsertarBloqueo', BloqueoAgendaController.InsertarBloqueoController);
router.post('/eliminarBloqueo', BloqueoAgendaController.eliminarBloqueoController);
router.post('/seleccionarBloqueosPorProfesional', BloqueoAgendaController.seleccionarBloqueosPorProfesional);
router.post('/seleccionarBloqueosEntreFechas', BloqueoAgendaController.seleccionarBloqueosEntreFechasController);
router.get('/seleccionarTodos', BloqueoAgendaController.seleccionarTodosLosBloqueosController);




export default router;