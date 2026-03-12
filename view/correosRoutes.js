import { Router } from "express";
import correosAutomaticosController from "../controller/CorreosAutomaticosController.js";

const router = Router();

router.post("/contacto", (req, res) => correosAutomaticosController.enviarFormularioContacto(req, res));
router.post("/comprobante", (req, res) => correosAutomaticosController.enviarComprobanteCompra(req, res));
router.post("/seguimiento", (req, res) => correosAutomaticosController.enviarSeguimiento(req, res));

export default router;