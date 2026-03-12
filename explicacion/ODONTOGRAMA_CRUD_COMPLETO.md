# Odontograma - Documentacion Completa del CRUD

## Indice

1. [Descripcion General](#1-descripcion-general)
2. [Estructura de la Base de Datos](#2-estructura-de-la-base-de-datos)
3. [Arquitectura del Sistema (MVC)](#3-arquitectura-del-sistema-mvc)
4. [Flujo Completo: Crear un Odontograma Vacio](#4-flujo-completo-crear-un-odontograma-vacio)
5. [Flujo Completo: Crear un Odontograma con Datos](#5-flujo-completo-crear-un-odontograma-con-datos)
6. [Flujo Completo: Actualizar un Diente](#6-flujo-completo-actualizar-un-diente)
7. [Flujo Completo: Listar Odontogramas de un Paciente](#7-flujo-completo-listar-odontogramas-de-un-paciente)
8. [Flujo Completo: Seleccionar un Odontograma por ID](#8-flujo-completo-seleccionar-un-odontograma-por-id)
9. [Endpoints (Rutas)](#9-endpoints-rutas)
10. [Model - Metodos Detallados](#10-model---metodos-detallados)
11. [Controller - Metodos Detallados](#11-controller---metodos-detallados)
12. [Frontend - Componente Odontograma.jsx](#12-frontend---componente-odontogramajsx)
13. [Frontend - Pagina odontogramasPaciente](#13-frontend---pagina-odontogramaspaciente)
14. [Numeracion FDI de los Dientes](#14-numeracion-fdi-de-los-dientes)
15. [Valores Posibles por Campo](#15-valores-posibles-por-campo)
16. [ALTER TABLE para Columnas Nuevas](#16-alter-table-para-columnas-nuevas)

---

## 1. Descripcion General

El sistema de odontograma permite registrar el estado dental de cada paciente de forma visual e interactiva.
Cada paciente puede tener **multiples odontogramas** (por ejemplo, uno por consulta), y cada odontograma
contiene hasta **52 dientes** (32 permanentes + 20 temporales), cada uno con informacion sobre sus
5 caras y estados generales.

### Tecnologias involucradas

| Capa | Tecnologia |
|------|-----------|
| Frontend | Next.js (React) con Tailwind CSS |
| Backend | Node.js con Express |
| Base de datos | MySQL |
| Patron | MVC (Model - View/Routes - Controller) |

### Archivos involucrados

```
backend/
  model/Odontograma.js              --> Queries SQL (Model)
  controller/OdontogramaController.js --> Logica de negocio (Controller)
  view/odontogramaRoutes.js          --> Rutas Express (View/Routes)

frontend/
  src/Componentes/Odontograma.jsx                              --> Componente visual interactivo
  src/app/dashboard/odontogramasPaciente/[id_paciente]/page.jsx --> Pagina que lista los odontogramas
```

---

## 2. Estructura de la Base de Datos

El sistema usa **2 tablas** relacionadas entre si:

### Tabla `odontogramas` (registro principal)

Almacena un registro por cada odontograma creado. Es la tabla "padre".

| Columna | Tipo | Descripcion |
|---------|------|-------------|
| `id_odontograma` | INT (PK, AUTO_INCREMENT) | Identificador unico del odontograma |
| `id_paciente` | INT (FK) | Referencia al paciente dueno del odontograma |
| `fechaCreacionOdontograma` | DATETIME | Fecha y hora en que se creo |
| `fechaModificacionOdontograma` | DATETIME | Fecha y hora de la ultima modificacion |

**Relacion:** Un paciente puede tener muchos odontogramas (1:N).

### Tabla `odontograma_dientes` (detalle por diente)

Almacena una fila por cada diente que tenga informacion registrada dentro de un odontograma.

#### Columnas de identificacion

| Columna | Tipo | Descripcion |
|---------|------|-------------|
| `id_odontograma` | INT (FK) | Referencia al odontograma padre |
| `numero_diente` | INT | Numero del diente segun numeracion FDI (ej: 11, 18, 55) |

#### Columnas de estado del diente completo (TINYINT = 0 o 1)

| Columna | Tipo | Descripcion |
|---------|------|-------------|
| `ausente` | TINYINT | 1 = El diente no existe (fue extraido o no erupcionado) |
| `resto_radicular` | TINYINT | 1 = Solo queda la raiz del diente |
| `protesis_fija` | TINYINT | 1 = Tiene una protesis fija (corona, puente) |
| `protesis_existente` | TINYINT | 1 = Tiene una protesis existente previa |

#### Columnas de caras del diente (VARCHAR)

Cada diente tiene 5 caras. El valor almacenado indica que condicion tiene esa cara.

| Columna | Tipo | Descripcion |
|---------|------|-------------|
| `cara_V` | VARCHAR | Cara Vestibular (la cara externa, visible al sonreir) |
| `cara_L` | VARCHAR | Cara Lingual/Palatina (la cara interna, hacia la lengua) |
| `cara_M` | VARCHAR | Cara Mesial (la cara que mira hacia el centro de la boca) |
| `cara_D` | VARCHAR | Cara Distal (la cara que mira hacia atras/oido) |
| `cara_O` | VARCHAR | Cara Oclusal/Incisal (la cara superior, la que muerde) |

#### Columnas clinicas adicionales

| Columna | Tipo | Descripcion |
|---------|------|-------------|
| `diagnostico_general` | VARCHAR(500) | Texto libre con el diagnostico del diente |
| `observaciones` | TEXT | Notas adicionales del odontologo |
| `movilidad` | TINYINT | 1 = El diente tiene movilidad anormal |
| `sondaje_mm` | TINYINT | Profundidad de sondaje periodontal en milimetros |
| `sangrado_sondaje` | TINYINT | 1 = Hubo sangrado al sondear |
| `placa_bacteriana` | TINYINT | 1 = Se detecto placa bacteriana |
| `caries_activa` | TINYINT | 1 = Tiene caries activa |
| `obturacion` | TINYINT | 1 = Tiene obturacion (relleno dental) |
| `endodoncia` | TINYINT | 1 = Se le realizo endodoncia (tratamiento de conducto) |
| `implante` | TINYINT | 1 = Tiene un implante dental |
| `corona` | TINYINT | 1 = Tiene corona protesica |
| `fractura` | TINYINT | 1 = El diente esta fracturado |
| `lesion_periapical` | TINYINT | 1 = Tiene lesion en la punta de la raiz |
| `reabsorcion` | TINYINT | 1 = La raiz se esta reabsorbiendo |

#### Columnas de auditoria

| Columna | Tipo | Descripcion |
|---------|------|-------------|
| `fecha_registro` | DATETIME | Cuando se inserto este registro por primera vez |
| `fecha_actualizacion` | DATETIME | Cuando se actualizo por ultima vez |
| `usuario_registro` | INT | ID del usuario que creo el registro |
| `usuario_actualizacion` | INT | ID del usuario que hizo la ultima actualizacion |

### Relacion entre tablas

```
odontogramas (1) ──────── (N) odontograma_dientes
     |                              |
  id_odontograma  ←──────  id_odontograma
```

Un odontograma puede tener entre 0 y 52 filas en `odontograma_dientes`.
**Solo se insertan los dientes que tienen algo marcado** (no se crean 52 filas vacias).

---

## 3. Arquitectura del Sistema (MVC)

```
[Frontend (React)]
       |
       | HTTP POST (fetch)
       v
[Routes (odontogramaRoutes.js)]  -->  Define las URLs disponibles
       |
       | Llama al metodo estatico
       v
[Controller (OdontogramaController.js)]  -->  Valida datos, arma logica, responde al cliente
       |
       | Llama al metodo de instancia
       v
[Model (Odontograma.js)]  -->  Ejecuta queries SQL contra MySQL
       |
       v
[Base de Datos MySQL]
```

---

## 4. Flujo Completo: Crear un Odontograma Vacio

Esto sucede cuando el usuario presiona el boton **"+ Crear nuevo odontograma"** en la pagina.

### Paso 1: Frontend genera los dientes vacios

```javascript
const teeth = {};
ALL_TEETH.forEach((n) => { teeth[String(n)] = emptyTooth(); });
```

Esto crea un objeto con 52 claves (una por diente), donde cada diente tiene:

```javascript
{
    surfaces: { V: null, L: null, M: null, D: null, O: null },
    wholeTooth: { absent: false, restoRadicular: false, protesisFija: false, prosthesisExisting: false }
}
```

### Paso 2: Frontend envia el POST

```javascript
fetch(`${API}/odontograma/insertarOdontograma`, {
    method: "POST",
    body: JSON.stringify({ id_paciente, teeth })
})
```

### Paso 3: Controller recibe y procesa

El controller recorre los 52 dientes y evalua si **tieneAlgo**:

```javascript
const tieneAlgo =
    surfaces.V || surfaces.L || surfaces.M || surfaces.D || surfaces.O ||
    wholeTooth.absent || wholeTooth.restoRadicular ||
    wholeTooth.protesisFija || wholeTooth.prosthesisExisting;
```

Como TODOS los valores son `null` o `false`, **ningun diente tiene algo marcado**.

### Paso 4: Resultado en la base de datos

- Se crea **1 fila** en `odontogramas` (el registro principal con id_paciente y fechas)
- Se crean **0 filas** en `odontograma_dientes` (ningun diente tenia informacion)

### Paso 5: Frontend recarga la lista

Despues de crear, se llama a `cargarTodosLosOdontogramas()` para refrescar la pantalla.

---

## 5. Flujo Completo: Crear un Odontograma con Datos

Esto sucede cuando se envia un POST con dientes que ya tienen informacion.

### Ejemplo de body:

```json
{
  "id_paciente": 50,
  "teeth": {
    "18": {
      "surfaces": { "V": "caries", "L": null, "M": null, "D": "amalgama", "O": null },
      "wholeTooth": { "absent": false, "restoRadicular": false, "protesisFija": false, "prosthesisExisting": false }
    },
    "24": {
      "surfaces": { "V": null, "L": null, "M": null, "D": null, "O": null },
      "wholeTooth": { "absent": true, "restoRadicular": false, "protesisFija": false, "prosthesisExisting": false }
    }
  }
}
```

### Que sucede internamente:

1. **Se crea el registro en `odontogramas`** -> devuelve `id_odontograma` (ej: 7)
2. **Se recorre cada diente:**
   - Diente 18: `tieneAlgo = true` (tiene "caries" en V y "amalgama" en D) -> **SE INSERTA** en `odontograma_dientes`
   - Diente 24: `tieneAlgo = true` (tiene `absent: true`) -> **SE INSERTA**
   - Los demas dientes: `tieneAlgo = false` -> **NO SE INSERTAN**

### Resultado en la base de datos:

- `odontogramas`: 1 fila nueva
- `odontograma_dientes`: 2 filas nuevas (diente 18 y diente 24)

---

## 6. Flujo Completo: Actualizar un Diente

Esto sucede cuando el usuario modifica un diente en el odontograma interactivo y presiona **"Actualizar odontograma"**.

### Paso 1: Frontend recorre los dientes modificados

```javascript
for (const [numeroDiente, datosDiente] of Object.entries(teeth)) {
    // Solo envia los que tienen algo marcado
    if (!tieneAlgo) continue;

    fetch(`${API}/odontograma/actualizarDiente`, {
        body: JSON.stringify({
            id_odontograma: idOdontograma,
            numero_diente: parseInt(numeroDiente),
            datos: { ... }
        })
    });
}
```

### Paso 2: Controller intenta actualizar

```javascript
const resultado = await modelo.actualizarDiente(id_odontograma, numero_diente, datosCompletos);
```

### Paso 3: Logica de UPDATE o INSERT

El controller verifica si el `UPDATE` afecto alguna fila:

- **Si `affectedRows > 0`**: El diente ya existia y se actualizo correctamente
- **Si `affectedRows === 0`**: El diente NO existia en la tabla (porque se creo el odontograma vacio y nunca se inserto ese diente). En este caso, **se inserta automaticamente**:

```javascript
if (resultado && resultado.affectedRows > 0) {
    return res.status(200).json({ message: true });
} else {
    // El diente no existe aun, insertarlo
    await modelo.insertarDiente(id_odontograma, numero_diente, datosCompletos);
    return res.status(200).json({ message: true });
}
```

### Por que es necesario este mecanismo?

Porque al crear un odontograma vacio, la tabla `odontograma_dientes` no tiene filas para esos dientes.
Cuando el usuario marca algo por primera vez en un diente, no se puede hacer UPDATE porque la fila
no existe. Por eso se usa la estrategia: **"intenta UPDATE, si no afecta filas, haz INSERT"**.

---

## 7. Flujo Completo: Listar Odontogramas de un Paciente

### Endpoint: `POST /odontograma/listarOdontogramas`

### Body:
```json
{ "id_paciente": 50 }
```

### Que sucede:

1. El controller llama a `modelo.listarOdontogramasPaciente(id_paciente)`
2. El model ejecuta: `SELECT * FROM odontogramas WHERE id_paciente = ? ORDER BY fechaCreacionOdontograma DESC`
3. Devuelve un array con todos los odontogramas (solo la tabla padre, sin los dientes)

### Respuesta ejemplo:

```json
[
  { "id_odontograma": 7, "id_paciente": 50, "fechaCreacionOdontograma": "2026-02-23T10:00:00" },
  { "id_odontograma": 5, "id_paciente": 50, "fechaCreacionOdontograma": "2026-02-20T14:30:00" }
]
```

---

## 8. Flujo Completo: Seleccionar un Odontograma por ID

### Endpoint: `POST /odontograma/seleccionarOdontogramaPorId`

### Body:
```json
{ "id_odontograma": 7 }
```

### Que sucede:

1. El controller llama a `modelo.seleccionarOdontogramaPorId(id_odontograma)`
2. El model ejecuta: `SELECT * FROM odontograma_dientes WHERE id_odontograma = ?`
3. Devuelve un array con los dientes que tienen informacion

### Respuesta ejemplo:

```json
[
  {
    "id_odontograma": 7,
    "numero_diente": 18,
    "ausente": 0,
    "resto_radicular": 0,
    "protesis_fija": 0,
    "protesis_existente": 0,
    "cara_V": "caries",
    "cara_L": null,
    "cara_M": null,
    "cara_D": "amalgama",
    "cara_O": null,
    "diagnostico_general": null,
    "observaciones": null,
    "movilidad": 0,
    "sondaje_mm": 0,
    "sangrado_sondaje": 0,
    "placa_bacteriana": 0,
    "caries_activa": 0,
    "obturacion": 0,
    "endodoncia": 0,
    "implante": 0,
    "corona": 0,
    "fractura": 0,
    "lesion_periapical": 0,
    "reabsorcion": 0
  }
]
```

### Transformacion en el Frontend

El frontend recibe este array y lo transforma al formato que entiende el componente `<Odontograma>`:

```javascript
function transformarDatosBackend(filas) {
    // 1. Crea los 52 dientes vacios
    const teeth = {};
    ALL_TEETH.forEach((n) => { teeth[String(n)] = emptyTooth(); });

    // 2. Sobreescribe solo los que vienen del backend
    for (const fila of filas) {
        teeth[String(fila.numero_diente)] = {
            surfaces: {
                V: fila.cara_V || null,
                L: fila.cara_L || null,
                // ...
            },
            wholeTooth: {
                absent: !!fila.ausente,    // Convierte 0/1 a false/true
                // ...
            },
        };
    }
    return { teeth };
}
```

---

## 9. Endpoints (Rutas)

Archivo: `backend/view/odontogramaRoutes.js`

Todas las rutas usan el metodo **POST** y estan bajo el prefijo `/odontograma`.

| Ruta | Controller | Descripcion |
|------|-----------|-------------|
| `POST /insertarOdontograma` | `crearOdontograma` | Crea un odontograma nuevo con sus dientes |
| `POST /seleccionarOdontogramaEspecifico` | `seleccionarOdontogramaController` | Trae el odontograma mas reciente de un paciente con sus dientes |
| `POST /listarOdontogramas` | `listarOdontogramasController` | Lista todos los odontogramas de un paciente (sin dientes) |
| `POST /seleccionarOdontogramaPorId` | `seleccionarOdontogramaPorIdController` | Trae los dientes de un odontograma especifico |
| `POST /actualizarDiente` | `actualizarDienteController` | Actualiza (o inserta) un diente especifico |

---

## 10. Model - Metodos Detallados

Archivo: `backend/model/Odontograma.js`

### `crearOdontograma(id_paciente)`

- **Tabla:** `odontogramas`
- **Operacion:** INSERT
- **SQL:** `INSERT INTO odontogramas (id_paciente, fechaCreacionOdontograma, fechaModificacionOdontograma) VALUES (?, NOW(), NOW())`
- **Retorna:** El resultado del INSERT, que incluye `insertId` (el id_odontograma generado)

### `seleccionarOdontogramasPacientes(id_paciente)`

- **Tablas:** `odontogramas` + `odontograma_dientes`
- **Operacion:** 2 SELECTs encadenados
- **Logica:**
  1. Busca el odontograma mas reciente del paciente (`ORDER BY ... DESC LIMIT 1`)
  2. Con ese `id_odontograma`, busca todos sus dientes
- **Retorna:** Array de dientes del odontograma mas reciente

### `listarOdontogramasPaciente(id_paciente)`

- **Tabla:** `odontogramas`
- **Operacion:** SELECT
- **SQL:** `SELECT * FROM odontogramas WHERE id_paciente = ? ORDER BY fechaCreacionOdontograma DESC`
- **Retorna:** Array de todos los odontogramas del paciente (sin dientes)

### `seleccionarOdontogramaPorId(id_odontograma)`

- **Tabla:** `odontograma_dientes`
- **Operacion:** SELECT
- **SQL:** `SELECT * FROM odontograma_dientes WHERE id_odontograma = ?`
- **Retorna:** Array de dientes de ese odontograma especifico

### `actualizarDiente(id_odontograma, numero_diente, datos)`

- **Tabla:** `odontograma_dientes`
- **Operacion:** UPDATE
- **SQL:** Actualiza TODAS las columnas del diente (caras, estados, campos clinicos, auditoria)
- **Condicion:** `WHERE id_odontograma = ? AND numero_diente = ?`
- **Retorna:** Resultado del UPDATE con `affectedRows` (0 si el diente no existia)

### `insertarDiente(id_odontograma, numero_diente, datos)`

- **Tabla:** `odontograma_dientes`
- **Operacion:** INSERT
- **Parametro:** Recibe un objeto `datos` con todas las columnas
- **SQL:** Inserta una fila con todas las columnas (caras, estados, campos clinicos, auditoria)
- **Retorna:** Resultado del INSERT

---

## 11. Controller - Metodos Detallados

Archivo: `backend/controller/OdontogramaController.js`

### `crearOdontograma(req, res)`

**Body esperado:**
```json
{
  "id_paciente": 50,
  "teeth": { "18": { "surfaces": {...}, "wholeTooth": {...} }, ... }
}
```

**Logica:**
1. Valida que venga `id_paciente`
2. Llama a `modelo.crearOdontograma(id_paciente)` -> obtiene `id_odontograma`
3. Recorre cada diente del objeto `teeth`
4. Para cada diente evalua `tieneAlgo`:
   - Si tiene algo marcado en las caras (caries, amalgama, etc.) o en el diente completo (ausente, protesis, etc.) -> llama a `modelo.insertarDiente()`
   - Si no tiene nada -> lo ignora (no se inserta)
5. Responde con `{ message: true, id_odontograma }`

### `actualizarDienteController(req, res)`

**Body esperado:**
```json
{
  "id_odontograma": 7,
  "numero_diente": 18,
  "datos": {
    "ausente": false,
    "cara_V": "caries",
    "cara_L": null,
    "diagnostico_general": "Caries profunda",
    "movilidad": 0,
    ...
  }
}
```

**Logica:**
1. Valida que vengan los 3 campos requeridos
2. Arma `datosCompletos` normalizando booleanos a 0/1
3. Intenta UPDATE con `modelo.actualizarDiente()`
4. Si `affectedRows > 0` -> exito, el diente existia y se actualizo
5. Si `affectedRows === 0` -> el diente no existia, hace INSERT con `modelo.insertarDiente()`
6. En ambos casos responde `{ message: true }`

### `listarOdontogramasController(req, res)`

**Body esperado:**
```json
{ "id_paciente": 50 }
```

**Logica:** Simplemente llama al model y devuelve el resultado.

### `seleccionarOdontogramaPorIdController(req, res)`

**Body esperado:**
```json
{ "id_odontograma": 7 }
```

**Logica:** Simplemente llama al model y devuelve los dientes de ese odontograma.

---

## 12. Frontend - Componente Odontograma.jsx

Archivo: `frontend/src/Componentes/Odontograma.jsx`

Este es el componente visual interactivo que renderiza el odontograma completo.

### Props

| Prop | Tipo | Descripcion |
|------|------|-------------|
| `patientId` | string/number | ID del paciente |
| `idOdontograma` | number | ID del odontograma (necesario para actualizar) |
| `initialData` | object | Datos iniciales `{ teeth: {...} }` cargados del backend |
| `onChange` | function | Callback que se ejecuta cada vez que cambia algun diente |
| `ref` | React ref | Permite al padre llamar a export/import/reset |

### Estado interno

- `teeth` — Objeto con los 52 dientes y sus estados
- `activeTool` — Herramienta seleccionada en la toolbar
- `tooltip` — Info del ultimo click (diente, cara, estado)
- `guardando` — Boolean que indica si se esta ejecutando la actualizacion

### Herramientas disponibles

| ID | Label | Tipo | Color | Aplica a |
|----|-------|------|-------|----------|
| `caries` | Caries | surface | Rojo | Caras individuales |
| `amalgama` | Amalgama | surface | Gris | Caras individuales |
| `resina` | Resina | surface | Cyan | Caras individuales |
| `amalgamaAntigua` | Amalgama antigua | surface | Gris oscuro | Caras individuales |
| `resinaAntigua` | Resina antigua | surface | Cyan oscuro | Caras individuales |
| `amalgamaDefectuosa` | Amalgama defect. | surface | Naranja | Caras individuales |
| `eraser` | Borrar | any | Slate | Caras o diente completo |
| `absent` | Ausente | whole | Negro | Diente completo |
| `restoRadicular` | Resto radicular | whole | Rojo | Diente completo |
| `protesisFija` | Protesis fija | whole | Verde | Diente completo |
| `prosthesisExisting` | Protesis exist. | whole | Azul | Diente completo |

### Funcion `handleActualizar`

Al presionar el boton verde "Actualizar odontograma":

1. Recorre todos los 52 dientes
2. Filtra solo los que tienen algo marcado (`tieneAlgo`)
3. Por cada diente con datos, envia un POST a `/odontograma/actualizarDiente`
4. Si alguno falla, muestra toast de error y se detiene
5. Si todos tienen exito, muestra toast de exito

---

## 13. Frontend - Pagina odontogramasPaciente

Archivo: `frontend/src/app/dashboard/odontogramasPaciente/[id_paciente]/page.jsx`

### Que hace esta pagina

1. Recibe el `id_paciente` de la URL (parametro dinamico de Next.js)
2. Al cargar, llama a `cargarTodosLosOdontogramas()`:
   - Primero: obtiene la lista de odontogramas con `/listarOdontogramas`
   - Despues: por cada odontograma, obtiene sus dientes con `/seleccionarOdontogramaPorId`
   - Transforma los datos del backend al formato del componente con `transformarDatosBackend()`
3. Renderiza cada odontograma dentro de una tarjeta con su fecha y el componente `<Odontograma>`
4. Tiene un boton "Crear nuevo odontograma" que crea uno vacio

### Funcion `transformarDatosBackend(filas)`

Convierte el array de filas SQL a un objeto `{ teeth: {...} }` que entiende el componente:

- Crea los 52 dientes vacios
- Sobreescribe solo los que vienen del backend
- Convierte `0/1` de MySQL a `false/true` de JavaScript (con `!!fila.ausente`)
- Convierte strings vacios a `null` (con `fila.cara_V || null`)

---

## 14. Numeracion FDI de los Dientes

El sistema usa la numeracion FDI (Federation Dentaire Internationale), donde el primer digito indica el cuadrante y el segundo la posicion del diente.

### Denticion Permanente (adultos) - 32 dientes

```
Cuadrante 1 (superior derecho): 18 17 16 15 14 13 12 11
Cuadrante 2 (superior izquierdo): 21 22 23 24 25 26 27 28
Cuadrante 3 (inferior izquierdo): 38 37 36 35 34 33 32 31
Cuadrante 4 (inferior derecho): 41 42 43 44 45 46 47 48
```

### Denticion Temporal (ninos) - 20 dientes

```
Cuadrante 5 (superior derecho): 55 54 53 52 51
Cuadrante 6 (superior izquierdo): 61 62 63 64 65
Cuadrante 7 (inferior izquierdo): 75 74 73 72 71
Cuadrante 8 (inferior derecho): 81 82 83 84 85
```

### Significado del segundo digito

| Digito | Diente |
|--------|--------|
| 1 | Incisivo central |
| 2 | Incisivo lateral |
| 3 | Canino |
| 4 | Primer premolar (permanente) / Primer molar (temporal) |
| 5 | Segundo premolar (permanente) / Segundo molar (temporal) |
| 6 | Primer molar |
| 7 | Segundo molar |
| 8 | Tercer molar (muela del juicio) |

---

## 15. Valores Posibles por Campo

### Caras del diente (cara_V, cara_L, cara_M, cara_D, cara_O)

| Valor | Significado | Color en el SVG |
|-------|------------|----------------|
| `null` | Sin hallazgo | Gris claro (#e2e8f0) |
| `"caries"` | Caries activa | Rojo (#ef4444) |
| `"amalgama"` | Restauracion con amalgama | Gris (#9ca3af) |
| `"resina"` | Restauracion con resina | Cyan (#22d3ee) |
| `"amalgamaAntigua"` | Amalgama antigua | Gris oscuro (#4b5563) |
| `"resinaAntigua"` | Resina antigua | Cyan oscuro (#0e7490) |
| `"amalgamaDefectuosa"` | Amalgama en mal estado | Naranja (#f97316) |

### Estados del diente completo

| Campo | Valor 1 | Representacion visual |
|-------|---------|----------------------|
| `ausente` | El diente no esta | Rectangulo negro semitransparente |
| `resto_radicular` | Solo queda la raiz | X roja sobre el diente |
| `protesis_fija` | Tiene protesis fija | Borde verde alrededor |
| `protesis_existente` | Tiene protesis previa | Borde azul alrededor |

---

## 16. ALTER TABLE para Columnas Nuevas

Si tu tabla `odontograma_dientes` no tiene las columnas clinicas, ejecuta este SQL:

```sql
ALTER TABLE odontograma_dientes
  ADD COLUMN diagnostico_general VARCHAR(500) DEFAULT NULL,
  ADD COLUMN observaciones TEXT DEFAULT NULL,
  ADD COLUMN movilidad TINYINT(4) DEFAULT 0,
  ADD COLUMN sondaje_mm TINYINT(4) DEFAULT 0,
  ADD COLUMN sangrado_sondaje TINYINT(4) DEFAULT 0,
  ADD COLUMN placa_bacteriana TINYINT(4) DEFAULT 0,
  ADD COLUMN caries_activa TINYINT(4) DEFAULT 0,
  ADD COLUMN obturacion TINYINT(4) DEFAULT 0,
  ADD COLUMN endodoncia TINYINT(4) DEFAULT 0,
  ADD COLUMN implante TINYINT(4) DEFAULT 0,
  ADD COLUMN corona TINYINT(4) DEFAULT 0,
  ADD COLUMN fractura TINYINT(4) DEFAULT 0,
  ADD COLUMN lesion_periapical TINYINT(4) DEFAULT 0,
  ADD COLUMN reabsorcion TINYINT(4) DEFAULT 0,
  ADD COLUMN fecha_registro DATETIME DEFAULT NULL,
  ADD COLUMN fecha_actualizacion DATETIME DEFAULT NULL,
  ADD COLUMN usuario_registro INT(11) DEFAULT NULL,
  ADD COLUMN usuario_actualizacion INT(11) DEFAULT NULL;
```

Esto agrega las columnas sin afectar los datos existentes. Todas tienen valores por defecto (`NULL` o `0`), asi que las filas anteriores seguiran funcionando normalmente.
