import DataBase from "../config/Database.js";


export default class ReservaPacientes {
    constructor(
        id_reserva,
        nombrePaciente,
        apellidoPaciente,
        rut,
        telefono,
        email,
        fechaInicio,
        horaInicio,
        fechaFinalizacion,
        horaFinalizacion,
        estadoReserva,
        estadoPeticion,
        preference_id,
        id_profesional) {

        this.id_reserva = id_reserva;
        this.nombrePaciente = nombrePaciente;
        this.apellidoPaciente = apellidoPaciente;
        this.rut = rut;
        this.telefono = telefono;
        this.email = email;
        this.fechaInicio = fechaInicio;
        this.horaInicio = horaInicio;
        this.fechaFinalizacion = fechaFinalizacion;
        this.horaFinalizacion = horaFinalizacion;
        this.estadoReserva = estadoReserva;
        this.estadoPeticion = estadoPeticion;
        this.preference_id = preference_id;
        this.id_profesional = id_profesional;

    }


    async cambiarReservaPagada(preference_id) {
        try {
            const conexion = DataBase.getInstance();
            const query = "UPDATE reservaPacientes SET estadoReserva = 'reservada'  WHERE preference_id = ?";
            const params = [preference_id];
            const resultado = await conexion.ejecutarQuery(query, params);
            if (resultado) {
                return resultado;
            } else {
                return console.error('Ha habido un problema al ejecutar la consulta desde model en ReservaPacientes.js , NO se ha podido cambiar el estado correctamente a pagado ')
            }
        } catch (e) {
            console.log('Problema encontrado a nivel del model en ReservaPacientes.js :  ' + e);
            throw new Error('No se ha podido actualizar el pago desde la clase del modelo ReservaPacientes.js :  ' + e);
        }
    }


    //METODO PARA SELECCIONAR TODAS LAS CITAS MEDICAS SEGUN ESTADO DE RESERVA INGRESADO
    async seleccionarReservaEstado(estadoReserva) {
        try {
            const conexion = DataBase.getInstance();
            const query = "SELECT * FROM reservaPacientes WHERE estadoReserva = ? AND estadoPeticion <> 0"
            const param = [estadoReserva]
            const resultadoQuery = await conexion.ejecutarQuery(query, param);

            if (resultadoQuery) {
                return resultadoQuery;
            }
        } catch (error) {
            console.log(error);
            throw new Error(error);
        }
    }


    //METODO PARA ACTUALZIAR NUEVAS CITAS MEDICAS
    async actualizarReserva(nombrePaciente, apellidoPaciente, rut, telefono, email, fechaInicio, horaInicio, fechaFinalizacion, horaFinalizacion, estadoReserva, id_profesional, id_reserva) {
        try {
            const conexion = DataBase.getInstance();
            const query = 'UPDATE reservaPacientes SET nombrePaciente = ? , apellidoPaciente = ?, rut = ? , telefono = ? , email = ? , fechaInicio = ?  , horaInicio = ? , fechaFinalizacion = ? , horaFinalizacion = ? , estadoReserva = ? , id_profesional = ? WHERE id_reserva = ?';
            const param = [nombrePaciente, apellidoPaciente, rut, telefono, email, fechaInicio, horaInicio, fechaFinalizacion, horaFinalizacion, estadoReserva, id_profesional, id_reserva]
            const resultadoQuery = await conexion.ejecutarQuery(query, param);

            if (resultadoQuery) {
                return resultadoQuery;
            }
        } catch (e) {
            throw new Error(e)
        }
    }


    //METODO PARA ELIMINAR LOGICAMENTE EL AGENDAMIENTO
    async eliminarReservaPaciente(id_reserva) {
        try {
            const conexion = DataBase.getInstance();
            const query = "DELETE FROM reservaPacientes WHERE id_reserva = ?";
            const param = [id_reserva];

            const resultadoQuery = await conexion.ejecutarQuery(query, param);
            if (resultadoQuery) {
                return resultadoQuery;
            }

        } catch (error) {
            throw new Error(error);
        }
    }


    //METODO PARA SELECCIONAR TODAS LAS CITAS MEDICAS
    async seleccionarFichasReservadasEspecifica(id_reserva) {
        try {
            const conexion = DataBase.getInstance();
            const query = "SELECT reservaPacientes.*, profesionales.nombreProfesional FROM reservaPacientes INNER JOIN profesionales ON reservaPacientes.id_profesional = profesionales.id_profesional WHERE reservaPacientes.id_reserva = ? AND reservaPacientes.estadoPeticion <> 0"
            const param = [id_reserva];
            const resultadoQuery = await conexion.ejecutarQuery(query, param);

            if (resultadoQuery) {
                return resultadoQuery;
            }

        } catch (error) {
            console.log(error);
            throw new Error(error);
        }

    }


