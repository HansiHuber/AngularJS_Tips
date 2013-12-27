<?php
//header('Content-type: application/xml');
//echo "{x:abc}";
$destinationURL = 'http://club97.bplaced.net/tipsem2012admin.php?REQUEST=13';
$destinationURL = $_REQUEST['URL'];

$destinationURL = str_replace("QQQ","?",$destinationURL);
$destinationURL = str_replace("YYY","&",$destinationURL);
$destinationURL = str_replace("ZZZ"," ",$destinationURL);

//echo $destinationURL;
//die();

$handle = fopen($destinationURL,"r");
//echo "OK";
if ($handle)
{
	while(!feof($handle))
	{
		$buffer = fgets($handle,4096);
		echo $buffer;
	}
	fclose($handle);
}
?>