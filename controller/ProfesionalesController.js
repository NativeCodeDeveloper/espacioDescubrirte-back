import Profesionales from '../model/Profesionales.js';

export default class ProfesionalesController {

    constructor() {
    }

    //FUNCION PARA INSERTAR UN NUEVO PROFESIONAL
    static async insertarProfesionalController(req, res) {
        try{
            const { nombreProfesional, descripcionProfesional } = req.body;
            if (!nombreProfesional || !descripcionProfesional) {
                return res.status(400).json({ message: "sindata" });
            }
            const profesionalClass = new Profesionales();
            const resultado = await profesionalClass.insertarProfesionalModel(nombreProfesional, descripcionProfesional);
            if (resultado.affectedRows > 0) {
                res.status(200).json({ message: true });
            }else {
                res.status(500).json({ message: false });
            }
        }catch (error) {
            res.status(500).json({ message: "serverError" });
        }

    }

    //FUNCION PARA ACTUALIZAR UN PROFESIONAL
    static async actualizarProfesionalController(req, res) {
        try{
            const {nombreProfesional, descripcionProfesional, id_profesional} = req.body;
            if (!nombreProfesional || !descripcionProfesional || !id_profesional) {
                return res.status(400).json({ message: "sindata" });
            }
            const profesionalClass = new Profesionales();
            const resultado = await profesionalClass.actualizarProfesionalModel(nombreProfesional, descripcionProfesional, id_profesional);

            if (resultado.affectedRows > 0) {
                res.status(200).json({ message: true });
            }else {
                res.status(500).json({ message: false });
            }
        }catch (error) {
            res.status(500).json({ message: "serverError" });
        }
    }


    //FUNCION PARA SELECCIONAR POR ID UN NUEVO PROFESIONAL
    static async seleccionarProfesionalController(req, res) {
        try{
            const {id_profesional} = req.body;
            if (!id_profesional) {
                return res.status(400).json({ message: "sindata" });
            }
            const profesionalClass = new Profesionales();
            const resultado = await profesionalClass.seleccionarProfesionalPorID(id_profesional);

            if (resultado) {
                res.status(200).json(resultado);
            }else {
                res.status(500).json({ message: false });
            }
        }catch (error) {
            res.status(500).json({ message: "serverError" });
        }


    }
    //FUNCION PARA ELIMINAR LOGICAMENTE CAMBIANDO ESTADO DE CERO A UNO UN PROFESIONAL
    static async eliminarProfesionalController(req, res) {
        try {
            const {id_profesional} = req.body;
            if (!id_profesional) {
                return res.status(400).json({message: "sindata"});
            }
            const profesionalClass = new Profesionales();
            const resultado = await profesionalClass.eliminarProfesionalPorId(id_profesional);

            if (resultado.affectedRows > 0) {
                res.status(200).json({message: true});
            } else {
                res.status(500).json({message: false});
            }
        } catch (error) {
            res.status(500).json({message: "serverError"});
        }
    }


    //FUNCION PARA SELECCIONAR LISTADO DE PROFESIONALES
    static async seleccionarTodosLosProfesionales(req, res) {
        try{
            const profesionalClass = new Profesionales();
            const resultado = await profesionalClass.seleccionarProfesionales();

            if (resultado) {
                res.status(200).json(resultado);
            } else {
                res.status(500).json({message: false});
            }
        } catch (error) {
            res.status(500).json({message: "serverError"});
        }
    }

}