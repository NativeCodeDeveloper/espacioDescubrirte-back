import BloqueoAgenda from "../model/BloqueoAgenda.js";

export default class BloqueoAgendaController {
    constructor(){
    }

    //InsertarBloqueo
    static async InsertarBloqueoController(req, res){
        try {
            const {id_profesional,fechaInicio,horaInicio,fechaFinalizacion,horaFinalizacion,motivo } = req.body;
            console.log('INSERTAR BLOEQUEO CONTROLLER REQ.BODY :')
            console.log(req.body);
            console.log(" ");

            const BloqueoAgendaClass = new BloqueoAgenda();
            const respuestaModel = await BloqueoAgendaClass.insertarBloqueoAgendaModel(id_profesional,fechaInicio,horaInicio,fechaFinalizacion,horaFinalizacion,motivo);

            if(Array.isArray(respuestaModel) && respuestaModel.length === 0){
                return res.status(200).send({message : "sindisponibilidad"});
            }
            if(respuestaModel.affectedRows > 0){
                return res.status(200).send({message : true});
            }else{
                return res.status(200).send({message : false});
            }
        }catch(err){
                return res.status(400).send({
                    message: 'serverError',
                })
        }
    }


    static async eliminarBloqueoController(req, res) {
        try {
            const {id_bloqueo} = req.body;
            console.log('ELIMINAR BLOEQUEO CONTROLLER REQ.BODY :')
            console.log(req.body);
            console.log(" ");

            const BloqueoAgendaClass = new BloqueoAgenda();
            const respuestaModel = await BloqueoAgendaClass.eliminarBloqueoAgenda(id_bloqueo);

            if(respuestaModel.affectedRows > 0){
                return res.status(200).send({message : true});
            }else{
                return res.status(200).send({message : false});
            }
        }catch(err){
            return res.status(400).send({message : "serverError"});
        }
    }


    static async seleccionarBloqueosPorProfesional(req, res) {
        try {
            const {id_profesional} = req.body;
            console.log('SELECCIONAR POR PROFESIONAL BLOEQUEO CONTROLLER REQ.BODY :')
            console.log(req.body);
            console.log(" ");

            const BloqueoAgendaClass = new BloqueoAgenda();
            const respuestaModel = await BloqueoAgendaClass.seleccionarBloqueoPorProfesionalModel(id_profesional);

            if(respuestaModel){
                return res.status(200).send(respuestaModel);
            }
        }catch(err){
            return res.status(400).send({message : "serverError"});
        }
    }


    static async seleccionarBloqueosEntreFechasController(req, res) {
        try {
            const {fechaInicio,fechaFinalizacion} = req.body;
            console.log('SELECCIONAR POR ENTRE FECHAS BLOEQUEO CONTROLLER REQ.BODY :')
            console.log(fechaInicio,fechaFinalizacion);
            console.log(" ");

            const BloqueoAgendaClass = new BloqueoAgenda();
            const respuestaModel = await BloqueoAgendaClass.seleccionarBloqueoPorFechasModel(fechaInicio,fechaFinalizacion);

            if(respuestaModel){
                return res.status(200).send(respuestaModel);
            }
        }catch(err){
            return res.status(400).send({message : "serverError"});
        }
    }






    static async seleccionarTodosLosBloqueosController(req, res) {
        try {
            const BloqueoAgendaClass = new BloqueoAgenda();
            const respuestaModel = await BloqueoAgendaClass.seleccionarTodosLosBloqueos();
            if(respuestaModel){
                return res.status(200).send(respuestaModel);
            }
        }catch(err){
            return res.status(400).send({message : "serverError"});
        }
    }
}