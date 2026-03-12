import {Router} from 'express';
import ProfesionalesController from '../controller/ProfesionalesController.js';

const router = Router();

router.post('/insertarProfesional', ProfesionalesController.insertarProfesionalController);
router.post('/actualizarProfesional', ProfesionalesController.actualizarProfesionalController);
router.post('/seleccionarProfesional', ProfesionalesController.seleccionarProfesionalController);
router.post('/eliminarProfesional', ProfesionalesController.eliminarProfesionalController);
router.get('/seleccionarTodosProfesionales', ProfesionalesController.seleccionarTodosLosProfesionales);

export default router;





