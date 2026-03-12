import DataBase from "../config/Database.js";

export default class BloqueoAgenda {

    constructor(id_bloqueo,id_profesional,fechaInicio,horaInicio,fechaFinalizacion,horaFinalizacion,motivo,estado_bloqueoAgenda) {
        this.id_bloqueo = id_bloqueo;
        this.id_profesional = id_profesional;
        this.fechaInicio = fechaInicio;
        this.horaInicio = horaInicio;
        this.fechaFinalizacion = fechaFinalizacion;
        this.horaFinalizacion = horaFinalizacion;
        this.motivo = motivo;
        this.estado_bloqueoAgenda = estado_bloqueoAgenda;
    }

    //InsertarBloqueo
    async insertarBloqueoAgendaModel(id_profesional,fechaInicio,horaInicio,fechaFinalizacion,horaFinalizacion,motivo) {
        try {
            const conexion = DataBase.getInstance();
            const queryPrevia = 'SELECT * FROM bloqueoAgenda WHERE fechaInicio BETWEEN ? AND ? AND id_profesional = ? AND estado_bloqueoAgenda <> 0 ';
            const paramsPrevios = [fechaInicio,fechaFinalizacion,id_profesional];

            const respuestaBackendVerificadora = await conexion.ejecutarQuery(queryPrevia, paramsPrevios);
            let disponibilidadHorarioBloqueo;

            if (respuestaBackendVerificadora.length > 0) {
                disponibilidadHorarioBloqueo = false;
            }else{
                disponibilidadHorarioBloqueo = true;
            }

            if (disponibilidadHorarioBloqueo) {

                const query = 'INSERT INTO bloqueoAgenda (id_profesional,fechaInicio,horaInicio,fechaFinalizacion,horaFinalizacion,motivo) VALUES (?,?,?,?,?,?)';
                const params = [id_profesional,fechaInicio,horaInicio,fechaFinalizacion,horaFinalizacion,motivo];
                const respuestaCosulta = await conexion.ejecutarQuery(query, params);
                if (respuestaCosulta) {
                    return respuestaCosulta;
                }

            }else{

                return [];
            }
        }catch (error) {
            throw Error('No fue posible insertar bloqueo desde la clase BloqueoAgenda.js');
        }
    }

    //eliminarBloqueo
    async eliminarBloqueoAgenda(id_bloqueo) {
        try {
            const conexion = DataBase.getInstance();
            const query = 'DELETE FROM bloqueoAgenda WHERE id_bloqueo = ? ';
            const params = [id_bloqueo];

            const respuestaCosulta = await conexion.ejecutarQuery(query, params);
            if (respuestaCosulta) {
                return respuestaCosulta;
            }
        }catch (error) {
            throw error;
        }
    }


    //seleccionarBloqueosPorProfesional
    async seleccionarBloqueoPorProfesionalModel(id_profesional) {
        try {
            const conexion = DataBase.getInstance();
            const query = '  SELECT b.*, p.nombreProfesional FROM bloqueoAgenda b INNER JOIN profesionales p ON b.id_profesional = p.id_profesional WHERE b.id_profesional = ? AND b.estado_bloqueoAgenda <> 0';
            const params = [id_profesional];

            const respuestaCosulta = await conexion.ejecutarQuery(query, params);
            if (respuestaCosulta) {
                return respuestaCosulta;
            }
        }catch (error) {
            throw error;
        }
    }


    //seleccionarBloqueosEntreFechas
    async seleccionarBloqueoPorFechasModel(fechaInicio,fechaFinalizacion) {
        try {
            const conexion = DataBase.getInstance();
            const query = 'SELECT * FROM bloqueoAgenda WHERE fechaInicio BETWEEN ? AND ? AND estado_bloqueoAgenda <> 0 ';
            const params = [fechaInicio,fechaFinalizacion];

            const respuestaCosulta = await conexion.ejecutarQuery(query, params);
            if (respuestaCosulta) {
                return respuestaCosulta;
            }
        }catch (error) {
            throw error;
        }
    }


    async seleccionarTodosLosBloqueos() {
        try {
            const conexion = DataBase.getInstance();
            const query = 'SELECT b.*, p.nombreProfesional FROM bloqueoAgenda b INNER JOIN profesionales p ON b.id_profesional = p.id_profesional WHERE b.estado_bloqueoAgenda <> 0 AND p.estado_Profesional <> 0';
            const respuestaCosulta = await conexion.ejecutarQuery(query);
            if (respuestaCosulta) {
                return respuestaCosulta;
            }
        } catch (error) {
            throw error;
        }
    }


}