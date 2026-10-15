// resposabilidas: encender el servidor y conectar las piezas (cors, json, imajenes y rutas).
import express from "express"
import cors from "cors"
import rutasArticulos from "./rutasArticulos"
import{carpeta_imajenes} from "./subirImajen"

const aplicacion = express ()
const puerto = 3000

aplicacion.use(cors()) // permite que react (pueeto 5173) llame a este servidor
aplicacion.use(express.json()) // entiende peticiones con formato o cuerpo .json
aplicacion.use("/uploads", express.static(carpeta_imajenes)) // en el entorno local muestra la imajen
aplicacion.use("/api/articulos", rutasArticulos) // todas las rutas del crud

// errores de multer (archivo demasiado grande , etc.)
aplicacion.use((error, peticion, respuesta, siguiente) => {
    const mensaje = error.code === "LIMIT_FILE_SIZE" 
    ? "la imajen es demasiado pesada (maximo 2 mb)"
    : error.message 
    respuesta.status(400).json({mensaje})
})

aplicacion.listen(puerto, () => console.log(`servidor escuchando en http://localhost:${puerto}`))