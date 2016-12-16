
//include necessary libraries
import processing.serial.*;
import http.requests.*;
Serial port;
 
String stdEnding = "this is the intial string";  
     
String URL = "http://creativecodingvr.herokuapp.com/led.php?state=";
    
 
 void setup()  {
   
   //create a new serial port object using the port between the Arduino's port
    port = new Serial(this, Serial.list()[1], 115200);  // Open the port that the Arduino board is connected to, at 9600 baud
    
 
}
 void draw() {
   
    //create a new get request using the base URL (of the heroku app site) and the get request addition
    GetRequest get = new GetRequest(URL + stdEnding);
    
    //send the get request
    get.send(); 
 }
 
 //runs everytime processing receives a serial print
 void serialEvent(Serial myPort) {
   
     //get the string from the Arduino
     String test = myPort.readStringUntil('C');
     
     //make sure the input isn't a null value
     if(test != null) {
       
       //if not, set the sending variable to this
       stdEnding = test;
       
       //print this value to the console
       println(stdEnding);
        
     }
  
 
 }