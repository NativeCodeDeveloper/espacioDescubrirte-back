import Tarifas_profesional from '../model/Tarifas_profesional.js';

export default class TarifasProfesionalController {

    constructor() {
    }

    //FUNCION PARA INSERTAR UNA NUEVA TARIFA PROFESIONAL
    static async insertarTarifaProfesionalController(req, res) {
        try{
            const { profesional_id, servicio_id, precio, duracion_min } = req.body;
            if (!profesional_id || !servicio_id || !precio || !duracion_min) {
                return res.status(400).json({ message: "sindata" });
            }
            const tarifaClass = new Tarifas_profesional();
            const resultado = await tarifaClass.insertarTarifaProfesionalModel(profesional_id, servicio_id, precio, duracion_min);
            if (resultado.affectedRows > 0) {
                res.status(200).json({ message: true });
            }else {
                res.status(500).json({ message: false });
            }
        }catch (error) {
            res.status(500).json({ message: "serverError" });
        }
    }

    //FUNCION PARA ACTUALIZAR UNA TARIFA PROFESIONAL
    static async actualizarTarifaProfesionalController(req, res) {
        try{
            const { profesional_id, servicio_id, precio, duracion_min, id_tarifaProfesional } = req.body;
            if (!profesional_id || !servicio_id || !precio || !duracion_min || !id_tarifaProfesional) {
                return res.status(400).json({ message: "sindata" });
            }
            const tarifaClass = new Tarifas_profesional();
            const resultado = await tarifaClass.actualizarTarifaProfesionalModel(profesional_id, servicio_id, precio, duracion_min, id_tarifaProfesional);

            if (resultado.affectedRows > 0) {
                res.status(200).json({ message: true });
            }else {
                res.status(500).json({ message: false });
            }
        }catch (error) {
            res.status(500).json({ message: "serverError" });
        }
    }

    //FUNCION PARA SELECCIONAR POR ID UNA TARIFA PROFESIONAL
    static async seleccionarTarifaProfesionalController(req, res) {
        try{
            const { id_tarifaProfesional } = req.body;
            console.log(req.body)

            if (!id_tarifaProfesional) {
                return res.status(400).json({ message: "sindata" });
            }
            const tarifaClass = new Tarifas_profesional();
            const resultado = await tarifaClass.seleccionarTarifaProfesionalPorID(id_tarifaProfesional);

            if (resultado) {
                res.status(200).json(resultado);
            }else {
                res.status(500).json({ message: false });
            }
        }catch (error) {
            res.status(500).json({ message: "serverError" });
        }
    }

    //FUNCION PARA ELIMINAR LOGICAMENTE UNA TARIFA PROFESIONAL
    static async eliminarTarifaProfesionalController(req, res) {
        try {
            const { id_tarifaProfesional } = req.body;
            if (!id_tarifaProfesional) {
                return res.status(400).json({ message: "sindata" });
            }
            const tarifaClass = new Tarifas_profesional();
            const resultado = await tarifaClass.eliminarTarifaProfesionalPorId(id_tarifaProfesional);

            if (resultado.affectedRows > 0) {
                res.status(200).json({ message: true });
            } else {
                res.status(500).json({ message: false });
            }
        } catch (error) {
            res.status(500).json({ message: "serverError" });
        }
    }

    //FUNCION PARA SELECCIONAR LISTADO DE TARIFAS PROFESIONALES
    static async seleccionarTodasLasTarifasProfesionales(req, res) {
        try{
            const tarifaClass = new Tarifas_profesional();
            const resultado = await tarifaClass.seleccionarTarifasProfesionales();

            if (resultado) {
                res.status(200).json(resultado);
            } else {
                res.status(500).json({ message: false });
            }
        } catch (error) {
            res.status(500).json({ message: "serverError" });
        }
    }




    static async seleccionarTodasLasTarifasProfesionalesConNombre(req, res) {
        try{
            const tarifaClass = new Tarifas_profesional();
            const resultado = await tarifaClass.seleccionarTarifasProfesionalesConNombres();

            if (resultado) {
                res.status(200).json(resultado);
            } else {
                res.status(500).json({ message: false });
            }
        } catch (error) {
            res.status(500).json({ message: "serverError" });
        }
    }




    //FUNCION PARA SELECCIONAR POR ID UNA TARIFA PROFESIONAL
    static async seleccionarTarifasPorProfesional(req, res) {
        try{
            const {profesional_id} = req.body;
            if (!profesional_id) {
                return res.status(400).json({ message: "sindata" });
            }
            const tarifaClass = new Tarifas_profesional();
            const resultado = await tarifaClass.seleccionarTarifasProfesionalesConNombresPor_id_profesional(profesional_id);

            if (resultado) {
                res.status(200).json(resultado);
            }else {
                res.status(500).json({ message: false });
            }
        }catch (error) {
            res.status(500).json({ message: "serverError" });
        }
    }

}
