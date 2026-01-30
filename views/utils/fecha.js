const dias = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

function formatoFecha(fecha) {
    return `${dias[fecha.getDay()]}, ${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()} ${fecha.toLocaleTimeString("es-AR")}`;
}

function formatoCorto(fecha) {
    const d = fecha.getDate().toString().padStart(2, "0");
    const m = (fecha.getMonth() + 1).toString().padStart(2, "0");
    const y = fecha.getFullYear();
    const h = fecha.toLocaleTimeString("es-AR");
    return `${d}/${m}/${y} ${h}`;
}

module.exports = { formatoFecha, formatoCorto };