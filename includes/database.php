<?php

$db = mysqli_connect('localhost', 'root', '', 'appsalon'); //Esta funcion nos permite conectarnos a una BD
 //Recibe el host, el usuario, la contraseña, y la base de datos

if (!$db) { //si db esta vacio,
    echo "Error: No se pudo conectar a MySQL.";
    echo "errno de depuración: " . mysqli_connect_errno();
    echo "error de depuración: " . mysqli_connect_error();
    exit;
}
