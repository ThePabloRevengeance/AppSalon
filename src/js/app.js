let pagina = 1; //Variable igual a 1

const cita = { nombre: '', fecha: '', hora: '', servicios: [] }

document.addEventListener('DOMContentLoaded', function(){
    iniciarApp();
});

function iniciarApp(){
    //console.log('iniciando app');
    mostrarServicios();

    //Resalta el Div Actual segun el tab al que se presiona
    mostrarSeccion();

    //Oculta o muestra una seccion segun el tab al que se presiona
    cambiarSeccion();

    //Paginacion Siguiente y Anterior
    paginaSiguiente();

    paginaAnterior();

    //Comprueba la pagina actual para ocultar o mostrar la paginacion
    botonesPaginador(); 

    //Muestra el resumen de la cita (o mensaje de error en caso de no pasar la validacion)
    mostrarResumen();

    //Almacena el nombre de la cita en el objeto 
    nombreCita();

    //Almacena la fecha de la cita en el objeto
    fechaCita();

    //Deshabilitar dias pasados
    deshabilitarFechaAnterior();

    //Almacena la hora de la cita en el objeto
    horaCita();
}

function mostrarSeccion(){
    //Eliminar mostrar-seccion de la seccion anterior
    const seccionAnterior = document.querySelector('.mostrar-seccion');
    if(seccionAnterior) {
        seccionAnterior.classList.remove('mostrar-seccion');
    }

    const seccionActual = document.querySelector(`#paso-${pagina}`); //Extraigo el enlace con el numero correspondiente
    seccionActual.classList.add('mostrar-seccion');

    const tabAnterior = document.querySelector('.tabs .actual');
    if(tabAnterior){
        tabAnterior.classList.remove('actual');
    }
    

    //Resalta el tab actual
    const tab = document.querySelector(`[data-paso="${pagina}"]`);
    tab.classList.add('actual');
}

function cambiarSeccion(){
    const enlaces = document.querySelectorAll('.tabs button');
    enlaces.forEach ( enlace => {
        enlace.addEventListener('click', e => {
            e.preventDefault();
            pagina = parseInt (e.target.dataset.paso); //Dependiendo de lo que le de click, cambia el valor de "pagina"

            // Llamar la funcion de mostrar seccion
            mostrarSeccion();

            botonesPaginador();
        });
    })
}

async function mostrarServicios(){
    try{
        const resultado = await fetch('./servicios.json'); //  "./": Carpeta principal
        //Cuando utilizo fetch, tengo que decirle qué tipo de respuesta es el archivo que estoy llamando 
        const db = await resultado.json(); // en este caso, le digo que es un json

        const { servicios } = db;

        //generar el html
        servicios.forEach ( servicio => { 
            const { id, nombre ,precio} = servicio;

            //DOM Scripting
            const nombreServicio = document.createElement('P');
            nombreServicio.textContent = nombre;
            nombreServicio.classList.add('nombre-servicio');

            //Generar el precio del servicio
            const precioServicio = document.createElement('P');
            precioServicio.textContent = `$ ${precio}`;
            precioServicio.classList.add('precio-servicio');

            //Generar div contenedor de servicio
            const servicioDiv = document.createElement('DIV');
            servicioDiv.classList.add('servicio');
            
            //Selecciona un servicio para la cita
            servicioDiv.onclick = seleccionarServicio;

            //Inyectar precio y nombre al div de servicio
            servicioDiv.appendChild(nombreServicio);
            servicioDiv.appendChild(precioServicio);

            //inyectarlo en el HTML
            document.querySelector('#servicios').appendChild(servicioDiv); 
        })
    } catch (error){
        console.log(error);
        //console.log("xd");
    }
}


function seleccionarServicio(e){
    // Forzar que el elemento al cual le damos click sea el DIV
    let elemento;
    if(e.target.tagName === 'P'){
        elemento = e.target.parentElement; //Fuerzo a JS para que vaya hacia el padre del parrafo (el DIV)
    }else{
        elemento = e.target;//Aca va directo al DIV
    }

    if(elemento.classList.contains('seleccionado')){ //Pregunto si el elemento contiene la clase "seleccionado"
        elemento.classList.remove('seleccionado'); //Le quito la clase "selecionado"

        const id = parseInt(elemento.dataset.idServicio); //ParseInt convierte a numero

        eliminarServicio(id);
    }else{
        elemento.classList.add('seleccionado');

        const servicioObj = {
            id: parseInt(elemento.dataset.idServicio),//
            nombre: elemento.firstElementChild.textContent, //El primer hijo de "elemento", que es un texto
            precio: elemento.firstElementChild.nextElementSibling.textContent, //El segundo hijo de "elemento"
        }

        agregarServicio(servicioObj);
    }
}

