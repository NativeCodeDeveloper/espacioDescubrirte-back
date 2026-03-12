import {Router} from 'express';
import TarifasProfesionalController from '../controller/TarifasProfesionalController.js';

const router = Router();

router.post('/insertarTarifaProfesional', TarifasProfesionalController.insertarTarifaProfesionalController);
router.post('/seleccionarTarifaProfesional', TarifasProfesionalController.seleccionarTarifaProfesionalController);
router.post('/seleccionarTarifasPorProfesional', TarifasProfesionalController.seleccionarTarifasPorProfesional);
router.post('/actualizarTarifaProfesional', TarifasProfesionalController.actualizarTarifaProfesionalController);
router.post('/eliminarTarifaProfesional', TarifasProfesionalController.eliminarTarifaProfesionalController);
router.get('/seleccionarTodasTarifasProfesionales', TarifasProfesionalController.seleccionarTodasLasTarifasProfesionales);
router.get('/seleccionarTodasTarifasConNombres', TarifasProfesionalController.seleccionarTodasLasTarifasProfesionalesConNombre);

export default router;
