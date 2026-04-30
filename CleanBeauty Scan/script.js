//Analisis Sintactico - Reglas
function normalizarTexto(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9, ]/g, "");
}

//Alnalisis Lexico - Tokens
let peligrosos = [
    "parabenos","methylparaben","propylparaben","butylparaben",
    "ftalatos","phthalates","dep","dbp","dehp",
    "mercurio","mercury","mercurous chloride","thimerosal",
    "formaldehido","formaldehyde","formalin",
    "triclosan","tolueno","toluene",
    "bha","butylated hydroxyanisole",
    "bht","butylated hydroxytoluene",
    "esteres de glicol","glycol ethers",
    "p fenilendiamina","ppd","p phenylenediamine",
    "metilisotiazolinona","methylisothiazolinone","mit",
    "dea","mea","tea",
    "diethanolamine","monoethanolamine","triethanolamine",
    "nitrosaminas","nitrosamines",
    "dmdm hydantoin","imidazolidinyl urea",
    "alquitran","coal tar"
].map(normalizarTexto);

let irritantes = [
    "alcohol denat","propilenglicol","propylene glycol",
    "dioxido de titanio","titanium dioxide","tio2",
    "sodium lauryl sulfate","laurilsulfato de sodio","sls",
    "sal de aluminio",
    "pvp va copolimero","pvp va copolymer",
    "peg","ppg","polyethylene glycol","polypropylene glycol",
    "fluoruro","fluoride",
    "aluminium chlorohydrate","clorhidrato de aluminio",
    "disodium edta","trisodium edta","edta"
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

//Reglas
function analizar() {

    let textoOriginal = document.getElementById("ingredientes").value;
    let alerta = document.getElementById("alerta");
    let detalle = document.getElementById("detalle");

    alerta.innerHTML = "";
    detalle.innerHTML = "";

    // 🔴 VALIDACIÓN SINTÁCTICA PRIMERO
    if (textoOriginal.includes(",,")) {
        alerta.innerHTML = "⚠ Error: Hay comas consecutivas";
        alerta.style.color = "orange";
        document.getElementById("modal").style.display = "none";
        return;
    }

    // 🔵 NORMALIZACIÓN
    let texto = normalizarTexto(textoOriginal);
    let lista = texto.split(",");

    let hayPeligroso = false;
    let hayIrritante = false;
    let haySeguro = false;
    let hayDesconocido = false;
    let noEncontrados = [];

    lista.forEach(ing => {
        let ingrediente = ing.trim();
        if (!ingrediente) return;

        let li = document.createElement("li");

        if (peligrosos.some(p => ingrediente.includes(p))) {
            li.textContent = ingrediente + " → PELIGROSO";
            li.style.color = "red";
            hayPeligroso = true;
        }
        else if (irritantes.some(i => ingrediente.includes(i))) {
            li.textContent = ingrediente + " → IRRITANTE";
            li.style.color = "orange";
            hayIrritante = true;
        }
        else if (seguros.some(s => ingrediente.includes(s))) {
            li.textContent = ingrediente + " → SEGURO";
            li.style.color = "green";
            haySeguro = true;
        }
        else {
            noEncontrados.push(ingrediente);
            hayDesconocido = true;
        }

        detalle.appendChild(li);
    });

    // 🧠 ANÁLISIS SEMÁNTICO CORREGIDO
    if (hayPeligroso) {
        alerta.innerHTML = "🔴 Peligro: Contiene ingredientes peligrosos";
        alerta.style.color = "red";

    } else if (hayIrritante) {
        alerta.innerHTML = "🟠 Irritante: Puede causar irritación";
        alerta.style.color = "orange";

    } else if (hayDesconocido && !haySeguro) {
        alerta.innerHTML = "⚠ No se encontraron los ingredientes en la base de datos";
        alerta.style.color = "gray";

    } else if (haySeguro && !hayDesconocido) {
        alerta.innerHTML = "🟢 Seguro: Producto apto para uso general";
        alerta.style.color = "green";

    } else {
        alerta.innerHTML = "⚠ Contiene ingredientes no identificados";
        alerta.style.color = "gray";
    }

    alerta.style.fontWeight = "bold";
    alerta.style.fontSize = "18px";

    // 🔍 MOSTRAR NO ENCONTRADOS
    if (noEncontrados.length > 0) {
        let aviso = document.createElement("p");
        aviso.innerHTML = `
        ⚠ <strong>Nota:</strong> Algunos ingredientes no se encuentran en la base de datos:
        <br>${noEncontrados.join(", ")}
        `;
        aviso.style.color = "gray";

        detalle.appendChild(aviso);
    }

    // 🔓 ABRIR MODAL SOLO SI TODO OK
    document.getElementById("modal").style.display = "block";
}
/*
function analizar() {
    let texto = document.getElementById("ingredientes").value;
    texto = normalizarTexto(texto);

    let lista = texto.split(",");

    let alerta = document.getElementById("alerta");
    let detalle = document.getElementById("detalle");

    alerta.innerHTML = "";
    detalle.innerHTML = "";

    let hayPeligroso = false;
    let hayIrritante = false;
    let noEncontrados = []; 

    lista.forEach(ing => {
        let ingrediente = ing.trim();
        if (!ingrediente) return;

        let li = document.createElement("li");

        if (peligrosos.some(p => ingrediente.includes(p))) {
            li.textContent = ingrediente + " → PELIGROSO";
            li.style.color = "red";
            hayPeligroso = true;
        }
        else if (irritantes.some(i => ingrediente.includes(i))) {
            li.textContent = ingrediente + " → IRRITANTE";
            li.style.color = "orange";
            hayIrritante = true;
        }
        else if (seguros.some(s => ingrediente.includes(s))) {
            li.textContent = ingrediente + " → SEGURO";
            li.style.color = "green";
        }
        else {
            noEncontrados.push(ingrediente); 
        }

        detalle.appendChild(li);
    });

    //Analisis Semantico - Clasificaciones
    if (hayPeligroso) {
        alerta.innerHTML = "🔴 Peligro: Contiene ingredientes peligrosos";
        alerta.style.color = "red";

    } else if (hayIrritante) {
        alerta.innerHTML = "🟠 Irritante: Puede causar irritación";
        alerta.style.color = "orange";

    } else {
        alerta.innerHTML = "🟢 Seguro: Producto apto para uso general";
        alerta.style.color = "green";
    }

    alerta.style.fontWeight = "bold";
    alerta.style.fontSize = "18px";

    //MENSAJE DE INGREDIENTES NO ENCONTRADOS
    if (noEncontrados.length > 0) {
        let aviso = document.createElement("p");
        aviso.innerHTML = `
        ⚠ <strong>Nota:</strong> Algunos ingredientes no se encuentran en la base de datos:
        <br>${noEncontrados.join(", ")}
        `;
        aviso.style.color = "gray";

        detalle.appendChild(aviso);
    }

    let textoOriginal = document.getElementById("ingredientes").value;


    //ABRIR MODAL
    document.getElementById("modal").style.display = "block";

    if (textoOriginal.includes(",,")) {
    alerta.innerHTML = "⚠ Error: Hay comas consecutivas";
    alerta.style.color = "orange";
    return;

    document.getElementById("modal").style.display = "none"; 
    return;
}
}
*/
function abrirInfo(tipo) {
    let titulo = document.getElementById("tituloModal");
    let contenido = document.getElementById("contenidoModal");

    if (tipo === "nosotros") {
        titulo.innerText = "Quiénes somos";
        contenido.innerHTML = `
        <p>CleanBeauty Scan es un proyecto enfocado en el desarrollo de una herramienta tecnológica orientada al análisis de ingredientes en productos cosméticos y de cuidado personal. Surge como una iniciativa académica con el propósito de aplicar conceptos de compiladores —como análisis léxico, sintáctico y semántico— en un contexto real y útil para los usuarios.

        Nuestro objetivo es brindar a las personas una forma sencilla y accesible de comprender la composición de los productos que utilizan diariamente, permitiéndoles identificar ingredientes potencialmente peligrosos o irritantes para la piel. A través de un sistema automatizado, el usuario puede ingresar una lista de componentes y recibir una clasificación clara junto con recomendaciones básicas.

        El proyecto combina conocimientos de programación, desarrollo web e interfaces de usuario, dando como resultado una aplicación interactiva que prioriza la usabilidad y la claridad de la información. Además, busca fomentar la conciencia sobre el cuidado de la piel y el consumo informado de productos cosméticos.

        CleanBeauty Scan está dirigido a estudiantes, usuarios interesados en el cuidado personal y cualquier persona que desee conocer más sobre los ingredientes presentes en sus productos. Como proyecto en desarrollo, continúa evolucionando con la incorporación de nuevas funcionalidades, mejoras en la base de datos de ingredientes y optimización de la experiencia del usuario.</p>
        `;
    }

    if (tipo === "ingredientes") {
        titulo.innerText = "Ingredientes Clasificados";
        contenido.innerHTML = `
        <ul>
            <li style="color:red;">Parabenos - Peligroso</li>
            <li style="color:orange;">Alcohol Denat - Irritante</li>
            <li style="color:green;">Agua - Seguro</li>
        </ul>
        `;
    }

    if (tipo === "contacto") {
        titulo.innerText = "Contacto";
        contenido.innerHTML = `
        <p>Email: rosabarajas0309@gmail.com</p>
        `;
    }

    if (tipo === "soporteInfo") {
        titulo.innerText = "Soporte";
        contenido.innerHTML = `
        <p>Presiona el botón ❔ para reportar problemas directamente.</p>
        `;
    }

    document.getElementById("modalInfo").style.display = "block";
}

function cerrarInfo() {
    document.getElementById("modalInfo").style.display = "none";
}

//REINICIAR
function reiniciar() {
    document.getElementById("ingredientes").value = "";
    document.getElementById("resultado").innerHTML = "";
    document.getElementById("alerta").innerHTML = "";
}

function cerrarModal() {
    document.getElementById("modal").style.display = "none";
}

/*function enviarSoporte() {
    let asunto = "Soporte CleanBeauty Scan";
    let mensaje = "Hola, encontré un problema en el sistema:\n\nDescribe aquí el error...";

    window.location.href = `mailto:rosabarajas0309@gmail.com?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(mensaje)}`;
}*/

//Boton de ayuda - Correo para admin
function abrirSoporte() {
    document.getElementById("modalSoporte").style.display = "block";
}

function cerrarSoporte() {
    document.getElementById("modalSoporte").style.display = "none";
}

function enviarCorreo() {
    let nombre = document.getElementById("nombre").value;
    let mensaje = document.getElementById("mensaje").value;

    let params = {
        from_name: nombre,
        message: mensaje
    };

    emailjs.send("service_4vmoemm", "template_wqi4zyd", params)
    .then(function(response) {
        alert("Mensaje enviado correctamente");
        cerrarSoporte();
    }, function(error) {
        alert("Error al enviar");
    });
}

let imagenes = ["banner1.png", "banner2.png", "banner3.png", "banner4.png"];
let index = 0;

function cambiarBanner() {
    index = (index + 1) % imagenes.length;
    document.getElementById("bannerImg").src = imagenes[index];
}

setInterval(cambiarBanner, 3000); // cambia cada 3 segundos
