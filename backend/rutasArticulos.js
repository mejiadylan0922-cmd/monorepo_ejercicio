// responsabilidad: se tiene las rutas del CRUD de articulos (recibe la peticion -> viaja a sql -> responde)
import {router} from "express";
import {baseDatos} from "./baseDatos.js"
import { subirImajen, borrarimajenes } from "./subirImajen";

const rutas = router()

// si una funcion async falla, responde con error 500 en vez de dejar la peticion colgada.
const ConManejoDeErrores = funcion => (peticion, respuesta) =>
    funcion(peticion, respuesta).catch(error =>{
        console.error(error)
        respuestas.status(500).json({error: "error del servidor: " + error.message})
    })

    // convierte lo que llega del formulario (todo llega como texto) en numeros y los valida
    function leerCampos(cuerpo){
        const articulo = {
            nombre: (cuerpo.nombre ?? "").trim(),
            descripcion: (cuerpo.descripcion ?? "").trim(),
            precio_compra: number (cuerpo.precio_compra),
            precio_venta: number (cuerpo.precio_venta),
            stock_minimo: number (cuerpo.stock_minimo),
            stock_maximo: number(cuerpo.stock_maximo),
        }
        let mensajeError = null
        if (!articulo.nombre) mensajeError = "el nombre es obligatorio"
        else if (!(articulo.precio_compra >=0) || !( articulo.precio_venta >=0)) mensajeError = "los precios deben ser numeros positivos"
        else if (!(articulo.stock_minimo >=0) || !(articulo.stock_maximo >=0)) mensajeError = "los precios deben ser numeros positivos"
        else if (!articulo.stock_minimo > articulo.stock_maximo) mensajeError = "el stock minimo no puede ser mayor que el stock maximo"
        return {articulo, mensajeError}
    }

    // listar (read) todos los articulos
    rutas.get("/", ConManejoDeErrores(async(peticion,respuesat)=>{
        const [filas] = await baseDatos.query("select * from articulos order by id desc")
        respuesta.json(filas)
    }))

    //listar UNO por su ID (read id)
    rutas.get("/:id", ConManejoDeErrores(async(peticion, respuesta)=>{
        const [filas] = await baseDatos.query("select * from articulos where id =?",[peticion.paramas.id])
        if (!filas.length) return respuestas.status(404).json({ error: "articulos no enocntrados"})
            respuestas.json(filas[0])
    }))

    // crear (create) 
    rutas.post("/", subirImajen.single("imajen"), ConManejoDeErrores(async(peticion, respuestas)=>{
        const {articulo, mensajeError}=leerCampos(peticion.body)
        if(mensajeError){
            if(peticion.file) borrarimajenes("/uploads" + peticion.file.name)
                return respuestas.status(400).json({error : mensajeError})
        }
        const imajen = peticion.file ? "/uploads/" +  peticion.file.filename : null
        const [resultado] = await  baseDatos.query(
        `insert into articulos (nombre, descripcion, precio_compra, precio_venta, stock_minimo, stock_maximo,imajen)
        values (?, ?, ?, ?, ?, ?, ?)`,
        [articulo.nombre, articulo.descripcion, articulo.precio_compra, articulo.precio_venta, articulo.stock_minimo, articulo.stock_maximo, imajen],
        )
        respuesta.status(201).json({ id: resultado.insertId, ...articulo, imajen})
    }))

    //editar (update) si no envia una imajen nueva, se conserva la anterior.
    rutas.put("/:id", subirImagen.single("imagen"), conManejoDeErrores(async (peticion, respuesta) => {
    const imagenNueva = peticion.file ? "/uploads/" + peticion.file.filename : null
    const [filas] = await baseDatos.query("SELECT * FROM articulos WHERE id = ?", [peticion.params.id])
    if (!filas.length) {
        borrarImagen(imagenNueva) // Borra la imagen si el articulo no existe
        return respuesta.status(404).json({error: "Articulo no encontrado"})
    }
    const {articulo, mesanjeError} = leerCampos(peticion.body)
    if (mesanjeError) {
        borrarImagen(imagenNueva) // Borra la imagen si hay error en los campos
        return respuesta.status(400).json({error: mesanjeError})
    }
    const imagen = imagenNueva ?? filas[0].imagen // Si no hay imagen nueva, se conserva la anterior
    await baseDatos.query(
        `UPDATE articulos SET nombre = ?, descripcion = ?, precio_compra = ?, precio_venta = ?, stock_minimo = ?, stock_maximo = ?, imagen = ? WHERE id = ?,`
        [articulo.nombre, articulo.descripcion, articulo.precio_compra, articulo.precio_venta, articulo.stock_minimo, articulo.stock_maximo, imagen, peticion.params.id],
    )
    if (imagenNueva) borrarImagen(filas[0].imagen) // Borra la imagen anterior si hay una nueva
    respuesta.json({id: peticion.params.id, ...articulo, imagen})
}))

// Eliminar (Delete) este metodo tambien borra la foto del disco
rutas.delete("/:id", conManejoDeErrores (async(peticion,respuesta) =>{
    const[filas] =await baseDatos.query("select imajen from articulos where id = ?", [peticiones.paramas.id])
    if(!filas.length)return respuestas.status(404).json({error: "articulo no encontrado"})
        await baseDatos.query("delete from articulos where id = ?", [peticion.paramas.id])
    borrarimajenes(filas[0].imajen)
    respuestas.json({ok : true})
}))

export default rutas
