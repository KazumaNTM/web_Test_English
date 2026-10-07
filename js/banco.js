/*============================================================
   BANCO DE PREGUNTAS — HTML (BLOQUE 1)
   Contrato: meta (id, titulo, subtitulo, descripcion, nota,
             paginasPDF, totalPreguntas) ·
             secciones {LETRA:{nombre,color}} ·
             preguntas [{s,q,o[],c,e,ref,d}]  ·  c = índice correcto
   Fuente: HTMLCSSJSCombined.pdf (Nematrian, 2020)
   ============================================================ */
const BANCO_HTML = {
meta: {
  id: "html-fundamentos-v1",
  titulo: "Test de HTML",
  subtitulo: "fundamentos, elementos y atributos",
  descripcion: "Preguntas de opción múltiple basadas estrictamente en el PDF HTMLCSSJSCombined.pdf (Nematrian, 2020). Cubre fundamentos, estructura del documento, elementos de contenido, tablas, formularios, multimedia, XHTML y recursos externos. Sin conceptos repetidos entre preguntas.",
  nota: "Nota de rigor: el PDF clasifica <center> como no soportado en HTML 5 (en su lugar usar CSS) y describe <br> como elemento vacío que en XHTML debe cerrarse como <br />. Se respeta literalmente la terminología del documento original.",
  paginasPDF: "pp. 1–11, 30–100, 101–162",
  totalPreguntas: 40
},
secciones: {
  A: { nombre: "Fundamentos y estructura del documento", color: "#f5a524" },
  B: { nombre: "Elementos de contenido y texto",         color: "#10b981" },
  C: { nombre: "Tablas, formularios y controles",        color: "#38bdf8" },
  D: { nombre: "Multimedia, HTML5, XHTML y recursos",     color: "#f472b6" }
},
preguntas: [
  /* ============================================================
     SECCIÓN A — Fundamentos y estructura del documento (12)
     ============================================================ */
  { s:"A", q:"¿Qué significa la sigla HTML?", 
    o:["Hypertext Markup Language","High Technical Modern Language","Hyperlink Text Management Language","Home Tool Markup Language"], 
    c:0, 
    e:"El texto indica que HTML son las siglas de 'Hypertext Markup Language' (Lenguaje de Marcado de Hipertexto). Es uno de los tres componentes principales de las páginas web modernas, junto con CSS y JavaScript.", 
    ref:"p. 3", d:1 },

  { s:"A", q:"¿Cuál es la función principal de HTML en una página web?", 
    o:["Definir el estilo visual de los elementos","Indicar al navegador qué elementos deben incluirse y en qué orden","Proporcionar interactividad y respuesta a eventos del usuario","Gestionar la base de datos del servidor"], 
    c:1, 
    e:"El texto especifica que 'HTML indica al navegador qué elementos deben incluirse en la página web (y en qué orden)'. CSS se encarga del estilo y JavaScript de la manipulación programática.", 
    ref:"p. 3", d:1 },

  { s:"A", q:"¿Qué es un 'lenguaje de marcado' según el texto?", 
    o:["Un lenguaje de programación de alto nivel","Una forma de crear documentos digitales donde el documento contiene etiquetas que el software interpreta","Un sistema de bases de datos relacionales","Un protocolo de comunicación entre servidores"], 
    c:1, 
    e:"El texto define un lenguaje de marcado como 'una forma de crear e interpretar un documento digital en el que el documento contiene etiquetas (y sus atributos) que el software que renderiza el documento interpreta de una manera específica'.", 
    ref:"p. 277", d:2 },

  { s:"A", q:"¿Qué elemento HTML se utiliza para insertar un salto de línea (carriage return)?", 
    o:["<lb>","<br>","<cr>","<newline>"], 
    c:1, 
    e:"El texto menciona que 'si quieres insertar un retorno de carro necesitas insertar una etiqueta <br>'. También aclara que en XHTML debe cerrarse como <br />.", 
    ref:"p. 5", d:1 },

  { s:"A", q:"¿Qué elemento HTML se utiliza para insertar una línea de ruptura temática (horizontal rule)?", 
    o:["<line>","<hr>","<break>","<thematic>"], 
    c:1, 
    e:"El texto indica que 'una forma de dividir el texto es insertar una línea de ruptura temática o regla horizontal, es decir, una etiqueta <hr>, que coloca una línea a través de la ventana'.", 
    ref:"p. 5", d:1 },

  { s:"A", q:"¿Cuál es la forma correcta de escribir un comentario en HTML según el texto?", 
    o:["// comentario","/* comentario */","<!-- comentario -->","# comentario"], 
    c:2, 
    e:"El texto indica que 'los comentarios en HTML toman la forma <!-- comentario --> e ignoran los saltos de línea dentro de las etiquetas de apertura y cierre del elemento de comentario'.", 
    ref:"pp. 5–6", d:1 },

  { s:"A", q:"¿Cuál es el código HTML correcto para mostrar el símbolo '&' (ampersand) en una página web?", 
    o:["&amp;","&ampersand;","&and;","&am;"], 
    c:0, 
    e:"El texto incluye una tabla de caracteres especiales donde se muestra que el ampersand se representa como &amp;. Explica que 'cada carácter especial va precedido por un ampersand, seguido del nombre de marcado HTML para ese carácter y un punto y coma'.", 
    ref:"p. 6", d:2 },

  { s:"A", q:"¿Qué código HTML se utiliza para insertar un espacio que no se rompa (non-breaking space)?", 
    o:["&space;","&nbsp;","&nbs;","&nbreak;"], 
    c:1, 
    e:"El texto menciona en la tabla de caracteres especiales que &nbsp; representa un 'espacio (técnicamente un non-breaking space)' y se usa cuando se necesitan múltiples espacios.", 
    ref:"p. 6", d:2 },

  { s:"A", q:"¿Cuál es la estructura correcta de un hipervínculo en HTML?", 
    o:["<link href=\"url\">texto</link>","<a href=\"url\">texto</a>","<href url=\"texto\">","<anchor src=\"url\">texto</anchor>"], 
    c:1, 
    e:"El texto indica que 'los hipervínculos (también llamados anclas) típicamente tienen la siguiente estructura: <a href=\"Pages/AboutNematrian.pdf\">texto</a>'. El texto es lo que ve el usuario y el valor de href es a dónde apunta el enlace.", 
    ref:"pp. 6–7", d:1 },

  { s:"A", q:"¿Qué atributo del elemento <a> especifica dónde abrir el documento vinculado?", 
    o:["target","destination","window","open"], 
    c:0, 
    e:"El texto indica que 'el atributo target indica dónde abrir el documento vinculado'. Los valores posibles incluyen _blank (nueva ventana), _self (misma ventana), _parent y _top.", 
    ref:"p. 42", d:2 },

  { s:"A", q:"¿Qué elemento HTML se utiliza para agrupar hipervínculos de navegación?", 
    o:["<navigation>","<nav>","<menu>","<links>"], 
    c:1, 
    e:"El texto menciona que 'los grupos de hipervínculos pueden incluirse en un elemento <nav>'. Es nuevo en HTML 5 y se usa para enlaces de navegación.", 
    ref:"p. 7", d:2 },

  { s:"A", q:"¿Cuál de los siguientes elementos HTML NO está soportado en HTML 5 según el texto?", 
    o:["<article>","<center>","<section>","<header>"], 
    c:1, 
    e:"El texto lista <center> como 'no soportado en HTML 5 (en su lugar usar CSS)'. Mientras que <article>, <section> y <header> son elementos nuevos en HTML 5.", 
    ref:"p. 9", d:2 },

  /* ============================================================
     SECCIÓN B — Elementos de contenido y texto (10)
     ============================================================ */
  { s:"B", q:"Según el texto, ¿qué atributo se utiliza para especificar el idioma del contenido de un elemento HTML?", 
    o:["language","lang","idiom","locale"], 
    c:1, 
    e:"El texto indica que 'a menudo, el elemento <html> también incluye un atributo lang, ya que esto puede ser importante para aplicaciones de accesibilidad (como lectores de pantalla) y para motores de búsqueda'.", 
    ref:"p. 4", d:2 },

  { s:"B", q:"¿Qué elemento HTML se utiliza para definir una lista desordenada?", 
    o:["<ol>","<dl>","<ul>","<list>"], 
    c:2, 
    e:"El texto especifica que 'el elemento HTML <ul> indica una lista desordenada. Dentro del elemento <ul> debe haber uno o más elementos <li> identificando cada entrada en la lista'.", 
    ref:"p. 98", d:1 },

  { s:"B", q:"¿Qué elemento HTML se utiliza para definir una lista ordenada?", 
    o:["<ul>","<ol>","<dl>","<list>"], 
    c:1, 
    e:"El texto indica que 'el elemento HTML <ol> indica una lista ordenada. La lista puede ser numérica o alfabética. Los elementos individuales dentro de la lista se identifican usando elementos <li>'.", 
    ref:"p. 78", d:1 },

  { s:"B", q:"¿Qué elemento HTML se utiliza para definir una lista de descripción?", 
    o:["<ul>","<ol>","<dl>","<list>"], 
    c:2, 
    e:"El texto indica que 'el elemento HTML <dl> indica una lista de descripción. Se usa en conjunción con elementos <dd> y <dt>'. Un <dt> identifica un término y el <dd> asociado proporciona la descripción.", 
    ref:"p. 57", d:2 },

  { s:"B", q:"¿Qué elemento HTML se utiliza para definir un encabezado de nivel 1?", 
    o:["<h1>","<head1>","<header1>","<heading1>"], 
    c:0, 
    e:"El texto indica que 'el elemento HTML <h1> indica un encabezado HTML de nivel 1'. Los elementos <h1> a <h6> proporcionan una jerarquía de encabezados.", 
    ref:"p. 62", d:1 },

  { s:"B", q:"¿Qué elemento HTML se utiliza para definir un párrafo?", 
    o:["<par>","<p>","<paragraph>","<text>"], 
    c:1, 
    e:"El texto indica que 'el elemento HTML <p> indica un párrafo'. Los elementos <p> se utilizan típicamente para delimitar párrafos en HTML.", 
    ref:"p. 80", d:1 },

  { s:"B", q:"¿Qué elemento HTML se utiliza para definir el título de un documento?", 
    o:["<header>","<title>","<h1>","<heading>"], 
    c:1, 
    e:"El texto indica que 'el elemento HTML <title> indica el título para el documento. Aparece en la parte <head> del documento. Típicamente identifica el título de la página que aparece en una barra de herramientas del navegador'.", 
    ref:"p. 96", d:1 },

  { s:"B", q:"¿Qué elemento HTML se utiliza para definir un artículo (contenido autocontenido)?", 
    o:["<article>","<section>","<post>","<content>"], 
    c:0, 
    e:"El texto indica que 'el elemento HTML <article> indica una pieza de contenido autocontenido, como una publicación de blog o foro, una historia de noticias específica o algún comentario autocontenido sobre una pieza específica de texto. Es nuevo en HTML 5'.", 
    ref:"p. 44", d:2 },

  { s:"B", q:"¿Qué elemento HTML se utiliza para definir un pie de página?", 
    o:["<bottom>","<footer>","<end>","<foot>"], 
    c:1, 
    e:"El texto indica que 'el elemento HTML <footer> indica un pie de página para un documento o sección. Es nuevo en HTML 5. Típicamente, un elemento <footer> podría contener información de autoría o derechos de autor'.", 
    ref:"p. 60", d:2 },

  { s:"B", q:"¿Qué elemento HTML se utiliza para definir un encabezado de documento o sección (no confundir con <head>)?", 
    o:["<head>","<header>","<heading>","<h1>"], 
    c:1, 
    e:"El texto indica que 'el elemento HTML <header> indica un encabezado para un documento o sección. Es nuevo en HTML 5. Típicamente, un elemento <header> podría contener contenido introductorio, enlaces de navegación, uno o más elementos de encabezado'. Se diferencia de <head> que es para metadatos.", 
    ref:"p. 64", d:2 },

  /* ============================================================
     SECCIÓN C — Tablas, formularios y controles (10)
     ============================================================ */
  { s:"C", q:"¿Qué elemento HTML se utiliza para definir una tabla?", 
    o:["<grid>","<table>","<tabular>","<data>"], 
    c:1, 
    e:"El texto indica que 'el elemento HTML <table> indica una tabla. Típicamente incluye uno o más elementos <tr> y, dentro de ellos, elementos <td> y/o <th>'.", 
    ref:"p. 92", d:1 },

  { s:"C", q:"¿Qué elemento HTML se utiliza para definir una fila de tabla?", 
    o:["<row>","<tr>","<td>","<th>"], 
    c:1, 
    e:"El texto indica que 'el elemento HTML <tr> indica una fila de tabla (dentro de una tabla). Aparece dentro de un elemento <table> y contiene elementos <td> y <th> representando celdas individuales'.", 
    ref:"p. 96", d:1 },

  { s:"C", q:"¿Qué elemento HTML se utiliza para definir una celda de encabezado de tabla?", 
    o:["<td>","<th>","<header>","<cell>"], 
    c:1, 
    e:"El texto indica que 'el elemento HTML <th> indica una celda de encabezado de tabla (dentro de una fila de tabla)'. Las tablas HTML contienen dos tipos de celdas: encabezados (<th>) y celdas estándar (<td>).", 
    ref:"p. 95", d:1 },

  { s:"C", q:"¿Qué elemento HTML se utiliza para definir una celda estándar de tabla?", 
    o:["<td>","<th>","<cell>","<data>"], 
    c:0, 
    e:"El texto indica que 'el elemento HTML <td> indica una celda de tabla (dentro de una fila de tabla). Aparecen dentro de elementos <tr>'. Se diferencian de <th> porque las celdas de encabezado se formatean de manera distinta por defecto.", 
    ref:"p. 93", d:1 },

  { s:"C", q:"¿Qué elemento HTML se utiliza para crear un formulario?", 
    o:["<input>","<form>","<fieldset>","<button>"], 
    c:1, 
    e:"El texto indica que 'el elemento HTML <form> indica un formulario HTML para entrada del usuario. Típicamente, un elemento <form> contendrá uno o más de los siguientes elementos: <button>, <fieldset>, <input>, <label>, <optgroup>, <option>, <select>, <textarea>'.", 
    ref:"p. 60", d:1 },

  { s:"C", q:"¿Qué elemento HTML se utiliza para crear un control de entrada de una sola línea?", 
    o:["<textarea>","<input>","<text>","<field>"], 
    c:1, 
    e:"El texto indica que 'el elemento HTML <input> indica un control de entrada (de una sola línea) en el que el usuario puede introducir datos. Se usa dentro de un elemento <form>'.", 
    ref:"p. 67", d:1 },

  { s:"C", q:"¿Qué atributo del elemento <input> especifica el tipo de control de entrada?", 
    o:["kind","type","mode","format"], 
    c:1, 
    e:"El texto indica que 'hay muchos tipos diferentes de elementos <input> que varían dependiendo del atributo type del elemento, incluyendo: button, checkbox, color, date, datetime, email, file, hidden, image, month, number, password, radio, range, reset, search, submit, tel, text, time, url, week'.", 
    ref:"p. 67", d:2 },

  { s:"C", q:"¿Qué elemento HTML se utiliza para crear un control de entrada multilínea?", 
    o:["<input>","<textarea>","<textbox>","<multiline>"], 
    c:1, 
    e:"El texto indica que 'el elemento HTML <textarea> indica un control de entrada multilínea. Puede contener un número ilimitado de caracteres, y el texto utilizado se representa típicamente en una fuente de ancho fijo'.", 
    ref:"p. 93", d:2 },

  { s:"C", q:"¿Qué elemento HTML se utiliza para definir una lista desplegable?", 
    o:["<dropdown>","<select>","<list>","<menu>"], 
    c:1, 
    e:"El texto indica que 'el elemento HTML <select> indica una lista desplegable. Los elementos option dentro del elemento <select> identifican las opciones disponibles dentro de la lista desplegable'.", 
    ref:"p. 85", d:1 },

  { s:"C", q:"¿Qué elemento HTML se utiliza para definir una opción dentro de una lista desplegable?", 
    o:["<item>","<option>","<choice>","<selectitem>"], 
    c:1, 
    e:"El texto indica que 'el elemento HTML <option> indica una opción en una lista desplegable'. Se usa dentro de elementos <select>, <optgroup> o <datalist>.", 
    ref:"p. 79", d:1 },

  /* ============================================================
     SECCIÓN D — Multimedia, HTML5, XHTML y recursos (8)
     ============================================================ */
  { s:"D", q:"¿Qué elemento HTML se utiliza para incrustar un video?", 
    o:["<media>","<movie>","<video>","<embed>"], 
    c:2, 
    e:"El texto describe el elemento <video> como 'indica un video o película. Es nuevo en HTML 5'. Menciona formatos soportados como MP4, WebM y Ogg.", 
    ref:"p. 99", d:1 },

  { s:"D", q:"¿Qué elemento HTML se utiliza para incrustar audio?", 
    o:["<sound>","<audio>","<music>","<embed>"], 
    c:1, 
    e:"El texto indica que 'el elemento HTML <audio> se utiliza para definir y reproducir sonido, como música u otras transmisiones de audio. Es nuevo en HTML 5'.", 
    ref:"p. 45", d:1 },

  { s:"D", q:"¿Qué elemento HTML se utiliza para insertar una imagen?", 
    o:["<image>","<img>","<picture>","<photo>"], 
    c:1, 
    e:"El texto indica que 'el elemento HTML <img> indica una imagen. Técnicamente tiene dos atributos requeridos, a saber, src (la fuente de la imagen) y alt (el texto alternativo)'.", 
    ref:"p. 66", d:1 },

  { s:"D", q:"¿Qué atributo del elemento <img> especifica el texto alternativo?", 
    o:["title","alt","text","description"], 
    c:1, 
    e:"El texto indica que 'el atributo alt indica el texto alternativo a mostrar cuando el contenido original (ej. una imagen) no se muestra'. Se aplica a elementos <area>, <img> e <input>.", 
    ref:"p. 113", d:2 },

  { s:"D", q:"¿Qué elemento HTML se utiliza para crear un hipervínculo a una hoja de estilos externa?", 
    o:["<style>","<link>","<css>","<stylesheet>"], 
    c:1, 
    e:"El texto indica que 'las hojas de estilo externas se referencian usando un elemento <link>, que va dentro de la sección <head>. Este tipo de elemento link tiene una forma como: <link rel=\"stylesheet\" type=\"text/css\" href=\"mystyle.css\">'.", 
    ref:"p. 12", d:2 },

  { s:"D", q:"¿Qué elemento HTML se utiliza para incrustar código JavaScript?", 
    o:["<js>","<script>","<javascript>","<code>"], 
    c:1, 
    e:"El texto indica que 'el elemento HTML <script> indica script/programación del lado del cliente. Usualmente esto se escribe en JavaScript. El elemento <script> o bien contiene este código o apunta a un archivo externo mediante su atributo src'.", 
    ref:"p. 84", d:2 },

  { s:"D", q:"Según el texto, ¿qué es XHTML?", 
    o:["Una versión antigua de HTML","Una variante moderna de HTML que combina HTML clásico y XML","Un lenguaje de programación del lado del servidor","Un framework de CSS"], 
    c:1, 
    e:"El texto define XHTML como 'una variante moderna de HTML que implica un cruce entre HTML clásico y XML.' Requiere que todos los elementos estén correctamente cerrados y anidados.", 
    ref:"p. 40", d:2 },

  { s:"D", q:"¿Cuál es una diferencia clave entre HTML y XHTML según el texto?", 
    o:["XHTML no permite atributos","XHTML requiere que todos los elementos estén correctamente cerrados","XHTML no soporta CSS","XHTML solo funciona en Internet Explorer"], 
    c:1, 
    e:"El texto indica que 'todos los elementos XHTML deben estar correctamente cerrados (y correctamente anidados), ej. usando </p> para cerrar un elemento párrafo (<p>) y no solo comenzando uno nuevo con un nuevo <p>'. Además, elementos vacíos como <br> deben cerrarse como <br />.", 
    ref:"p. 41", d:3 }
]};
