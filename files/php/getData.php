<?php

	if ($_GET) {
		
		require("config.php");
		echoResult($_GET);
		
	}
	
	function echoResult($data) {
		
		global $_pdo;
		
		$query  = "SELECT ".$data["column"]." FROM ".$data["table"];
		$option = $data["option"];
		$and    = $data["and"];
		$more   = $data["more"];
		
		if (isset($option)) {
			
			$query = $query." WHERE ".$option;
			if (isset($and)) $query = $query." AND ".$and;
			if (isset($more)) $query = $query." AND ".$more;
			
		}
		
		$stmt  = $_pdo->query($query);
		$array = array();
		
		while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) array_push($array,$row);
		echo(json_encode($array));
		
		$_pdo = null;
		
	}

?>