    //METODO PARA SELECCIONAR TODAS LAS CITAS MEDICAS
    async seleccionarFichasReservadas() {
        try {
            const conexion = DataBase.getInstance();
            const query = "SELECT reservaPacientes.*,profesionales.nombreProfesional FROM reservaPacientes INNER JOIN profesionales ON reservaPacientes.id_profesional = profesionales.id_profesional WHERE estadoPeticion <> 0"
            const resultadoQuery = await conexion.ejecutarQuery(query);
            if (resultadoQuery) {
                return resultadoQuery;
            }
        } catch (error) {
            console.log(error);
            throw new Error(error);
        }
    }


    //METODO PARA INSERTAR NUEVAS CITAS MEDICAS
    async insertarReservaPaciente(nombrePaciente, apellidoPaciente, rut, telefono, email, fechaInicio, horaInicio, fechaFinalizacion, horaFinalizacion, estadoReserva, id_profesional) {
        try {
            const conexion = DataBase.getInstance();
            const query = 'INSERT INTO reservaPacientes(nombrePaciente, apellidoPaciente, rut, telefono, email, fechaInicio, horaInicio,fechaFinalizacion, horaFinalizacion, estadoReserva, id_profesional) VALUES (?,?,?,?,?,?,?,?,?,?,?)';
            const param = [nombrePaciente, apellidoPaciente, rut, telefono, email, fechaInicio, horaInicio, fechaFinalizacion, horaFinalizacion, estadoReserva, id_profesional];

            const resultadoQuery = await conexion.ejecutarQuery(query, param);
            if (resultadoQuery) {
                return resultadoQuery;
            }
        } catch (e) {
            throw new Error(e)
        }
    }

//DEVUELVE UN VALOR booleano PARA EVALUAR SI LAS HORAS MEDICAS SE SUPERPONEN CON RESERVAS O BLOQUEOS
    async validarDisponibilidadBoolean(fechaInicio, horaInicio, fechaFinalizacion, horaFinalizacion, id_profesional) {
        const conexion = DataBase.getInstance();

        const query = `
SELECT COUNT(*) AS cnt FROM (
      SELECT id_reserva AS id
      FROM reservaPacientes
      WHERE id_profesional = ?
      AND estadoPeticion <> 0
      AND estadoReserva <> 'cancelada'
      AND NOT (
        TIMESTAMP(fechaFinalizacion, horaFinalizacion) <= TIMESTAMP(?, ?)
        OR TIMESTAMP(fechaInicio, horaInicio) >= TIMESTAMP(?, ?)
      )
      UNION ALL
      SELECT id_bloqueo AS id
      FROM bloqueoAgenda
      WHERE id_profesional = ?
      AND estado_bloqueoAgenda <> 0
      AND ? >= fechaInicio
      AND ? <= fechaFinalizacion
      AND NOT (
        horaFinalizacion <= ?
        OR horaInicio >= ?
      )
    ) AS conflictos
    `;

        const params = [
            id_profesional, fechaInicio, horaInicio, fechaFinalizacion, horaFinalizacion,
            id_profesional, fechaInicio, fechaInicio, horaInicio, horaFinalizacion
        ];
        const filas = await conexion.ejecutarQuery(query, params);

        const cnt = Array.isArray(filas) ? filas[0].cnt : filas.cnt;
        return cnt === 0; // true = disponible, false = hay conflicto con reserva o bloqueo
    }


    async seleccionarSimilitudNombre(nombrePaciente) {
        try {
            const conexion = DataBase.getInstance();
            const query = 'SELECT * FROM reservaPacientes WHERE nombrePaciente LIKE ? AND estadoPeticion <> 0 ';
            const param = ['%' + nombrePaciente + '%'];

            const resultadoQuery = await conexion.ejecutarQuery(query, param);

            if (resultadoQuery) {
                return resultadoQuery;
            }

        } catch (error) {
            console.log(error);

        }
    }


    async seleccionarSimilitudRut(rut) {
        try {
            const conexion = DataBase.getInstance();
            const query = 'SELECT * FROM reservaPacientes WHERE rut LIKE ? AND estadoPeticion <> 0 ';
            const param = ['%' + rut + '%'];

            const resultadoQuery = await conexion.ejecutarQuery(query, param);

            if (resultadoQuery) {
                return resultadoQuery;
            }

        } catch (error) {
            console.log(error);

        }
    }




    async seleccionarPorId_profesional(id_profesional) {
        try {
            const conexion = DataBase.getInstance();
            const query = 'SELECT * FROM reservaPacientes WHERE id_profesional = ? AND estadoPeticion <> 0 ';
            const param = [id_profesional];

            const resultadoQuery = await conexion.ejecutarQuery(query, param);

            if (resultadoQuery) {
                return resultadoQuery;
            }
        } catch (error) {
            throw new Error(error);
        }
    }

