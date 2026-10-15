// responsabilidad : este archivo habla con el backend. los componenetes no saben nada de fetch ni de URL
export const URL_BACKEND = "https://localhost:3000"

async function leerRespuestas(respuesta) {
    const datos = await respuesta.json()
    if (!respuesta.ok) throw new Error (datos.error ??  "Error inesperado")
        return datos
}

export const ListaArticulos = () => fetch (`${URL_BACKEND} /api/articulos`).then(leerRespuestas)

export const crearArticulo = datosformulario =>
    fetch(`${URL_BACKEND} /api/articulos`, {method: "POST", body: datosformulario}).then(leerRespuestas)

export const editarArticulos = (id, datosformulario) =>
    fetch(`${URL_BACKEND}/api/articulos/${id}`, {method: "PUT", body: datosformulario}).then(leerRespuestas)

export const eliminarArticulo = id =>
    fetch(`${URL_BACKEND}/api/articulos/${id}`, {method: "DELETE"}).then(leerRespuestas)