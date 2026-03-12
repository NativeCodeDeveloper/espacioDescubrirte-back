import DataBase from "../config/Database.js";

export default class ServiciosProfesionales {
    constructor(id_servicioProfesional, nombreServicio, descripcionServicio, estado_Servicio) {
        this.id_servicioProfesional = id_servicioProfesional;
        this.nombreServicio = nombreServicio;
        this.descripcionServicio = descripcionServicio;
        this.estado_Servicio = estado_Servicio;
    }

    //FUNCION PARA INSERTAR UN NUEVO SERVICIO PROFESIONAL
    async insertarServicioProfesionalModel(nombreServicio, descripcionServicio) {
        try {
            const conexion = DataBase.getInstance();
            const query = "INSERT INTO serviciosProfesionales (nombreServicio, descripcionServicio) VALUES (?,?)";
            const params = [nombreServicio, descripcionServicio];

            const resultado = await conexion.ejecutarQuery(query, params);

            if (resultado) {
                return resultado;
            } else {
                return resultado;
            }

        } catch (error) {
            throw error;
        }
    }

    //FUNCION PARA ACTUALIZAR UN SERVICIO PROFESIONAL
    async actualizarServicioProfesionalModel(nombreServicio, descripcionServicio, id_servicioProfesional) {
        try {
            const conexion = DataBase.getInstance();
            const query = "UPDATE serviciosProfesionales SET nombreServicio = ?, descripcionServicio = ? WHERE id_servicioProfesional = ?";
            const params = [nombreServicio, descripcionServicio, id_servicioProfesional];

            const resultado = await conexion.ejecutarQuery(query, params);

            if (resultado) {
                return resultado;
            } else {
                return resultado;
            }

        } catch (error) {
            throw error;
        }
    }

    //FUNCION PARA SELECCIONAR POR ID UN SERVICIO PROFESIONAL
    async seleccionarServicioProfesionalPorID(id_servicioProfesional) {
        try {
            const conexion = DataBase.getInstance();
            const query = "SELECT * FROM serviciosProfesionales WHERE id_servicioProfesional = ? AND estado_Servicio <> 0";
            const params = [id_servicioProfesional];

            const resultado = await conexion.ejecutarQuery(query, params);

            if (resultado) {
                return resultado;
            } else {
                return resultado;
            }

        } catch (error) {
            throw error;
        }
    }

    //FUNCION PARA ELIMINAR LOGICAMENTE UN SERVICIO PROFESIONAL
    async eliminarServicioProfesionalPorId(id_servicioProfesional) {
        try {
            const conexion = DataBase.getInstance();
            const query = "UPDATE serviciosProfesionales SET estado_Servicio = 0 WHERE id_servicioProfesional = ?";
            const params = [id_servicioProfesional];

            const resultado = await conexion.ejecutarQuery(query, params);

            if (resultado) {
                return resultado;
            } else {
                return resultado;
            }

        } catch (error) {
            throw error;
        }
    }

    //FUNCION PARA SELECCIONAR TODOS LOS SERVICIOS PROFESIONALES
    async seleccionarServiciosProfesionales() {
        try {
            const conexion = DataBase.getInstance();
            const query = "SELECT * FROM serviciosProfesionales WHERE estado_Servicio <> 0";
            const resultado = await conexion.ejecutarQuery(query);

            if (resultado) {
                return resultado;
            } else {
                return resultado;
            }

        } catch (error) {
            throw error;
        }
    }
}
