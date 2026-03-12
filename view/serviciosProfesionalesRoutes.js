import {Router} from 'express';
import ServiciosProfesionalesController from '../controller/ServiciosProfesionalesController.js';

const router = Router();

router.post('/insertarServicioProfesional', ServiciosProfesionalesController.insertarServicioProfesionalController);
router.post('/actualizarServicioProfesional', ServiciosProfesionalesController.actualizarServicioProfesionalController);
router.post('/seleccionarServicioProfesional', ServiciosProfesionalesController.seleccionarServicioProfesionalController);
router.post('/eliminarServicioProfesional', ServiciosProfesionalesController.eliminarServicioProfesionalController);
router.get('/seleccionarTodosServiciosProfesionales', ServiciosProfesionalesController.seleccionarTodosLosServiciosProfesionales);

export default router;