    async seleccionarEntreFechas(fechaInicio, fechaFinalizacion) {
        try {
            const conexion = DataBase.getInstance();
            const query = 'SELECT reservaPacientes.*, profesionales.nombreProfesional FROM reservaPacientes INNER JOIN profesionales ON reservaPacientes.id_profesional = profesionales.id_profesional WHERE reservaPacientes.fechaInicio BETWEEN ? AND ? AND reservaPacientes.estadoPeticion <> 0';
            const param = [fechaInicio, fechaFinalizacion];

            const resultadoQuery = await conexion.ejecutarQuery(query, param);

            if (resultadoQuery) {
                return resultadoQuery;
            }

        } catch (error) {
            console.log(error);

        }
    }


    async actualizarEstado(estadoReserva, id_reserva) {
        try {
            const conexion = DataBase.getInstance();
            const query = "UPDATE reservaPacientes SET estadoReserva = ? WHERE id_reserva = ?"
            const params = [estadoReserva, id_reserva];

            const resultadoQuery = await conexion.ejecutarQuery(query, params);
            if (resultadoQuery) {

                return resultadoQuery;
            }
            return null;
        } catch (error) {
            throw error;
        }
    }


    //METODO PARA INSERTAR NUEVAS CITAS MEDICAS DESDE METODOS INTERNOS DEL BACKEND COMO MERCADO PAGO
    async insertarReservaPacienteBackend(nombrePaciente, apellidoPaciente, rut, telefono, email, fechaInicio, horaInicio, fechaFinalizacion, horaFinalizacion, estadoReserva, preference_id, estadoPeticion,id_profesional) {
        try {
            const conexion = DataBase.getInstance();
            const query = 'INSERT INTO reservaPacientes(nombrePaciente, apellidoPaciente, rut, telefono, email, fechaInicio, horaInicio,fechaFinalizacion, horaFinalizacion, estadoReserva, preference_id, estadoPeticion,id_profesional) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)';
            const param = [nombrePaciente, apellidoPaciente, rut, telefono, email, fechaInicio, horaInicio, fechaFinalizacion, horaFinalizacion, estadoReserva, preference_id,estadoPeticion,id_profesional];

            const resultadoQuery = await conexion.ejecutarQuery(query, param);
            if (resultadoQuery) {
                return resultadoQuery;
            }
        } catch (e) {
            throw new Error(e)
        }
    }



    //METODO PARA SELECCIONAR TODAS LAS CITAS MEDICAS por id_profesional
    async seleccionarFichasReservadasPreference(preference_id) {
        try {
            const conexion = DataBase.getInstance();
            const query = "SELECT * FROM reservaPacientes WHERE preference_id = ? AND estadoPeticion <> 0"
            const param = [preference_id];
            const resultadoQuery = await conexion.ejecutarQuery(query, param);

            if (resultadoQuery) {
                return resultadoQuery;
            }

        } catch (error) {
            console.log(error);
            throw new Error(error);
        }
    }







    //METODO PARA SELECCIONAR TODAS LAS CITAS MEDICAS por preference_id
    async seleccionarReservasPorProfesional(id_pro) {
        try {
            const conexion = DataBase.getInstance();
            const query = "SELECT * FROM reservaPacientes WHERE preference_id = ? AND estadoPeticion <> 0"
            const param = [id_pro];
            const resultadoQuery = await conexion.ejecutarQuery(query, param);

            if (resultadoQuery) {
                return resultadoQuery;
            }

        } catch (error) {
            console.log(error);
            throw new Error(error);
        }
    }

    /*

    =====> cambiarReservaPagadaVisible(preference_id) <=======
    LO QUE SE HACE ACA ES CAMBIAR EL estadoPeticion EL CUAL POR DEFECTO ES 1, PERO SI NO HA PAGADO SE INGRESA COMO 0 SOLO SI PAGA SE DEJA VISIBLE Y OPERATIVA
    -->SOLO SE USA EN EN CONTROLLER DE MERCADO PAGO.

    * */
    async cambiarReservaPagadaVisible(preference_id) {
        try {
            const conexion = DataBase.getInstance();
            const query = "UPDATE reservaPacientes SET estadoPeticion = 1  WHERE preference_id = ?";
            const params = [preference_id];
            const resultado = await conexion.ejecutarQuery(query, params);
            if (resultado) {
                return resultado;
            } else {
                return console.error('Ha habido un problema al ejecutar la consulta desde model en ReservaPacientes.js , NO se ha podido cambiar el estado correctamente a pagado ')
            }
        } catch (e) {
            console.log('Problema encontrado a nivel del model en ReservaPacientes.js :  ' + e);
            throw new Error('No se ha podido actualizar el pago desde la clase del modelo ReservaPacientes.js :  ' + e);
        }
    }



    async seleccionarFichasReservadas_id_profesional(id_profesional) {
        try {
            const conexion = DataBase.getInstance();
            const query = "SELECT * FROM reservaPacientes WHERE id_profesional = ? AND estadoPeticion <> 0"
            const param = [id_profesional];
            const resultadoQuery = await conexion.ejecutarQuery(query, param);

            if (resultadoQuery) {
                return resultadoQuery;
            }

        } catch (error) {
            console.log(error);
            throw new Error(error);
        }
    }

}