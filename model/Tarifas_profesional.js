import DataBase from "../config/Database.js";

export default class Tarifas_profesional {
    constructor(id_tarifaProfesional, profesional_id, servicio_id, precio, duracion_min, estado_tarifas_profesional) {
        this.id_tarifaProfesional = id_tarifaProfesional;
        this.profesional_id = profesional_id;
        this.servicio_id = servicio_id;
        this.precio = precio;
        this.duracion_min = duracion_min;
        this.estado_tarifas_profesional = estado_tarifas_profesional;
    }

    //FUNCION PARA INSERTAR UNA NUEVA TARIFA PROFESIONAL
    async insertarTarifaProfesionalModel(profesional_id, servicio_id, precio, duracion_min) {
        try {
            const conexion = DataBase.getInstance();
            const query = "INSERT INTO tarifas_profesional (profesional_id, servicio_id, precio, duracion_min) VALUES (?,?,?,?)";
            const params = [profesional_id, servicio_id, precio, duracion_min];

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

    //FUNCION PARA ACTUALIZAR UNA TARIFA PROFESIONAL
    async actualizarTarifaProfesionalModel(profesional_id, servicio_id, precio, duracion_min, id_tarifaProfesional) {
        try {
            const conexion = DataBase.getInstance();
            const query = "UPDATE tarifas_profesional SET profesional_id = ?, servicio_id = ?, precio = ?, duracion_min = ? WHERE id_tarifaProfesional = ?";
            const params = [profesional_id, servicio_id, precio, duracion_min, id_tarifaProfesional];

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

    //FUNCION PARA SELECCIONAR POR ID UNA TARIFA PROFESIONAL
    async seleccionarTarifaProfesionalPorID(id_tarifaProfesional) {
        try {
            const conexion = DataBase.getInstance();
            const query = "SELECT * FROM tarifas_profesional WHERE id_tarifaProfesional = ? AND estado_tarifas_profesional <> 0";
            const params = [id_tarifaProfesional];

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

    //FUNCION PARA ELIMINAR LOGICAMENTE UNA TARIFA PROFESIONAL
    async eliminarTarifaProfesionalPorId(id_tarifaProfesional) {
        try {
            const conexion = DataBase.getInstance();
            const query = "UPDATE tarifas_profesional SET estado_tarifas_profesional = 0 WHERE id_tarifaProfesional = ?";
            const params = [id_tarifaProfesional];

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

    //FUNCION PARA SELECCIONAR TODAS LAS TARIFAS PROFESIONALES
    async seleccionarTarifasProfesionales() {
        try {
            const conexion = DataBase.getInstance();
            const query = "SELECT * FROM tarifas_profesional WHERE estado_tarifas_profesional <> 0";
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




    //FUNCION PARA SELECCIONAR TODAS LAS TARIFAS PROFESIONALES
    async seleccionarTarifasProfesionalesConNombres() {
        try {
            const conexion = DataBase.getInstance();
            const query =`
                SELECT
            tarifa.id_tarifaProfesional,
                tarifa.profesional_id,
                tarifa.servicio_id,
                tarifa.precio,
                tarifa.duracion_min,
                profesional.nombreProfesional,
                servicio.nombreServicio

            FROM tarifas_profesional AS tarifa

            INNER JOIN profesionales AS profesional
            ON tarifa.profesional_id = profesional.id_profesional
            INNER JOIN serviciosProfesionales AS servicio
            ON tarifa.servicio_id = servicio.id_servicioProfesional
            WHERE tarifa.estado_tarifas_profesional <> 0
            AND profesional.estado_Profesional <> 0
            AND servicio.estado_Servicio <> 0`;
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






    //FUNCION PARA SELECCIONAR TODAS LAS TARIFAS PROFESIONALES
    async seleccionarTarifasProfesionalesConNombresPor_id_profesional(profesional_id) {
        try {
            const conexion = DataBase.getInstance();
            const query = `                                                                                                                                                                                             
  SELECT                                                                                                                                                                                   
      tarifa.*,
      profesional.nombreProfesional,                                                                                                                                                       
      servicio.nombreServicio                                                                                                                                                            
  FROM tarifas_profesional AS tarifa                                                                                                                                                      
  INNER JOIN profesionales AS profesional
      ON tarifa.profesional_id = profesional.id_profesional
  INNER JOIN serviciosProfesionales AS servicio
      ON tarifa.servicio_id = servicio.id_servicioProfesional
  WHERE tarifa.profesional_id = ?
      AND tarifa.estado_tarifas_profesional <> 0
      AND profesional.estado_Profesional <> 0
      AND servicio.estado_Servicio <> 0
      `;
            const params = [profesional_id];

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



}
