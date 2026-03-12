import DataBase from "../config/Database.js";

export default class Profesionales {
    constructor(id_profesional, nombreProfesional, descripcionProfesional,estado_Profesional) {
        this.id_profesional = id_profesional;
        this.nombreProfesional = nombreProfesional;
        this.descripcionProfesional = descripcionProfesional;
        this.estado_Profesional = estado_Profesional;
    }

    //FUNCION PARA INSERTAR UN NUEVO PROFESIONAL
    async insertarProfesionalModel(nombreProfesional, descripcionProfesional) {
        try {
            const conexion = DataBase.getInstance();
            const query = "INSERT INTO profesionales (nombreProfesional, descripcionProfesional) VALUES (?,?)";
            const params = [nombreProfesional, descripcionProfesional];
            const resultado = await conexion.ejecutarQuery(query, params);
            if (resultado) {
                return resultado;
            }else {
                return resultado;
            }
        }catch (error) {
            throw error;
        }
    }

    //FUNCION PARA ACTUALIZAR UN PROFESIONAL
    async actualizarProfesionalModel(nombreProfesional, descripcionProfesional, id_profesional) {
        try {
            const conexion = DataBase.getInstance();
            const query = "UPDATE profesionales SET nombreProfesional = ?, descripcionProfesional = ? WHERE id_profesional = ?";
            const params = [nombreProfesional, descripcionProfesional, id_profesional];
            const resultado = await conexion.ejecutarQuery(query, params);
            if (resultado) {
                return resultado;
            }else {
                return resultado;
            }
        }catch (error) {
            throw  error;
        }
    }

    //FUNCION PARA SELECCIONAR POR ID UN NUEVO PROFESIONAL
    async seleccionarProfesionalPorID(id_profesional) {
        try {
            const conexion = DataBase.getInstance();
            const query = "SELECT * FROM profesionales WHERE id_profesional = ? AND estado_Profesional <> 0";
            const params = [id_profesional];
            const resultado = await conexion.ejecutarQuery(query, params);
            if (resultado) {
                return resultado;
            }else {
                return resultado;
            }
        }catch (error) {
            throw error;
        }
    }

    //FUNCION PARA ELIMINAR LOGICAMENTE CAMBIANDO ESTADO DE CERO A UNO UN PROFESIONAL
    async eliminarProfesionalPorId(id_profesional) {
        try {
            const conexion = DataBase.getInstance();
            const query = "UPDATE profesionales SET estado_Profesional = 0 WHERE id_profesional = ?";
            const params = [id_profesional];
            const resultado = await conexion.ejecutarQuery(query, params);
            if (resultado) {
                return resultado;
            }else {
                return resultado;
            }
        }catch (error) {
            throw  error;
        }
    }

    //FUNCION PARA SELECCIONAR UN NUEVO PROFESIONAL
    async seleccionarProfesionales() {
        try {
            const conexion = DataBase.getInstance();
            const query = "SELECT * FROM profesionales WHERE estado_Profesional <> 0";
            const resultado = await conexion.ejecutarQuery(query);
            if(resultado) {
                return resultado;
            }else {
                return resultado;
            }
        }catch (error) {
            throw  error;
        }
    }


}