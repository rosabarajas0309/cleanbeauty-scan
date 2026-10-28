// ==========================================
// CLEANBEAUTY SCAN
// Analisis lexico, sintactico y semantico
// Tokens, arbol de expresiones y errores
// ==========================================


// ==========================================
// 1. VARIABLES GLOBALES
// ==========================================

let ultimoTextoAnalizado = "";
let ultimoDetalleIngredientes = [];
let ultimoErrorAnalisis = "";
let hayAnalisisDisponible = false;


// ==========================================
// 2. NORMALIZACION DE TEXTO
// ==========================================

function normalizarTexto(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9, ]/g, "");
}


// Evita interpretar texto ingresado como HTML.
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
// 3. LISTAS DE INGREDIENTES
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
    if (peligrosos.some(p => ingrediente.includes(p))) {
        return "PELIGROSO";
    }

    if (irritantes.some(i => ingrediente.includes(i))) {
        return "IRRITANTE";
    }

    if (seguros.some(s => ingrediente.includes(s))) {
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

    // Mostrar las opciones incluso si hay errores.
    document.getElementById("opcionesAnalisis").style.display = "block";

    // ERROR: ENTRADA VACIA
    if (!textoOriginal.trim()) {
        ultimoErrorAnalisis =
            "Error de entrada: no se escribieron ingredientes.";

        alerta.textContent =
            "⚠ Ingresa al menos un ingrediente.";

        alerta.style.color = "red";
        mostrarAvisoError(detalle);

        return;
    }

    // ERROR SINTACTICO: COMAS MAL COLOCADAS
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

    // NORMALIZAR Y SEPARAR
    const texto = normalizarTexto(textoOriginal);

    const lista = texto
        .split(",")
        .map(ingrediente => ingrediente.trim())
        .filter(ingrediente => ingrediente.length > 0);

    // Si no hay ingredientes validos, conservar los errores.
    if (lista.length === 0) {
        if (!ultimoErrorAnalisis) {
            ultimoErrorAnalisis =
                "Error: no se encontraron ingredientes válidos.";
        }

        alerta.textContent = "⚠ No hay ingredientes válidos para analizar.";
        alerta.style.color = "red";

        mostrarAvisoError(detalle);
        return;
    }

    // ANALISIS Y CLASIFICACION
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

    // INGREDIENTES DESCONOCIDOS
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

    // MOSTRAR RESULTADOS
    document.getElementById("modal").style.display = "block";
}


// ==========================================
// 6. MOSTRAR ERRORES EN LOS RESULTADOS
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
// 7. ABRIR LAS CINCO VISUALIZACIONES
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
                <div class="nodo-arbol">Lista de ingredientes</div>
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

    if (empiezaConComa || terminaEnComa || comasConsecutivas || entradaVacia) {
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
            <p>${ultimoErrorAnalisis
                ? "El resultado debe revisarse porque la entrada contiene errores."
                : "La clasificación se obtuvo mediante las listas programadas."}
            </p>
            <p>Las categorías de esta aplicación no constituyen
            una evaluación médica ni garantizan la seguridad
            de un producto para todas las personas.</p>
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
                            <th style="padding:8px;border:1px solid #ddd;">N.º</th>
                            <th style="padding:8px;border:1px solid #ddd;">Tipo</th>
                            <th style="padding:8px;border:1px solid #ddd;">Valor</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    let numero = 1;

    if (!ultimoTextoAnalizado.trim()) {
        html += `
            <tr>
                <td colspan="3" style="padding:8px;border:1px solid #ddd;color:red;">
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
                        <td style="padding:8px;border:1px solid #ddd;">,</td>
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
// 12. ARBOL DE EXPRESIONES VISUAL
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
            <div class="nodo-arbol">LISTA DE INGREDIENTES</div>
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
            <p>Las ramas conectan cada ingrediente con su clasificación.
            Esta es una representación del procesamiento de la lista,
            no un árbol sintáctico formal de una gramática completa.</p>
        </div>
    `;

    return html;
}


// ==========================================
// 13. REINICIAR
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
            <p>CleanBeauty Scan es un proyecto académico enfocado
            en analizar ingredientes de productos cosméticos y de
            cuidado personal.</p>

            <p>Busca facilitar la comprensión de nombres técnicos
            mediante la clasificación de ingredientes y la presentación
            de resultados claros.</p>

            <p>El proyecto aplica conceptos de análisis léxico,
            sintáctico y semántico.</p>
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
