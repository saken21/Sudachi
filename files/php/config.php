<?php
	
	$host = "localhost";
	$name = "litalico";
	$dsn  = "mysql:host=".$host.";dbname=".$name.";charset=utf8";
	$id   = "root";
	$pass = "root";
	
	$_pdo = new PDO($dsn,$id,$pass,array(PDO::ATTR_EMULATE_PREPARES=>false));

?>