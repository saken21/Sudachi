<?php

	if ($_POST) exportCSV($_POST);
	
	function exportCSV($data) {
		
		$array = $data["data"];
		mb_convert_variables("SJIS","UTF-8",$array);
		
		$file = fopen("data.csv","w");
		
		foreach ($array as $row) fputcsv($file,$row);
		fclose($file);
		
		echo(json_encode("success"));
		
	}

?>