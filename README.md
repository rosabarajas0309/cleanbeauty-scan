<!DOCTYPE html>
<html lang="es">
    <div id="modalInfo" class="modal">
    <div class="modal-content">
        <span class="cerrar" onclick="cerrarInfo()">&times;</span>
        <h2 id="tituloModal"></h2>
        <div id="contenidoModal"></div>
    </div>
</div>
<head>
    <meta charset="UTF-8">
    <title>CleanBeauty Scan</title>

    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="style.css">
</head>
<body>
    <script src="https://cdn.jsdelivr.net/npm/emailjs-com@3/dist/email.min.js"></script>
    <script>
    (function(){
    emailjs.init("ahcS1uoYh5UJPQsg_"); 
    })();
    </script>
    <!-- BOTÓN DE AYUDA -->
    <div class="ayuda" onclick="abrirSoporte()">❔</div>

    <!-- MODAL DE SOPORTE -->
    <div id="modalSoporte" class="modal">
    <div class="modal-content">
        <span class="cerrar" onclick="cerrarSoporte()">&times;</span>
        <h2>Soporte</h2>

        <input type="text" id="nombre" placeholder="Tu nombre"><br><br>
        <textarea id="mensaje" placeholder="Describe el problema..."></textarea><br><br>

        <button onclick="enviarCorreo()">Enviar</button>
    </div>
    </div>
    <!-- Menu interactivo -->
    <nav class="navbar">
    <ul>
        <li onclick="abrirInfo('nosotros')">Quiénes somos</li>
        <li><a href="ingredientes.html">Ingredientes</a></li>
        <li onclick="abrirInfo('contacto')">Contacto</li>
        <li onclick="abrirInfo('soporteInfo')">Soporte</li>
    </ul>
    </nav>
    <!-- Banner de fotos -->
    <div class="banner">
    <img id="bannerImg" src="banner1.png">
    </div>
    <div id="inicio" class="seccion">
    </div>

    <!-- Logo -->
    <img src="logo.png" alt="CleanBeauty Scan Logo" class="logo">
    <h1>🌸 CleanBeauty Scan 🌸</h1>

    <textarea id="ingredientes" placeholder="Ej: Parabenos, Alcohol Denat, Glycerin"></textarea>

    <br><br>

    <button onclick="analizar()">Analizar</button>
    <button onclick="reiniciar()">Reiniciar</button>

    <h2>Resultado:</h2>
    <ul id="resultado"></ul>

    <!--MODAL DE RESULTADOS -->
<div id="modal" class="modal">
    <div class="modal-content">
        <span class="cerrar" onclick="cerrarModal()">&times;</span>
        <h2>Resultados del análisis</h2>
        <ul id="detalle"></ul>
    </div>
</div>

    <h3 id="alerta"></h3>

    <script src="script.js"></script>
<footer class="footer">
    <p>© 2026 CleanBeauty Scan - Desarrollado por Rosa Isela Barajas Mercado. Todos los derechos reservados.</p>
</footer>
</body>
</html>

<!--
<img width="1774" height="887" alt="image" src="https://github.com/user-attachments/assets/31f38dd9-54db-47e9-80ce-d09d45d79ea9" />


# 🌸 CleanBeauty Scan

<p align="center">
  <img width="400" height="400" alt="image" src="https://github.com/user-attachments/assets/5cb9588c-c17b-486b-b052-a8ebba22452d" />
</p>

**CleanBeauty Scan** es una aplicación web diseñada para analizar ingredientes en productos cosméticos y de cuidado personal de forma rápida y sencilla.

El sistema permite al usuario ingresar una lista de ingredientes y, mediante técnicas inspiradas en el análisis de compiladores (léxico, sintáctico y semántico), identifica y clasifica cada componente como:

- 🔴 **Peligroso**
- 🟠 **Irritante**
- 🟢 **Seguro**

Además, la herramienta detecta errores en la entrada, reconoce diferentes formas de escritura (mayúsculas, acentos, inglés/español) y muestra los resultados en una interfaz amigable mediante alertas y ventanas emergentes.

Incluye también:
- 📚 Información sobre ingredientes
- 🎞️ Banner visual interactivo
- 💬 Sistema de soporte para enviar reportes al administrador

---

## 🚀 Objetivo

Brindar a los usuarios una forma fácil y accesible de comprender la composición de los productos que utilizan diariamente, ayudándolos a tomar decisiones más informadas sobre su cuidado personal.

---

## 🛠️ Tecnologías utilizadas

- HTML
- CSS
- JavaScript
- EmailJS

---

## 💡 Nota

Este proyecto aplica conceptos de compiladores en un contexto real, demostrando cómo la tecnología puede utilizarse para mejorar el bienestar y la conciencia del consumidor.

---

✨ *Desarrollado con enfoque en la salud, la tecnología y la simplicidad.*

-->