function eliminarServicio(id) {
    const { servicios } = cita;
    cita.servicios = servicios.filter(servicio => servicio.id !==id);//Solo traigo los que son diferentes al recien eliminado
}

function agregarServicio(servicioObj){
    const { servicios } = cita; 

    cita.servicios = [...servicios, servicioObj] //"..." para tomar la copia de los servicios
}

function paginaSiguiente() {
    const paginaSiguiente = document.querySelector('#siguiente');
    paginaSiguiente.addEventListener('click', () =>{
        pagina++;

        botonesPaginador();
    })
}

function paginaAnterior(){
    const paginaAnterior = document.querySelector('#anterior');
    paginaAnterior.addEventListener('click', () =>{
        pagina--;

        botonesPaginador();
    })
}

function botonesPaginador(){
    const paginaSiguiente = document.querySelector('#siguiente');
    const paginaAnterior = document.querySelector('#anterior');

    if(pagina === 1){
        paginaAnterior.classList.add('ocultar');
        paginaSiguiente.classList.remove('ocultar');
    }else if(pagina === 3){
        paginaSiguiente.classList.add('ocultar');
        paginaAnterior.classList.remove('ocultar'); 

        mostrarResumen(); //Estamos en la pagina 3, carga el resumen de la cita 
    }else {
        paginaAnterior.classList.remove('ocultar'); 
        paginaSiguiente.classList.remove('ocultar');
    }

    mostrarSeccion();// Cambia la seccion que se muestra por la de la pagina
}

function mostrarResumen() {
    // Destructuring 
    const {nombre, fecha, hora, servicios} = cita; //Todo lo vamos a extraer de la cita

    //Seleccionar el resumen
    const resumenDiv = document.querySelector('.contenido-resumen');

    //Limpia el HTML previo
    while (resumenDiv.firstChild){
        resumenDiv.removeChild( resumenDiv.firstChild ); 
    }

    //Validacion de objeto
    if(Object.values(cita).includes('')){
        const noServicios = document.createElement('P');
        noServicios.textContent = 'Faltan datos de Servicios, hora, fecha o nombre';

        noServicios.classList.add('invalidar-cita');

        //Agregar a resumen Div
        resumenDiv.appendChild(noServicios);

        return;
    }

    const headingCita = document.createElement('H3');
    headingCita.textContent = 'Resumen de Cita';

    //Mostrar el resumen
    const nombreCita = document.createElement('P');
    nombreCita.innerHTML = `<span>Nombre:</span> ${nombre}`;
    //innerHTML trata las etiquetas como etiquetas. textContent las va a tratar como texto

    const fechaCita = document.createElement('P');
    fechaCita.innerHTML = `<span>Fecha:</span> ${fecha}`;

    const horaCita = document.createElement('P');
    horaCita.innerHTML = `<span>Hora:</span> ${hora}`;

    const serviciosCita = document.createElement('DIV');
    serviciosCita.classList.add('resumen-servicios');

    const headingServicios = document.createElement('H3');
    headingServicios.textContent = 'Resumen de Servicios';

    serviciosCita.appendChild(headingServicios);

    let cantidad = 0; //EL PRECIO TOTAL A PAGAR

    //Iterar sobre el arreglo de servicios 
    servicios.forEach( servicio => {

        const {nombre, precio} = servicio;
        const contenedorServicio = document.createElement('DIV');
        contenedorServicio.classList.add('contenedor-servicio');
        
        const textoServicio = document.createElement('P');
        textoServicio.textContent = nombre; //Con el DESTRUCTURING me ahorro el "servicio.nombre"

        const precioServicio = document.createElement('P');
        precioServicio.textContent = precio;
        precioServicio.classList.add('precio');

        const totalServicio = precio.split('$'); //Para que el $ no nos moleste cuando calculemos el total
        cantidad += parseInt(totalServicio[1].trim()) //El [1] tiene lo que viene despues del signo $

        //Colocar texto y precio en el div
        contenedorServicio.appendChild(textoServicio);
        contenedorServicio.appendChild(precioServicio);

        serviciosCita.appendChild(contenedorServicio);
    })



    resumenDiv.appendChild(headingCita);
    resumenDiv.appendChild(nombreCita);
    resumenDiv.appendChild(fechaCita);
    resumenDiv.appendChild(horaCita);

    resumenDiv.appendChild(serviciosCita);

    const cantidadPagar = document.createElement('P');
    cantidadPagar.classList.add('total');
    cantidadPagar.innerHTML = `<span>Total a Pagar: </span> $ ${cantidad}`;
    resumenDiv.appendChild(cantidadPagar);
}




