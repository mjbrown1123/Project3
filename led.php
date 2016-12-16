<!-- PHP file that handles get request and updates text file -->

<?php

//get the state
$onoroff = $_GET["state"]; 

//set name of text file
$textfile = "LEDstate.txt"; 
$fileLocation = "$textfile";

//open text file
$fh = fopen($fileLocation, 'w   ') or die("Something went wrong!");

//get the string to write to the text file
$stringToWrite = "$onoroff"; 

//write to text file, and close text file
fwrite($fh, $stringToWrite); 
fclose($fh); 
 
//return to index.html
header("Location: index.html"); 
?>