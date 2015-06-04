<?php

	if ($_POST) {
		
		require("setData.php");
		insertData($_POST);
		
	}
	
	function insertData($data) {
		
		$table  = $data["table"];
		$column = $data["column"];
		$values = explode(",",$data["value"]);
		$qList  = "?";
		
		$length = count($values);
		
		for ($i = 0; $i < $length - 1; $i++) {
			$qList = $qList.",?";
		}
		
		$query = "INSERT INTO ".$table." (".$column.") VALUES (".$qList.")";
		
		executeSQL($query,$values);
		
	}

?>