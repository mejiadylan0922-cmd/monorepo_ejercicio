// responsabilidad: recibir el archivo de la imajen y guardarlo en la carpeta uploads/.
// a mysql solamente le llegara la ruta (un texto), nunca el archivo.
import multer from "multer"
import path from "node:path"
import fs from "node:fs"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname (fileURLToPath(import.meta.url))
export const carpeta_imajenes = path.join(__dirname, "uploads")
fs.mkdirSync (carpeta_imajenes, {recursive:true}) // crea la carpeta en caso de que no exista

const almacenamiento = multer.diskStorage({
    destination: CARPETA_IMAGENES,
    // Nombre unico: fecha + extension original ( Asi las fotos no se pisan)."foto img")
    filename: (peticion, archivo, devolver) =>
        devolver(null, Date.now() + path.extname(archivo.originalname).toLowerCase()),
})

const limite_mb = 2 // maximo 2 mb

export const subirImajen = multer ({
    storage: almacenamiento,
    limits:{fileSize: limite_mb * 1024 * 1024},
    fileFilter: (peticion, archivo, devolver)=>(null, archivo.mimetype.startsWith("image/")), // solo imajenes
})

// borra una imajen del disco a partir de la ruta guardada en la base (ej. /uploads/123.jpg).
export function borrarimajenes(ruta){
    if (!ruta)return
    fs.unlink(path.join(__dirname, ruta),()=>{}) // si el archivo no existe, no pasa nada.
}