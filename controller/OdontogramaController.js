import Odontograma from '../model/Odontograma.js';

export default class OdontogramaController{

    constructor(){
    }

    static async crearOdontograma(req, res) {
        try {
            const { id_paciente, teeth } = req.body;

            if (!id_paciente) {
                return res.status(400).json({ message: "sindato" });
            }

            const modelo = new Odontograma();

            // Paso 1: Crear el registro principal
            const resultadoOdontograma = await modelo.crearOdontograma(id_paciente);
            const id_odontograma = resultadoOdontograma.insertId;

            // Paso 2: Si vienen dientes, recorrer y guardar
            if (teeth) {
                for (const [numeroDiente, datosDiente] of Object.entries(teeth)) {
                    const { surfaces, wholeTooth } = datosDiente;

                    const tieneAlgo =
                        surfaces.V || surfaces.L || surfaces.M || surfaces.D || surfaces.O ||
                        Object.values(wholeTooth).some(Boolean);

                    if (tieneAlgo) {
                        await modelo.insertarDiente(id_odontograma, parseInt(numeroDiente), {
                            ausente: wholeTooth.absent ? 1 : 0,
                            resto_radicular: wholeTooth.restoRadicular ? 1 : 0,
                            protesis_fija: wholeTooth.protesisFija ? 1 : 0,
                            protesis_existente: wholeTooth.prosthesisExisting ? 1 : 0,
                            corona: wholeTooth.corona ? 1 : 0,
                            pieza_extraida: wholeTooth.piezaExtraida ? 1 : 0,
                            extraccion_indicada: wholeTooth.extraccionIndicada ? 1 : 0,
                            extraida_ortodoncia: wholeTooth.extraidaOrtodoncia ? 1 : 0,
                            indicada_ortodoncia: wholeTooth.indicadaOrtodoncia ? 1 : 0,
                            indicada_sellante: wholeTooth.indicadaSellante ? 1 : 0,
                            pieza_faltante: wholeTooth.piezaFaltante ? 1 : 0,
                            pieza_sana: wholeTooth.piezaSana ? 1 : 0,
                            cara_V: surfaces.V || null,
                            cara_L: surfaces.L || null,
                            cara_M: surfaces.M || null,
                            cara_D: surfaces.D || null,
                            cara_O: surfaces.O || null,
                        });
                    }
                }
            }

            return res.status(200).json({ message: true, id_odontograma });

        } catch (error) {
            return res.status(500).json({ message: "Error al crear odontograma" });
        }
    }



    static async seleccionarOdontogramaController(req, res) {
        try {
            const {id_paciente} = req.body;

            if (!id_paciente) {
                return res.status(400).json({ message: "sindato" });
            }

            const modelo = new Odontograma();
            const resultadoOdontograma = await modelo.seleccionarOdontogramasPacientes(id_paciente);

            if (resultadoOdontograma) {
                return res.status(200).json(resultadoOdontograma);
            }else{
                return res.status(200).json([]);
            }

        }catch (error) {
            return res.status(400).json({ message: "serverError" });
        }
    }

    // Listar todos los odontogramas de un paciente (solo registros principales, sin dientes)
    static async listarOdontogramasController(req, res) {
        try {
            const {id_paciente} = req.body;

            if (!id_paciente) {
                return res.status(400).json({ message: "sindato" });
            }

            const modelo = new Odontograma();
            const resultado = await modelo.listarOdontogramasPaciente(id_paciente);

            return res.status(200).json(resultado);

        } catch (error) {
            return res.status(400).json({ message: "serverError" });
        }
    }

    // Actualizar un diente específico dentro de un odontograma
    static async actualizarDienteController(req, res) {
        try {
            const { id_odontograma, numero_diente, datos } = req.body;

            if (!id_odontograma || !numero_diente || !datos) {
                return res.status(400).json({ message: "sindato" });
            }

            const modelo = new Odontograma();

            const datosCompletos = {
                ausente: datos.ausente ? 1 : 0,
                resto_radicular: datos.resto_radicular ? 1 : 0,
                protesis_fija: datos.protesis_fija ? 1 : 0,
                protesis_existente: datos.protesis_existente ? 1 : 0,
                cara_V: datos.cara_V || null,
                cara_L: datos.cara_L || null,
                cara_M: datos.cara_M || null,
                cara_D: datos.cara_D || null,
                cara_O: datos.cara_O || null,
                diagnostico_general: datos.diagnostico_general || null,
                observaciones: datos.observaciones || null,
                movilidad: datos.movilidad ? 1 : 0,
                sondaje_mm: datos.sondaje_mm || 0,
                sangrado_sondaje: datos.sangrado_sondaje ? 1 : 0,
                placa_bacteriana: datos.placa_bacteriana ? 1 : 0,
                caries_activa: datos.caries_activa ? 1 : 0,
                obturacion: datos.obturacion ? 1 : 0,
                endodoncia: datos.endodoncia ? 1 : 0,
                implante: datos.implante ? 1 : 0,
                corona: datos.corona ? 1 : 0,
                fractura: datos.fractura ? 1 : 0,
                lesion_periapical: datos.lesion_periapical ? 1 : 0,
                reabsorcion: datos.reabsorcion ? 1 : 0,
                pieza_extraida: datos.pieza_extraida ? 1 : 0,
                extraccion_indicada: datos.extraccion_indicada ? 1 : 0,
                extraida_ortodoncia: datos.extraida_ortodoncia ? 1 : 0,
                indicada_ortodoncia: datos.indicada_ortodoncia ? 1 : 0,
                indicada_sellante: datos.indicada_sellante ? 1 : 0,
                pieza_faltante: datos.pieza_faltante ? 1 : 0,
                pieza_sana: datos.pieza_sana ? 1 : 0,
                usuario_actualizacion: datos.usuario_actualizacion || null,
            };

            const resultado = await modelo.actualizarDiente(id_odontograma, numero_diente, datosCompletos);

            if (resultado && resultado.affectedRows > 0) {
                return res.status(200).json({ message: true });
            } else {
                // El diente no existe aún, insertarlo
                await modelo.insertarDiente(id_odontograma, numero_diente, datosCompletos);
                return res.status(200).json({ message: true });
            }

        } catch (error) {
            console.log("Error actualizarDiente:", error);
            return res.status(500).json({ message: "Error al actualizar diente" });
        }
    }

    // Seleccionar un odontograma específico por id_odontograma (trae los dientes)
    static async seleccionarOdontogramaPorIdController(req, res) {
        try {
            const {id_odontograma} = req.body;

            if (!id_odontograma) {
                return res.status(400).json({ message: "sindato" });
            }

            const modelo = new Odontograma();
            const resultado = await modelo.seleccionarOdontogramaPorId(id_odontograma);

            return res.status(200).json(resultado);

        } catch (error) {
            return res.status(400).json({ message: "serverError" });
        }
    }

}