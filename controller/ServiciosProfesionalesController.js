import ServiciosProfesionales from '../model/ServiciosProfesionales.js';

export default class ServiciosProfesionalesController {

    constructor() {
    }

    //FUNCION PARA INSERTAR UN NUEVO SERVICIO PROFESIONAL
    static async insertarServicioProfesionalController(req, res) {
        try{
            const { nombreServicio, descripcionServicio } = req.body;
            if (!nombreServicio || !descripcionServicio) {
                return res.status(400).json({ message: "sindata" });
            }
            const servicioClass = new ServiciosProfesionales();
            const resultado = await servicioClass.insertarServicioProfesionalModel(nombreServicio, descripcionServicio);
            if (resultado.affectedRows > 0) {
                res.status(200).json({ message: true });
            }else {
                res.status(500).json({ message: false });
            }
        }catch (error) {
            res.status(500).json({ message: "serverError" });
        }
    }

    //FUNCION PARA ACTUALIZAR UN SERVICIO PROFESIONAL
    static async actualizarServicioProfesionalController(req, res) {
        try{
            const { nombreServicio, descripcionServicio, id_servicioProfesional } = req.body;
            if (!nombreServicio || !descripcionServicio || !id_servicioProfesional) {
                return res.status(400).json({ message: "sindata" });
            }
            const servicioClass = new ServiciosProfesionales();
            const resultado = await servicioClass.actualizarServicioProfesionalModel(nombreServicio, descripcionServicio, id_servicioProfesional);

            if (resultado.affectedRows > 0) {
                res.status(200).json({ message: true });
            }else {
                res.status(500).json({ message: false });
            }
        }catch (error) {
            res.status(500).json({ message: "serverError" });
        }
    }

    //FUNCION PARA SELECCIONAR POR ID UN SERVICIO PROFESIONAL
    static async seleccionarServicioProfesionalController(req, res) {
        try{
            const { id_servicioProfesional } = req.body;
            if (!id_servicioProfesional) {
                return res.status(400).json({ message: "sindata" });
            }
            const servicioClass = new ServiciosProfesionales();
            const resultado = await servicioClass.seleccionarServicioProfesionalPorID(id_servicioProfesional);

            if (resultado) {
                res.status(200).json(resultado);
            }else {
                res.status(500).json({ message: false });
            }
        }catch (error) {
            res.status(500).json({ message: "serverError" });
        }
    }

    //FUNCION PARA ELIMINAR LOGICAMENTE UN SERVICIO PROFESIONAL
    static async eliminarServicioProfesionalController(req, res) {
        try {
            const { id_servicioProfesional } = req.body;
            if (!id_servicioProfesional) {
                return res.status(400).json({ message: "sindata" });
            }
            const servicioClass = new ServiciosProfesionales();
            const resultado = await servicioClass.eliminarServicioProfesionalPorId(id_servicioProfesional);

            if (resultado.affectedRows > 0) {
                res.status(200).json({ message: true });
            } else {
                res.status(500).json({ message: false });
            }
        } catch (error) {
            res.status(500).json({ message: "serverError" });
        }
    }

    //FUNCION PARA SELECCIONAR LISTADO DE SERVICIOS PROFESIONALES
    static async seleccionarTodosLosServiciosProfesionales(req, res) {
        try{
            const servicioClass = new ServiciosProfesionales();
            const resultado = await servicioClass.seleccionarServiciosProfesionales();

            if (resultado) {
                res.status(200).json(resultado);
            } else {
                res.status(500).json({ message: false });
            }
        } catch (error) {
            res.status(500).json({ message: "serverError" });
        }
    }

}
