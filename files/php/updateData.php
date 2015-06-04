<?php

	if ($_POST) {
		
		require("setData.php");
		updateData($_POST);
		
	}
	
	function updateData($data) {
		
		$table  = $data["table"];
		$column = $data["column"];
		$values = explode(",",$data["value"]);
		$option = $data["option"];
		$and    = $data["and"];
		$more   = $data["more"];
		
		$query = "UPDATE ".$table." SET ".$column." = ? WHERE ".$option;
		if (isset($and)) $query = $query." AND ".$and;
		if (isset($more)) $query = $query." AND ".$more;
		
		executeSQL($query,$values);
		
	}

?>