
// ==========================================
// CLEANBEAUTY SCAN
// Analisis lexico, sintactico y semantico
// Analizador de ingredientes + Chatbot
// Lenguajes y Automatas 2
// ==========================================


// ==========================================
// 1. VARIABLES GLOBALES
// ==========================================

let ultimoTextoAnalizado = "";
let ultimoDetalleIngredientes = [];
let ultimoErrorAnalisis = "";
let hayAnalisisDisponible = false;


// ==========================================
// 2. NORMALIZACION Y SEGURIDAD
// ==========================================

function normalizarTexto(texto) {
    return String(texto)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9, ]/g, "");
}

function escaparHTML(texto) {
    return String(texto).replace(/[&<>"']/g, caracter => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[caracter]);
}


// ==========================================
// 3. BASE DE DATOS DE INGREDIENTES
// ==========================================

let peligrosos = [
    "parabenos", "methylparaben", "propylparaben", "butylparaben",
    "ftalatos", "phthalates", "dep", "dbp", "dehp",
    "mercurio", "mercury", "mercurous chloride", "thimerosal",
    "formaldehido", "formaldehyde", "formalin",
    "triclosan", "tolueno", "toluene",
    "bha", "butylated hydroxyanisole",
    "bht", "butylated hydroxytoluene",
    "esteres de glicol", "glycol ethers",
    "p fenilendiamina", "ppd", "p phenylenediamine",
    "metilisotiazolinona", "methylisothiazolinone", "mit",
    "dea", "mea", "tea",
    "diethanolamine", "monoethanolamine", "triethanolamine",
    "nitrosaminas", "nitrosamines",
    "dmdm hydantoin", "imidazolidinyl urea",
    "alquitran", "coal tar"
].map(normalizarTexto);


let irritantes = [
    "alcohol denat", "propilenglicol", "propylene glycol",
    "dioxido de titanio", "titanium dioxide", "tio2",
    "sodium lauryl sulfate", "laurilsulfato de sodio", "sls",
    "sal de aluminio",
    "pvp va copolimero", "pvp va copolymer",
    "peg", "ppg", "polyethylene glycol", "polypropylene glycol",
    "fluoruro", "fluoride",
    "aluminium chlorohydrate", "clorhidrato de aluminio",
    "disodium edta", "trisodium edta", "edta"
].map(normalizarTexto);


let seguros = [
    "agua", "water", "aqua",
    "glycerin", "glicerina",
    "aloe vera", "aloe barbadensis",
    "vitamina e", "tocopherol",
    "aceite de coco", "coconut oil",
    "aceite de jojoba", "jojoba oil",
    "manteca de karite", "shea butter",
    "extracto de manzanilla", "chamomile extract"
].map(normalizarTexto);


// ==========================================
// 4. CLASIFICACION DE INGREDIENTES
// ==========================================

function obtenerClasificacion(ingrediente) {

    const texto = normalizarTexto(ingrediente);

    if (peligrosos.some(p => texto.includes(p))) {
        return "PELIGROSO";
    }

    if (irritantes.some(i => texto.includes(i))) {
        return "IRRITANTE";
    }

    if (seguros.some(s => texto.includes(s))) {
        return "SEGURO";
    }

    return "NO ENCONTRADO";
}


function obtenerColor(clasificacion) {

    switch (clasificacion) {

        case "PELIGROSO":
            return "#e53935";

        case "IRRITANTE":
            return "#ef8c00";

        case "SEGURO":
            return "#218838";

        default:
            return "#777777";
    }
}


// ==========================================
// 5. ANALISIS PRINCIPAL
// ==========================================

function analizar() {

    const campo = document.getElementById("ingredientes");
    const alerta = document.getElementById("alerta");
    const detalle = document.getElementById("detalle");
    const resultado = document.getElementById("resultado");

    const textoOriginal = campo.value;

    alerta.textContent = "";
    detalle.innerHTML = "";
    resultado.innerHTML = "";

    document.getElementById("modal").style.display = "none";
    document.getElementById("modalAnalisis").style.display = "none";

    ultimoTextoAnalizado = textoOriginal;
    ultimoDetalleIngredientes = [];
    ultimoErrorAnalisis = "";
    hayAnalisisDisponible = true;

    document.getElementById("opcionesAnalisis").style.display = "block";


    // ENTRADA VACIA

    if (!textoOriginal.trim()) {

        ultimoErrorAnalisis =
            "Error de entrada: no se escribieron ingredientes.";

        alerta.textContent =
            "⚠ Ingresa al menos un ingrediente.";

        alerta.style.color = "red";

        mostrarAvisoError(detalle);

        return;
    }


    // VALIDACIONES SINTACTICAS

    const empiezaConComa = /^\s*,/.test(textoOriginal);
    const terminaEnComa = /,\s*$/.test(textoOriginal);
    const comasConsecutivas = /,\s*,/.test(textoOriginal);

    const erroresSintacticos = [];

    if (empiezaConComa) {
        erroresSintacticos.push("La entrada comienza con una coma.");
    }

    if (terminaEnComa) {
        erroresSintacticos.push("La entrada termina con una coma.");
    }

    if (comasConsecutivas) {
        erroresSintacticos.push("Hay comas consecutivas.");
    }

    if (erroresSintacticos.length > 0) {

        ultimoErrorAnalisis =
            "Error sintáctico: " + erroresSintacticos.join(" ");
    }


    // NORMALIZACION

    const texto = normalizarTexto(textoOriginal);

    const lista = texto
        .split(",")
        .map(ingrediente => ingrediente.trim())
        .filter(ingrediente => ingrediente.length > 0);


    if (lista.length === 0) {

        if (!ultimoErrorAnalisis) {
            ultimoErrorAnalisis =
                "Error: no se encontraron ingredientes válidos.";
        }

        alerta.textContent =
            "⚠ No hay ingredientes válidos para analizar.";

        alerta.style.color = "red";

        mostrarAvisoError(detalle);

        return;
    }


    // CLASIFICACION

    ultimoDetalleIngredientes = lista.map(ingrediente => ({
        ingrediente: ingrediente,
        clasificacion: obtenerClasificacion(ingrediente)
    }));


    let hayPeligroso = false;
    let hayIrritante = false;
    let haySeguro = false;
    let hayDesconocido = false;


    ultimoDetalleIngredientes.forEach(dato => {

        const li = document.createElement("li");

        li.textContent =
            dato.ingrediente + " → " + dato.clasificacion;

        li.style.color = obtenerColor(dato.clasificacion);

        if (dato.clasificacion === "PELIGROSO") {
            hayPeligroso = true;

        } else if (dato.clasificacion === "IRRITANTE") {
            hayIrritante = true;

        } else if (dato.clasificacion === "SEGURO") {
            haySeguro = true;

        } else {
            hayDesconocido = true;
        }

        detalle.appendChild(li);
        resultado.appendChild(li.cloneNode(true));

    });


    // RESULTADO GENERAL

    let mensajeGeneral;
    let colorGeneral;

    if (hayPeligroso) {

        mensajeGeneral =
            "🔴 Contiene ingredientes clasificados como peligrosos.";

        colorGeneral = "red";

    } else if (hayIrritante) {

        mensajeGeneral =
            "🟠 Contiene ingredientes clasificados como irritantes.";

        colorGeneral = "orange";

    } else if (hayDesconocido && !haySeguro) {

        mensajeGeneral =
            "⚠ No se encontraron coincidencias en la base de datos.";

        colorGeneral = "gray";

    } else if (haySeguro && !hayDesconocido) {

        mensajeGeneral =
            "🟢 Los ingredientes identificados coinciden con la lista de seguros.";

        colorGeneral = "green";

    } else {

        mensajeGeneral =
            "⚠ Hay ingredientes que no se pudieron identificar.";

        colorGeneral = "gray";
    }


    if (ultimoErrorAnalisis) {

        alerta.textContent = "⚠ " + ultimoErrorAnalisis;
        alerta.style.color = "red";

        mostrarAvisoError(detalle);

    } else {

        alerta.textContent = mensajeGeneral;
        alerta.style.color = colorGeneral;
    }


    alerta.style.fontWeight = "bold";
    alerta.style.fontSize = "18px";


    // INGREDIENTES NO ENCONTRADOS

    const noEncontrados = ultimoDetalleIngredientes
        .filter(d => d.clasificacion === "NO ENCONTRADO")
        .map(d => d.ingrediente);

    if (noEncontrados.length > 0) {

        const aviso = document.createElement("p");

        aviso.textContent =
            "⚠ Ingredientes no encontrados: " +
            noEncontrados.join(", ");

        aviso.style.color = "gray";

        detalle.appendChild(aviso);
    }


    document.getElementById("modal").style.display = "block";
}


// ==========================================
// 6. MOSTRAR ERRORES
// ==========================================

function mostrarAvisoError(contenedor) {

    const aviso = document.createElement("div");

    aviso.style.color = "#c62828";
    aviso.style.background = "#fff0f0";
    aviso.style.border = "1px solid #e53935";
    aviso.style.borderRadius = "10px";
    aviso.style.padding = "12px";
    aviso.style.margin = "10px";

    aviso.textContent = "⚠ " + ultimoErrorAnalisis;

    contenedor.prepend(aviso);
}


function mostrarErrorEnAnalisis() {

    if (!ultimoErrorAnalisis) {
        return "";
    }

    return `
        <div class="paso-analisis"
             style="border:2px solid #e53935;
                    background:#fff0f0;
                    padding:12px;
                    border-radius:10px;
                    margin-bottom:15px;">

            <h3 style="color:#e53935;">⚠ Error detectado</h3>

            <p>${escaparHTML(ultimoErrorAnalisis)}</p>

            <p>Revisa la entrada original y corrige los errores.</p>
        </div>
    `;
}


// ==========================================
// 7. VISUALIZACIONES DE ANALISIS
// ==========================================

function mostrarAnalisis(tipo) {

    if (!hayAnalisisDisponible) {
        alert("Primero presiona Analizar.");
        return;
    }

    const titulo = document.getElementById("tituloAnalisis");
    const contenido = document.getElementById("contenidoAnalisis");

    contenido.innerHTML = "";

    switch (tipo) {

        case "lexico":
            titulo.textContent = "Análisis léxico";
            contenido.innerHTML = visualizarLexico();
            break;

        case "sintactico":
            titulo.textContent = "Análisis sintáctico";
            contenido.innerHTML = visualizarSintactico();
            break;

        case "semantico":
            titulo.textContent = "Análisis semántico";
            contenido.innerHTML = visualizarSemantico();
            break;

        case "tokens":
            titulo.textContent = "Tokens analizados";
            contenido.innerHTML = visualizarTokens();
            break;

        case "arbol":
            titulo.textContent = "Árbol de expresiones";
            contenido.innerHTML = visualizarArbol();
            break;

        default:
            contenido.textContent = "Análisis no disponible.";
    }

    document.getElementById("modalAnalisis").style.display = "block";
}


function cerrarAnalisis() {
    document.getElementById("modalAnalisis").style.display = "none";
}


function cerrarModal() {
    document.getElementById("modal").style.display = "none";
}


// ==========================================
// 8. ANALISIS LEXICO VISUAL
// ==========================================

function visualizarLexico() {

    const original = ultimoTextoAnalizado;
    const normalizado = normalizarTexto(original);

    const partes = normalizado.split(",");

    let html = mostrarErrorEnAnalisis() + `

        <div class="paso-analisis">
            <h3>1. Entrada original</h3>
            <p>${escaparHTML(original || "(entrada vacía)")}</p>
        </div>

        <div class="paso-analisis">
            <h3>2. Normalización</h3>
            <p>Conversión a minúsculas, eliminación de acentos
            y caracteres no reconocidos por la regla.</p>

            <code>${escaparHTML(normalizado || "(sin texto)")}</code>
        </div>

        <div class="paso-analisis">
            <h3>3. Identificación de tokens</h3>
    `;

    let contador = 0;

    partes.forEach((parte, index) => {

        const ingrediente = parte.trim();

        if (ingrediente) {

            contador++;

            html += `
                <span class="etiqueta-token">
                    INGREDIENTE ${contador}: ${escaparHTML(ingrediente)}
                </span>
            `;

        } else {

            html += `
                <p class="estado-error">
                    ✗ Segmento vacío detectado en la posición ${index + 1}.
                </p>
            `;
        }

        if (index < partes.length - 1) {

            html += `
                <span class="etiqueta-token">SEPARADOR: ,</span>
            `;
        }
    });


    html += `
        </div>

        <p class="${ultimoErrorAnalisis ? "estado-error" : "estado-correcto"}">

            ${ultimoErrorAnalisis
                ? "✗ El análisis detectó errores en la entrada."
                : "✓ Se identificaron los términos de entrada."}

        </p>
    `;

    return html;
}


// ==========================================
// 9. ANALISIS SINTACTICO VISUAL
// ==========================================

function visualizarSintactico() {

    const original = ultimoTextoAnalizado;

    const ingredientes = original.split(",");

    const empiezaConComa = /^\s*,/.test(original);
    const terminaEnComa = /,\s*$/.test(original);
    const comasConsecutivas = /,\s*,/.test(original);
    const entradaVacia = !original.trim();

    let html = mostrarErrorEnAnalisis() + `

        <div class="paso-analisis">
            <h3>Regla sintáctica</h3>
            <p>Lista de ingredientes separados por comas.</p>
        </div>
    `;


    if (entradaVacia) {

        html += `
            <p class="estado-error">
                ✗ Error: la entrada está vacía.
                Escribe al menos un ingrediente.
            </p>
        `;

    } else {

        html += `
            <div class="arbol-expresiones">

                <div class="nodo-arbol">
                    Lista de ingredientes
                </div>

                <div class="rama-arbol"></div>

                <div class="hijos-arbol">
        `;

        ingredientes.forEach((ing, index) => {

            if (ing.trim()) {

                html += `
                    <div class="hijo-arbol">

                        <div class="nodo-arbol">
                            Ingrediente ${index + 1}
                        </div>

                        <div class="nodo-clasificacion">
                            ${escaparHTML(ing.trim())}
                        </div>

                    </div>
                `;
            }
        });

        html += `</div></div>`;
    }


    html += `
        <div class="paso-analisis">

            <h3>Validaciones sintácticas</h3>

            <p class="${empiezaConComa ? "estado-error" : "estado-correcto"}">
                ${empiezaConComa ? "✗" : "✓"}
                La entrada no debe comenzar con una coma.
            </p>

            <p class="${terminaEnComa ? "estado-error" : "estado-correcto"}">
                ${terminaEnComa ? "✗" : "✓"}
                La entrada no debe terminar con una coma.
            </p>

            <p class="${comasConsecutivas ? "estado-error" : "estado-correcto"}">
                ${comasConsecutivas ? "✗" : "✓"}
                No debe haber comas consecutivas.
            </p>

        </div>
    `;


    if (empiezaConComa || terminaEnComa ||
        comasConsecutivas || entradaVacia) {

        html += `
            <p class="estado-error">
                ⚠ La entrada no cumple las reglas sintácticas básicas.
            </p>
        `;

    } else {

        html += `
            <p class="estado-correcto">
                ✓ La estructura cumple las validaciones básicas.
            </p>
        `;
    }

    return html;
}


// ==========================================
// 10. ANALISIS SEMANTICO VISUAL
// ==========================================

function visualizarSemantico() {

    let html = mostrarErrorEnAnalisis() + `

        <div class="paso-analisis">
            <h3>Proceso semántico</h3>

            <p>Cada ingrediente se compara con las listas registradas
            para determinar si coincide con un término clasificado.</p>
        </div>
    `;


    if (ultimoDetalleIngredientes.length === 0) {

        html += `
            <p class="estado-error">
                ✗ No hay ingredientes disponibles para interpretar.
            </p>
        `;

        return html;
    }


    ultimoDetalleIngredientes.forEach(dato => {

        const color = obtenerColor(dato.clasificacion);

        let explicacion;

        switch (dato.clasificacion) {

            case "PELIGROSO":
                explicacion = "Coincide con un término de la lista de peligrosos.";
                break;

            case "IRRITANTE":
                explicacion = "Coincide con un término de la lista de irritantes.";
                break;

            case "SEGURO":
                explicacion = "Coincide con un término de la lista de seguros.";
                break;

            default:
                explicacion = "No se encontró coincidencia en las listas.";
        }


        html += `
            <div class="paso-analisis">

                <p><strong>Ingrediente:</strong>
                    ${escaparHTML(dato.ingrediente)}
                </p>

                <p><strong>Interpretación:</strong>
                    ${escaparHTML(explicacion)}
                </p>

                <p style="color:${color};font-weight:bold;">
                    Resultado: ${dato.clasificacion}
                </p>

            </div>
        `;
    });


    html += `
        <div class="paso-analisis">

            <h3>Resultado general</h3>

            <p>
                ${ultimoErrorAnalisis
                    ? "El resultado debe revisarse porque la entrada contiene errores."
                    : "La clasificación se obtuvo mediante las listas programadas."}
            </p>

            <p>
                Las categorías de esta aplicación no constituyen
                una evaluación médica ni garantizan la seguridad
                de un producto para todas las personas.
            </p>

        </div>
    `;

    return html;
}


// ==========================================
// 11. TABLA DE TOKENS
// ==========================================

function visualizarTokens() {

    const texto = normalizarTexto(ultimoTextoAnalizado);

    const partes = texto.split(",");

    let html = mostrarErrorEnAnalisis() + `

        <div class="paso-analisis">

            <p>Tokens generados a partir de la entrada normalizada.</p>

            <div style="overflow-x:auto;">

                <table style="width:100%;border-collapse:collapse;">

                    <thead>
                        <tr style="background:#fce4ec;">

                            <th style="padding:8px;border:1px solid #ddd;">
                                N.º
                            </th>

                            <th style="padding:8px;border:1px solid #ddd;">
                                Tipo
                            </th>

                            <th style="padding:8px;border:1px solid #ddd;">
                                Valor
                            </th>

                        </tr>
                    </thead>

                    <tbody>
    `;

    let numero = 1;


    if (!ultimoTextoAnalizado.trim()) {

        html += `
            <tr>
                <td colspan="3"
                    style="padding:8px;border:1px solid #ddd;color:red;">
                    No se generaron tokens porque la entrada está vacía.
                </td>
            </tr>
        `;

    } else {

        partes.forEach((parte, index) => {

            const ingrediente = parte.trim();

            if (ingrediente) {

                html += `
                    <tr>

                        <td style="padding:8px;border:1px solid #ddd;">
                            ${numero++}
                        </td>

                        <td style="padding:8px;border:1px solid #ddd;">
                            INGREDIENTE
                        </td>

                        <td style="padding:8px;border:1px solid #ddd;">
                            ${escaparHTML(ingrediente)}
                        </td>

                    </tr>
                `;

            } else {

                html += `
                    <tr>

                        <td style="padding:8px;border:1px solid #ddd;">
                            ${numero++}
                        </td>

                        <td style="padding:8px;border:1px solid #ddd;color:red;">
                            ERROR_VACIO
                        </td>

                        <td style="padding:8px;border:1px solid #ddd;">
                            No hay ingrediente
                        </td>

                    </tr>
                `;
            }


            if (index < partes.length - 1) {

                html += `
                    <tr>

                        <td style="padding:8px;border:1px solid #ddd;">
                            ${numero++}
                        </td>

                        <td style="padding:8px;border:1px solid #ddd;">
                            SEPARADOR
                        </td>

                        <td style="padding:8px;border:1px solid #ddd;">
                            ,
                        </td>

                    </tr>
                `;
            }
        });
    }


    html += `
                    </tbody>

                </table>

            </div>

            <p>Total de tokens mostrados: ${numero - 1}</p>

        </div>
    `;

    return html;
}


// ==========================================
// 12. ARBOL DE EXPRESIONES
// ==========================================

function visualizarArbol() {

    let html = mostrarErrorEnAnalisis() + `

        <div class="paso-analisis">
            <p>Representación visual de la lista y de las
            clasificaciones obtenidas.</p>
        </div>
    `;


    if (ultimoDetalleIngredientes.length === 0) {

        html += `
            <p class="estado-error">
                ✗ No se puede construir el árbol porque no hay ingredientes válidos.
            </p>
        `;

        return html;
    }


    html += `
        <div class="arbol-expresiones">

            <div class="nodo-arbol">
                LISTA DE INGREDIENTES
            </div>

            <div class="rama-arbol"></div>

            <div class="hijos-arbol">
    `;


    ultimoDetalleIngredientes.forEach(dato => {

        const color = obtenerColor(dato.clasificacion);

        html += `
            <div class="hijo-arbol">

                <div class="nodo-arbol">
                    ${escaparHTML(dato.ingrediente)}
                </div>

                <div class="rama-arbol"></div>

                <div class="nodo-clasificacion"
                     style="color:${color};border-color:${color};">

                    ${dato.clasificacion}

                </div>

            </div>
        `;
    });


    html += `
            </div>

        </div>

        <div class="paso-analisis">

            <p>
                Las ramas conectan cada ingrediente con su clasificación.
                Esta es una representación del procesamiento de la lista,
                no un árbol sintáctico formal de una gramática completa.
            </p>

        </div>
    `;

    return html;
}


// ==========================================
// 13. REINICIAR ANALIZADOR
// ==========================================

function reiniciar() {

    document.getElementById("ingredientes").value = "";

    document.getElementById("resultado").innerHTML = "";
    document.getElementById("alerta").innerHTML = "";
    document.getElementById("detalle").innerHTML = "";

    document.getElementById("modal").style.display = "none";

    document.getElementById("modalAnalisis").style.display = "none";

    document.getElementById("opcionesAnalisis").style.display = "none";

    ultimoTextoAnalizado = "";
    ultimoDetalleIngredientes = [];
    ultimoErrorAnalisis = "";
    hayAnalisisDisponible = false;
}


// ==========================================
// 14. MODALES INFORMATIVOS
// ==========================================

function abrirInfo(tipo) {

    const titulo = document.getElementById("tituloModal");
    const contenido = document.getElementById("contenidoModal");


    if (tipo === "nosotros") {

        titulo.textContent = "Quiénes somos";

        contenido.innerHTML = `

            <p>
                CleanBeauty Scan es un proyecto académico enfocado
                en analizar ingredientes de productos cosméticos
                y de cuidado personal.
            </p>

            <p>
                Busca facilitar la comprensión de nombres técnicos
                mediante la clasificación de ingredientes y la
                presentación de resultados claros.
            </p>

            <p>
                El proyecto aplica conceptos de análisis léxico,
                sintáctico y semántico.
            </p>

        `;

    } else if (tipo === "ingredientes") {

        titulo.textContent = "Ingredientes clasificados";

        contenido.innerHTML = `

            <ul>
                <li style="color:red;">Parabenos - Peligroso</li>
                <li style="color:orange;">Alcohol Denat - Irritante</li>
                <li style="color:green;">Agua - Seguro</li>
            </ul>

        `;

    } else if (tipo === "contacto") {

        titulo.textContent = "Contacto";

        contenido.innerHTML =
            "<p>Email: rosabarajas0309@gmail.com</p>";

    } else if (tipo === "soporteInfo") {

        titulo.textContent = "Soporte";

        contenido.innerHTML =
            "<p>Presiona el botón de ayuda para reportar un problema.</p>";
    }

    document.getElementById("modalInfo").style.display = "block";
}


function cerrarInfo() {

    document.getElementById("modalInfo").style.display = "none";
}


// ==========================================
// 15. SOPORTE POR EMAILJS
// ==========================================

function abrirSoporte() {

    document.getElementById("modalSoporte").style.display = "block";
}


function cerrarSoporte() {

    document.getElementById("modalSoporte").style.display = "none";
}


function enviarCorreo() {

    const nombre = document.getElementById("nombre").value.trim();

    const mensaje = document.getElementById("mensaje").value.trim();


    if (!nombre || !mensaje) {

        alert("Por favor, completa tu nombre y el mensaje.");

        return;
    }


    if (typeof emailjs === "undefined") {

        alert("El servicio de correo no está disponible.");

        return;
    }


    const params = {
        from_name: nombre,
        message: mensaje
    };


    emailjs.send(
        "service_4vmoemm",
        "template_wqi4zyd",
        params

    ).then(function () {

        alert("Mensaje enviado correctamente.");

        document.getElementById("nombre").value = "";
        document.getElementById("mensaje").value = "";

        cerrarSoporte();

    }).catch(function (error) {

        console.error("Error al enviar el correo:", error);

        alert("No se pudo enviar el mensaje. Intenta nuevamente.");

    });
}


// ==========================================
// 16. CAMBIO AUTOMATICO DE BANNER
// ==========================================

const imagenes = [
    "banner1.png",
    "banner2.png",
    "banner3.png",
    "banner4.png"
];

let indiceBanner = 0;


function cambiarBanner() {

    const banner = document.getElementById("bannerImg");

    if (!banner) return;

    indiceBanner = (indiceBanner + 1) % imagenes.length;

    banner.src = imagenes[indiceBanner];
}


if (document.getElementById("bannerImg")) {

    setInterval(cambiarBanner, 3000);

}


// ==========================================
// 17. CHATBOT BEAUTY ASSISTANT
// ==========================================


// ==========================================
// 17.1 CATALOGO DE INFORMACION
// ==========================================

const catalogoChat = [

    {
        nombre: "Parabenos",

        alias: [
            "parabenos",
            "methylparaben",
            "propylparaben",
            "butylparaben"
        ],

        funcion:
            "Se utilizan principalmente como conservantes en productos cosméticos.",

        efecto:
            "Algunas personas pueden presentar sensibilidad o reacciones cutáneas. En este proyecto están registrados en la categoría de peligrosos."
    },

    {
        nombre: "Ftalatos",

        alias: [
            "ftalatos",
            "phthalates",
            "dep",
            "dbp",
            "dehp"
        ],

        funcion:
            "Se utilizan en determinadas formulaciones para modificar propiedades del producto, como la flexibilidad o la duración de fragancias.",

        efecto:
            "Su evaluación depende del compuesto específico y de la exposición. En la base del proyecto están clasificados como peligrosos."
    },

    {
        nombre: "Mercurio",

        alias: [
            "mercurio",
            "mercury",
            "mercurous chloride",
            "thimerosal"
        ],

        funcion:
            "El mercurio y algunos de sus compuestos han sido utilizados en determinadas aplicaciones cosméticas.",

        efecto:
            "La exposición puede representar riesgos para la salud. Está clasificado como peligroso en este proyecto."
    },

    {
        nombre: "Propilenglicol",

        alias: [
            "propilenglicol",
            "propylene glycol"
        ],

        funcion:
            "Se utiliza como disolvente y humectante para ayudar a conservar la humedad de las formulaciones.",

        efecto:
            "En algunas personas puede provocar irritación o sensibilidad cutánea."
    },

    {
        nombre: "Glicerina",

        alias: [
            "glicerina",
            "glycerin"
        ],

        funcion:
            "Es un humectante que ayuda a atraer y retener agua en la superficie de la piel.",

        efecto:
            "Se utiliza en productos hidratantes y está registrada como segura en la base de este proyecto."
    },

    {
        nombre: "Aloe vera",

        alias: [
            "aloe vera",
            "aloe barbadensis"
        ],

        funcion:
            "Se utiliza como ingrediente acondicionador de la piel en productos cosméticos.",

        efecto:
            "Está registrada como segura en la base del proyecto, aunque la tolerancia puede variar entre personas."
    },

    {
        nombre: "Alcohol Denat",

        alias: [
            "alcohol denat"
        ],

        funcion:
            "Se utiliza como disolvente y puede ayudar a modificar la textura de un cosmético.",

        efecto:
            "En determinadas formulaciones puede resecar o irritar la piel."
    },

    {
        nombre: "Laurilsulfato de sodio (SLS)",

        alias: [
            "sodium lauryl sulfate",
            "laurilsulfato de sodio",
            "sls"
        ],

        funcion:
            "Es un tensioactivo utilizado para limpiar y producir espuma.",

        efecto:
            "Puede eliminar parte de los lípidos de la superficie cutánea y provocar resequedad o irritación."
    },

    {
        nombre: "Dióxido de titanio",

        alias: [
            "dioxido de titanio",
            "titanium dioxide",
            "tio2"
        ],

        funcion:
            "Se utiliza como pigmento, opacificante y, dependiendo de la formulación, como filtro UV.",

        efecto:
            "Su evaluación depende de su forma y vía de exposición. Está registrado como irritante en la base del proyecto."
    },

    {
        nombre: "Formaldehído",

        alias: [
            "formaldehido",
            "formaldehyde",
            "formalin"
        ],

        funcion:
            "Es una sustancia que ha sido utilizada como conservante en determinadas aplicaciones.",

        efecto:
            "Puede causar irritación y sensibilización. Está clasificado como peligroso en este proyecto."
    },

    {
        nombre: "Metilisotiazolinona",

        alias: [
            "metilisotiazolinona",
            "methylisothiazolinone",
            "mit"
        ],

        funcion:
            "Es un conservante utilizado para evitar el crecimiento de microorganismos.",

        efecto:
            "Puede provocar reacciones alérgicas de contacto en personas sensibilizadas."
    },

    {
        nombre: "EDTA",

        alias: [
            "disodium edta",
            "trisodium edta",
            "edta"
        ],

        funcion:
            "Es un agente quelante que ayuda a mejorar la estabilidad de las formulaciones.",

        efecto:
            "Está registrado como irritante en la base de datos del proyecto."
    },

    {
        nombre: "Triclosan",

        alias: [
            "triclosan"
        ],

        funcion:
            "Es un agente antimicrobiano que ha sido utilizado en productos de cuidado personal.",

        efecto:
            "Su evaluación depende de la concentración, el uso y la regulación aplicable. Está clasificado como peligroso en el proyecto."
    },

    {
        nombre: "Tolueno",

        alias: [
            "tolueno",
            "toluene"
        ],

        funcion:
            "Se utiliza como disolvente en determinadas formulaciones, especialmente en algunos productos para uñas.",

        efecto:
            "La exposición puede representar riesgos para la salud. Está registrado como peligroso en el proyecto."
    },

    {
        nombre: "PEG y PPG",

        alias: [
            "polyethylene glycol",
            "polypropylene glycol",
            "peg",
            "ppg"
        ],

        funcion:
            "Son familias de ingredientes utilizados para modificar la textura, viscosidad y otras propiedades de las formulaciones.",

        efecto:
            "La tolerancia depende del compuesto y de la formulación. Están registrados como irritantes en el proyecto."
    },

    {
        nombre: "Vitamina E",

        alias: [
            "vitamina e",
            "tocopherol"
        ],

        funcion:
            "Se utiliza como antioxidante en formulaciones cosméticas.",

        efecto:
            "Está registrada como segura en la base de datos del proyecto."
    },

    {
        nombre: "Manteca de karité",

        alias: [
            "manteca de karite",
            "shea butter"
        ],

        funcion:
            "Se utiliza como emoliente para ayudar a suavizar la piel.",

        efecto:
            "Está registrada como segura en la base de datos del proyecto."
    },

    {
        nombre: "Aceite de jojoba",

        alias: [
            "aceite de jojoba",
            "jojoba oil"
        ],

        funcion:
            "Se utiliza como emoliente y acondicionador de la piel.",

        efecto:
            "Está registrado como seguro en la base de datos del proyecto."
    },

    {
        nombre: "Agua",

        alias: [
            "agua",
            "water",
            "aqua"
        ],

        funcion:
            "Se utiliza como disolvente y componente de muchas formulaciones cosméticas.",

        efecto:
            "Está registrada como segura en la base de datos del proyecto."
    },

    {
        nombre: "Aceite de coco",

        alias: [
            "aceite de coco",
            "coconut oil"
        ],

        funcion:
            "Se utiliza como emoliente para acondicionar y suavizar la piel.",

        efecto:
            "Está registrado como seguro en la base de datos del proyecto."
    },

    {
        nombre: "Manzanilla",

        alias: [
            "extracto de manzanilla",
            "chamomile extract"
        ],

        funcion:
            "Se utiliza como ingrediente acondicionador de la piel.",

        efecto:
            "Está registrada como segura en la base de datos del proyecto."
    }

];


// ==========================================
// 17.2 NORMALIZACION DE PREGUNTAS
// ==========================================

function normalizarPreguntaChat(texto) {

    return normalizarTexto(texto)
        .replace(/\s+/g, " ")
        .trim();
}


// ==========================================
// 17.3 BUSCAR INGREDIENTES EN EL CATALOGO
// ==========================================

function buscarIngredienteChat(pregunta) {

    const texto = normalizarPreguntaChat(pregunta);

    const catalogoOrdenado = [...catalogoChat].sort((a, b) => {

        const mayorA = Math.max(
            ...a.alias.map(x => normalizarTexto(x).length)
        );

        const mayorB = Math.max(
            ...b.alias.map(x => normalizarTexto(x).length)
        );

        return mayorB - mayorA;
    });


    for (const dato of catalogoOrdenado) {

        for (const alias of dato.alias) {

            const termino = normalizarTexto(alias);

            let coincide;

            if (termino.length <= 3) {

                const expresion = new RegExp(
                    "(^| )" + termino + "( |$)"
                );

                coincide = expresion.test(texto);

            } else {

                coincide = texto.includes(termino);
            }


            if (coincide) {

                return {
                    ...dato,
                    aliasEncontrado: termino
                };
            }
        }
    }

    return null;
}


// ==========================================
// 17.4 BUSCAR EN LAS LISTAS ORIGINALES
// ==========================================

function buscarClasificacionBaseChat(pregunta) {

    const texto = normalizarPreguntaChat(pregunta);

    const grupos = [

        {
            lista: peligrosos,
            clasificacion: "PELIGROSO"
        },

        {
            lista: irritantes,
            clasificacion: "IRRITANTE"
        },

        {
            lista: seguros,
            clasificacion: "SEGURO"
        }

    ];


    const ordenados = grupos.flatMap(grupo =>

        grupo.lista.map(termino => ({
            termino,
            clasificacion: grupo.clasificacion
        }))

    ).sort((a, b) => b.termino.length - a.termino.length);


    for (const dato of ordenados) {

        let coincide;

        if (dato.termino.length <= 3) {

            const expresion = new RegExp(
                "(^| )" + dato.termino + "( |$)"
            );

            coincide = expresion.test(texto);

        } else {

            coincide = texto.includes(dato.termino);
        }


        if (coincide) {

            return {
                ingrediente: dato.termino,
                clasificacion: dato.clasificacion
            };
        }
    }

    return null;
}


// ==========================================
// 17.5 IDENTIFICACION DE INTENCIONES
// ==========================================

function identificarIntencionChat(pregunta) {

    const texto = normalizarPreguntaChat(pregunta);


    // SALUDOS

    if (
        /(^| )(hola|buenas|buenos dias|buenas tardes|buenas noches|hey)( |$)/.test(texto)
    ) {
        return "SALUDO";
    }


    // BENEFICIOS

    if (
        /para que sirve|funcion|beneficio|que hace|que es/.test(texto)
    ) {
        return "BENEFICIO";
    }


    // RIESGOS

    if (
        /riesgo|peligroso|irritante|seguro|clasificacion|efecto|reaccion|danino/.test(texto)
    ) {
        return "RIESGO";
    }


    // ACNE

    if (
        /acne|granitos|espinillas|barros/.test(texto)
    ) {
        return "ACNE";
    }


    // HIDRATACION

    if (
        /hidratar|hidratacion|piel seca|resequedad/.test(texto)
    ) {
        return "HIDRATACION";
    }


    // PIEL SENSIBLE

    if (
        /piel sensible|sensibilidad|piel delicada/.test(texto)
    ) {
        return "PIEL_SENSIBLE";
    }


    // PUBLICIDAD

    if (
        /natural|vegano|vegana|libre de quimicos|sin quimicos|organico|ecologico/.test(texto)
    ) {
        return "PUBLICIDAD";
    }


    // AYUDA

    if (
        /ayuda|que puedes hacer|que sabes|opciones/.test(texto)
    ) {
        return "AYUDA";
    }


    return "GENERAL";
}


// ==========================================
// 17.6 GENERAR RESPUESTAS
// ==========================================

function generarRespuestaChat(pregunta) {

    const texto = normalizarPreguntaChat(pregunta);

    const intencion = identificarIntencionChat(pregunta);

    const ingrediente = buscarIngredienteChat(pregunta);


    // SALUDO

    if (intencion === "SALUDO") {

        return "¡Hola! 🌸 Soy Beauty Assistant.\n\n" +

            "Puedo ayudarte a conocer ingredientes cosméticos, " +
            "sus funciones, clasificación y posibles efectos.\n\n" +

            "¿Qué ingrediente o tema te gustaría consultar?";
    }


    // CONSULTA DE INGREDIENTES CON DESCRIPCION

    if (ingrediente) {

        const clasificacion = obtenerClasificacion(
            ingrediente.aliasEncontrado
        );

        let respuesta =
            "🧴 Ingrediente: " + ingrediente.nombre + "\n\n" +

            "📌 Función:\n" +
            ingrediente.funcion + "\n\n" +

            "🔎 Clasificación en CleanBeauty Scan: " +
            clasificacion + "\n\n" +

            "⚠ Posibles efectos:\n" +
            ingrediente.efecto;


        if (intencion === "BENEFICIO") {

            respuesta =
                "🌷 " + ingrediente.nombre + "\n\n" +

                ingrediente.funcion + "\n\n" +

                "Su clasificación en CleanBeauty Scan es: " +
                clasificacion + ".";
        }


        respuesta +=

            "\n\nRecuerda que esta clasificación corresponde " +
            "a la base de datos del proyecto y no representa " +
            "una evaluación médica ni garantiza la seguridad " +
            "de una fórmula completa.";

        return respuesta;
    }


    // CONSULTA DE INGREDIENTES SIN DESCRIPCION

    const coincidenciaBase = buscarClasificacionBaseChat(pregunta);

    if (coincidenciaBase) {

        return "🧴 Ingrediente identificado: " +

            coincidenciaBase.ingrediente + "\n\n" +

            "Clasificación: " +
            coincidenciaBase.clasificacion + "\n\n" +

            "Este ingrediente está registrado en la base " +
            "de datos de CleanBeauty Scan.\n\n" +

            "Todavía no contamos con una descripción " +
            "individual de su función y posibles efectos.\n\n" +

            "Puedes consultar su clasificación en el " +
            "analizador principal.";
    }


    // ACNE

    if (intencion === "ACNE") {

        return "🌸 Cuidado de la piel con acné\n\n" +

            "La base actual de CleanBeauty Scan no contiene " +
            "activos específicos para tratar el acné.\n\n" +

            "Puedes utilizar el chatbot para identificar " +
            "ingredientes registrados como irritantes y revisar " +
            "la información de cada componente.\n\n" +

            "No todos los ingredientes producen la misma " +
            "reacción en todas las personas. Para elegir " +
            "un tratamiento, consulta a un profesional de salud.";
    }


    // HIDRATACION

    if (intencion === "HIDRATACION") {

        return "💧 Ingredientes relacionados con la hidratación\n\n" +

            "En la base de datos de CleanBeauty Scan puedes " +
            "consultar los siguientes ingredientes:\n\n" +

            "• Glicerina: ayuda a atraer y retener agua.\n" +

            "• Aloe vera: se utiliza como acondicionador de la piel.\n" +

            "• Manteca de karité: funciona como emoliente.\n" +

            "• Aceite de jojoba: se utiliza para suavizar la piel.\n\n" +

            "Puedes preguntarme por cualquiera de ellos " +
            "para conocer su función y clasificación.";
    }


    // PIEL SENSIBLE

    if (intencion === "PIEL_SENSIBLE") {

        return "🌷 Piel sensible\n\n" +

            "Si tienes piel sensible, es importante revisar " +
            "los ingredientes de cada producto.\n\n" +

            "CleanBeauty Scan puede identificar componentes " +
            "registrados como irritantes, como Alcohol Denat, " +
            "propilenglicol y SLS.\n\n" +

            "La clasificación no significa que necesariamente " +
            "producirán una reacción. La tolerancia depende " +
            "de cada persona y de la formulación.";
    }


    // PUBLICIDAD

    if (intencion === "PUBLICIDAD") {

        if (
            texto.includes("libre de quimicos") ||
            texto.includes("sin quimicos")
        ) {

            return "🔎 Sobre la afirmación 'libre de químicos'\n\n" +

                "Todos los ingredientes están formados por " +
                "sustancias químicas, incluso el agua y los " +
                "ingredientes de origen natural.\n\n" +

                "Por eso, esta frase no significa que un " +
                "producto sea automáticamente más seguro.\n\n" +

                "Puedes compartir su lista de ingredientes " +
                "para revisar los componentes registrados.";
        }


        return "🔎 Verificación de afirmaciones publicitarias\n\n" +

            "Que un cosmético indique ser natural, vegano " +
            "u orgánico no demuestra por sí solo que " +
            "cumpla con esa característica.\n\n" +

            "Para verificarlo se necesita información " +
            "sobre el origen de los ingredientes y, cuando " +
            "corresponda, documentación o certificaciones.\n\n" +

            "Puedes compartir la lista de ingredientes " +
            "para revisar cuáles están registrados en CleanBeauty Scan.";
    }


    // AYUDA

    if (intencion === "AYUDA") {

        return "🌸 Puedo ayudarte con estas consultas:\n\n" +

            "1. Conocer la función de un ingrediente.\n" +

            "2. Consultar su clasificación.\n" +

            "3. Identificar posibles efectos.\n" +

            "4. Consultar ingredientes relacionados con hidratación.\n" +

            "5. Consultar información sobre acné y piel sensible.\n" +

            "6. Comprender afirmaciones publicitarias.\n\n" +

            "Ejemplo: ¿Qué es el propilenglicol?";
    }


    // RESPUESTA GENERAL

    return "🌷 No logré identificar la intención de tu pregunta.\n\n" +

        "Intenta escribir el nombre de un ingrediente " +
        "o realizar una pregunta como:\n\n" +

        "• ¿Para qué sirve la glicerina?\n" +

        "• ¿Qué riesgo tiene el formaldehído?\n" +

        "• ¿Qué ingredientes ayudan a hidratar?\n" +

        "• ¿Qué debo revisar si tengo piel sensible?\n\n" +

        "También puedes escribir 'ayuda' para conocer " +
        "las consultas disponibles.";
}


// ==========================================
// 17.7 MOSTRAR MENSAJES
// ==========================================

function agregarMensajeChat(texto, tipo) {

    const contenedor = document.getElementById("mensajesChat");

    if (!contenedor) return;

    const mensaje = document.createElement("div");

    mensaje.className =
        tipo === "usuario"
            ? "mensaje-usuario"
            : "mensaje-bot";

    mensaje.textContent = texto;

    contenedor.appendChild(mensaje);

    contenedor.scrollTop = contenedor.scrollHeight;
}


// ==========================================
// 17.8 ENVIAR PREGUNTAS
// ==========================================

function enviarPreguntaChat(pregunta) {

    const texto = pregunta.trim();

    if (!texto) return;

    agregarMensajeChat(texto, "usuario");

    const respuesta = generarRespuestaChat(texto);

    agregarMensajeChat(respuesta, "bot");
}


// ==========================================
// 17.9 PREGUNTAS RAPIDAS
// ==========================================

function preguntaRapida(pregunta) {

    enviarPreguntaChat(pregunta);
}


// ==========================================
// 17.10 ABRIR Y CERRAR CHAT
// ==========================================

function alternarChat() {

    const ventana = document.getElementById("ventanaChat");

    const boton = document.getElementById("botonChat");

    if (!ventana) return;

    const abierto = ventana.style.display === "flex";

    ventana.style.display = abierto ? "none" : "flex";

    if (boton) {

        boton.textContent = abierto ? "💬" : "✕";
    }
}


// ==========================================
// 17.11 FORMULARIO DEL CHAT
// ==========================================

document.addEventListener("DOMContentLoaded", function() {

    const formularioChat =
        document.getElementById("formularioChat");

    if (!formularioChat) return;


    formularioChat.addEventListener("submit", function(event) {

        event.preventDefault();

        const campo =
            document.getElementById("preguntaChat");

        const pregunta = campo.value.trim();

        if (!pregunta) return;

        enviarPreguntaChat(pregunta);

        campo.value = "";

        campo.focus();

    });

});


document.addEventListener("DOMContentLoaded", function () {

    // Evitar duplicados
    if (document.getElementById("chatbot-boton")) return;

    // Crear estilos
    const estiloChat = document.createElement("style");

    estiloChat.textContent = `
        #chatbot-boton {
            position: fixed;
            bottom: 25px;
            right: 25px;
            width: 65px;
            height: 65px;
            border-radius: 50%;
            border: none;
            background: #e91e63;
            color: white;
            font-size: 28px;
            cursor: pointer;
            z-index: 999999;
        }

        #chatbot-ventana {
            display: none;
            position: fixed;
            bottom: 105px;
            right: 25px;
            width: 320px;
            height: 400px;
            background: white;
            border-radius: 15px;
            box-shadow: 0 4px 15px #999;
            z-index: 999999;
            overflow: hidden;
            font-family: Poppins, sans-serif;
        }

        #chatbot-cabecera {
            background: #e91e63;
            color: white;
            padding: 15px;
            display: flex;
            justify-content: space-between;
        }

        #chatbot-mensajes {
            height: 285px;
            overflow-y: auto;
            padding: 10px;
            background: #fff5f8;
        }

        #chatbot-formulario {
            display: flex;
            padding: 8px;
            gap: 5px;
        }

        #chatbot-entrada {
            width: 75%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 15px;
        }

        #chatbot-formulario button {
            background: #e91e63;
            color: white;
            border: none;
            border-radius: 15px;
            padding: 8px;
            cursor: pointer;
        }

        .mensaje-chat {
            padding: 9px;
            margin: 7px 0;
            border-radius: 10px;
            font-size: 13px;
        }

        .mensaje-bot {
            background: #f8dce8;
        }

        .mensaje-usuario {
            background: #e91e63;
            color: white;
            text-align: right;
        }
    `;

    document.head.appendChild(estiloChat);

    // Crear botón
    const boton = document.createElement("button");
    boton.id = "chatbot-boton";
    boton.textContent = "💬";

    // Crear ventana
    const ventana = document.createElement("div");
    ventana.id = "chatbot-ventana";

    ventana.innerHTML = `
        <div id="chatbot-cabecera">
            <strong>🌸 CleanBeauty Scan</strong>
            <button id="chatbot-cerrar" type="button">✖</button>
        </div>

        <div id="chatbot-mensajes">
            <div class="mensaje-chat mensaje-bot">
                ¡Hola! Soy el asistente de CleanBeauty Scan.
                Puedes preguntarme sobre ingredientes cosméticos.
            </div>
        </div>

        <form id="chatbot-formulario">
            <input
                type="text"
                id="chatbot-entrada"
                placeholder="Escribe tu pregunta..."
                required
            >
            <button type="submit">Enviar</button>
        </form>
    `;

    document.body.appendChild(boton);
    document.body.appendChild(ventana);

    // Abrir y cerrar
    boton.addEventListener("click", function () {
        ventana.style.display =
            ventana.style.display === "block" ? "none" : "block";
    });

    document.getElementById("chatbot-cerrar").addEventListener("click", function () {
        ventana.style.display = "none";
    });

    // Enviar mensajes
    const formulario = document.getElementById("chatbot-formulario");
    const entrada = document.getElementById("chatbot-entrada");
    const mensajes = document.getElementById("chatbot-mensajes");

    formulario.addEventListener("submit", function (e) {
        e.preventDefault();

        const texto = entrada.value.trim();

        if (texto === "") return;

        const mensajeUsuario = document.createElement("div");
        mensajeUsuario.className = "mensaje-chat mensaje-usuario";
        mensajeUsuario.textContent = texto;

        mensajes.appendChild(mensajeUsuario);

        const respuesta = document.createElement("div");
        respuesta.className = "mensaje-chat mensaje-bot";

        respuesta.textContent =
            "Gracias por tu pregunta. Escribe el nombre de un ingrediente registrado para consultar su información.";

        mensajes.appendChild(respuesta);

        entrada.value = "";
        mensajes.scrollTop = mensajes.scrollHeight;
    });

    console.log("Chatbot CleanBeauty Scan inicializado correctamente.");

});
