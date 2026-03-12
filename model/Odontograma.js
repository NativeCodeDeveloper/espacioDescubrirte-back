import DataBase from "../config/Database.js";

export default class Odontograma {

    constructor(){
    }


    // 1. CREAR ODONTOGRAMA (tabla odontogramas)
    async crearOdontograma(id_paciente) {
        const conexion = DataBase.getInstance();
        const query = `INSERT INTO odontogramas (id_paciente, fechaCreacionOdontograma, fechaModificacionOdontograma) VALUES (?, NOW(), NOW())`;
        const param = [id_paciente];

        try {
            const resultado = await conexion.ejecutarQuery(query, param);
            if (resultado) {
                return resultado;
            }
        } catch (error) {
            throw new Error('No se logró crear odontograma / OdontogramaModel.js');
        }
    }




    // 2. SELECCIONAR DIENTES DEL ODONTOGRAMA (tabla odontograma_dientes)

    async seleccionarOdontogramasPacientes(id_paciente) {
        try {
        const conexion = DataBase.getInstance();

        const query1 = `SELECT * FROM odontogramas WHERE id_paciente = ? ORDER BY fechaCreacionOdontograma DESC LIMIT 1`;
        const param1 = [id_paciente];
        const resultadoQuery1 = await conexion.ejecutarQuery(query1, param1);

        let id_odontograma = null;

        if (resultadoQuery1 && resultadoQuery1.length > 0) {
            id_odontograma = resultadoQuery1[0].id_odontograma;
        }else{
            return [];
        }

        if(id_odontograma){
            const query2 = `SELECT * FROM odontograma_dientes WHERE id_odontograma = ? `;
            const param2 = [id_odontograma];
            const  resultadoQuery2 = await conexion.ejecutarQuery(query2, param2);

            if(resultadoQuery2){
                return resultadoQuery2;
            }else{
                return []
            }
        }else {
            return []
        }
        } catch (error) {
            throw new Error('No se logró insertar diente / OdontogramaModel.js');
        }
    }








    // 3. LISTAR TODOS LOS ODONTOGRAMAS DE UN PACIENTE (tabla odontogramas)
    async listarOdontogramasPaciente(id_paciente) {
        try {
            const conexion = DataBase.getInstance();
            const query = `SELECT * FROM odontogramas WHERE id_paciente = ? ORDER BY fechaCreacionOdontograma DESC`;
            const param = [id_paciente];
            const resultado = await conexion.ejecutarQuery(query, param);
            if (resultado) {
                return resultado;
            }
            return [];
        } catch (error) {
            throw new Error('No se logró listar odontogramas / OdontogramaModel.js');
        }
    }

    // 4. SELECCIONAR DIENTES DE UN ODONTOGRAMA ESPECÍFICO POR id_odontograma
    async seleccionarOdontogramaPorId(id_odontograma) {
        try {
            const conexion = DataBase.getInstance();
            const query = `SELECT * FROM odontograma_dientes WHERE id_odontograma = ?`;
            const param = [id_odontograma];
            const resultado = await conexion.ejecutarQuery(query, param);
            if (resultado) {
                return resultado;
            }
            return [];
        } catch (error) {
            throw new Error('No se logró seleccionar odontograma / OdontogramaModel.js');
        }
    }

    // 5. ACTUALIZAR DIENTE
    async actualizarDiente(id_odontograma, numero_diente, datos) {
        try {
            const conexion = DataBase.getInstance();
            const query = `UPDATE odontograma_dientes SET
                ausente = ?, resto_radicular = ?, protesis_fija = ?, protesis_existente = ?,
                cara_V = ?, cara_L = ?, cara_M = ?, cara_D = ?, cara_O = ?,
                diagnostico_general = ?, observaciones = ?,
                movilidad = ?, sondaje_mm = ?, sangrado_sondaje = ?, placa_bacteriana = ?,
                caries_activa = ?, obturacion = ?, endodoncia = ?, implante = ?,
                corona = ?, fractura = ?, lesion_periapical = ?, reabsorcion = ?,
                pieza_extraida = ?, extraccion_indicada = ?, extraida_ortodoncia = ?,
                indicada_ortodoncia = ?, indicada_sellante = ?, pieza_faltante = ?, pieza_sana = ?,
                fecha_actualizacion = NOW(), usuario_actualizacion = ?
                WHERE id_odontograma = ? AND numero_diente = ?`;

            const param = [
                datos.ausente, datos.resto_radicular, datos.protesis_fija, datos.protesis_existente,
                datos.cara_V, datos.cara_L, datos.cara_M, datos.cara_D, datos.cara_O,
                datos.diagnostico_general, datos.observaciones,
                datos.movilidad, datos.sondaje_mm, datos.sangrado_sondaje, datos.placa_bacteriana,
                datos.caries_activa, datos.obturacion, datos.endodoncia, datos.implante,
                datos.corona, datos.fractura, datos.lesion_periapical, datos.reabsorcion,
                datos.pieza_extraida, datos.extraccion_indicada, datos.extraida_ortodoncia,
                datos.indicada_ortodoncia, datos.indicada_sellante, datos.pieza_faltante, datos.pieza_sana,
                datos.usuario_actualizacion,
                id_odontograma, numero_diente
            ];

            const resultado = await conexion.ejecutarQuery(query, param);
            if (resultado) {
                return resultado;
            }
        } catch (error) {
            console.log("SQL Error actualizarDiente:", error.message || error);
            throw error;
        }
    }

    // 6. INSERTAR DIENTE (con todas las columnas)
    async insertarDiente(id_odontograma, numero_diente, datos) {
        try {
            const conexion = DataBase.getInstance();
            const query = `INSERT INTO odontograma_dientes
                         (id_odontograma, numero_diente, ausente, resto_radicular, protesis_fija, protesis_existente,
                          cara_V, cara_L, cara_M, cara_D, cara_O,
                          diagnostico_general, observaciones,
                          movilidad, sondaje_mm, sangrado_sondaje, placa_bacteriana,
                          caries_activa, obturacion, endodoncia, implante,
                          corona, fractura, lesion_periapical, reabsorcion,
                          pieza_extraida, extraccion_indicada, extraida_ortodoncia,
                          indicada_ortodoncia, indicada_sellante, pieza_faltante, pieza_sana,
                          fecha_registro, usuario_registro)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`;

            const param = [
                id_odontograma, numero_diente,
                datos.ausente || 0, datos.resto_radicular || 0, datos.protesis_fija || 0, datos.protesis_existente || 0,
                datos.cara_V || null, datos.cara_L || null, datos.cara_M || null, datos.cara_D || null, datos.cara_O || null,
                datos.diagnostico_general || null, datos.observaciones || null,
                datos.movilidad || 0, datos.sondaje_mm || 0, datos.sangrado_sondaje || 0, datos.placa_bacteriana || 0,
                datos.caries_activa || 0, datos.obturacion || 0, datos.endodoncia || 0, datos.implante || 0,
                datos.corona || 0, datos.fractura || 0, datos.lesion_periapical || 0, datos.reabsorcion || 0,
                datos.pieza_extraida || 0, datos.extraccion_indicada || 0, datos.extraida_ortodoncia || 0,
                datos.indicada_ortodoncia || 0, datos.indicada_sellante || 0, datos.pieza_faltante || 0, datos.pieza_sana || 0,
                datos.usuario_registro || null
            ];

            const resultado = await conexion.ejecutarQuery(query, param);
            if (resultado) {
                return resultado;
            }

        } catch (error) {
            throw new Error('No se logró insertar diente / OdontogramaModel.js');
        }
    }


}