function nombreCita() {
    const nombreInput = document.querySelector('#nombre');

    nombreInput.addEventListener('input', e => {
        const nombreTexto = e.target.value.trim(); //trim elimina el espacio en blanco al inicio y al final
        console.log(nombreTexto);

        //Validacion de que nombreTexto debe tener algo
        if (nombreTexto === '' || nombreTexto.length < 3){
            mostrarAlerta('Nombre no valido', 'error');
        } else {
            const alerta = document.querySelector('.alerta');
            if(alerta) { alerta.remove(); }
            cita.nombre = nombreTexto; //Le asigno al objeto cita el nombre de nombreTexto
        }
    })
}



function mostrarAlerta(mensaje, tipo){
    //console.log('el mensaje es ', mensaje);

    //Si hay una alerta previa, no crear otra
    const alertaPrevia = document.querySelector('.alerta');
    if(alertaPrevia){
        return;
    }

    const alerta = document.createElement('DIV');
    alerta.textContent = mensaje;
    alerta.classList.add('alerta');

    if(tipo === 'error'){
        alerta.classList.add('error');
    }

    //Insertar en el HTML
    const formulario = document.querySelector('.formulario');
    formulario.appendChild( alerta );
     
    //Eliminar la alerta despues de 3 segundos
    setTimeout(() =>{
        alerta.remove();
    }, 3000)
}



function fechaCita(){
    const fechaInput = document.querySelector('#fecha');
    fechaInput.addEventListener('input', e =>{
        const dia = new Date(e.target.value).getUTCDay(); //Toma el string obtenido de la fecha y lo convierte en tipo fecha
        //la funcion getUTCDay nos retorna el numero del dia de semana
        if([0, 6].includes(dia)){
            e.preventDefault();
            fechaInput.value = ''; //Para resetear el valor de fechaInput
            mostrarAlerta('Seleccionaste domingo o sabado lo cual no es valido', 'error');
        }else {
            cita.fecha = fechaInput.value;
        }



        //const opciones = { 
        //    weekday: 'long',
        //    year: 'numeric',
        //    month: 'long'
        //}
        //console.log(dia.toLocaleDateString('es-ES', opciones))   Te muestra la fecha pero en español
        //moment o DOit FMS, librerias para modificar la fecha en español
    })
}



function deshabilitarFechaAnterior(){
    const inputFecha = document.querySelector('#fecha');

    const fechaAhora = new Date(); //Se crea con la fecha actual
    const year = fechaAhora.getFullYear();
    const mes = fechaAhora.getMonth() + 1;
    const dia = fechaAhora.getDate() +1; //El mas 1 es para no reservar para ese mismo dia
    
    //Formato Deseado: AAAA-MM-DD
    const fechaDeshabilitar = `${year}-${mes < 10 ? `0${mes}` : mes}-${dia}`; //El condicional del mes para que no haya errores

    inputFecha.min = fechaDeshabilitar; //La fecha minima va a cambiar de forma dinamica
}



function horaCita() {
    const inputHora = document.querySelector('#hora');
    inputHora.addEventListener('input', e => {

        const horaCita = e.target.value;
        const hora = horaCita.split(':'); //Divide el string de la hora cuando encuentra un :

        if(hora[0] < 10 || hora[0] > 18){
            mostrarAlerta('Hora no valida','error');
            setTimeout(() => {
                inputHora.value = ''; //Para que se reinicie el valor
            }, 3000);
            
        }else{
            cita.hora = horaCita;
        }
    })
}