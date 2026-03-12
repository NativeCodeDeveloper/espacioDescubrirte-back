import { Router } from "express";
const router = Router();
import OdontogramaController from "../controller/OdontogramaController.js";



router.post('/insertarOdontograma', OdontogramaController.crearOdontograma);
router.post('/seleccionarOdontogramaEspecifico', OdontogramaController.seleccionarOdontogramaController);
router.post('/listarOdontogramas', OdontogramaController.listarOdontogramasController);
router.post('/seleccionarOdontogramaPorId', OdontogramaController.seleccionarOdontogramaPorIdController);
router.post('/actualizarDiente', OdontogramaController.actualizarDienteController);


export default router;