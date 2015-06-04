<?php

	require("config.php");
	
	function executeSQL($query,$values) {
		
		global $_pdo;
		
		$stmt = $_pdo->prepare($query);
		$stmt->execute($values);
		
		$_pdo = null;
		
		echo(json_encode(""));
		
	}
	

?>