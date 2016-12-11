var scene,
camera,
renderer,
element,
container,
effect,
controls,
clock,


// Particles
particles = new THREE.Object3D(),
totalParticles = 200,
maxParticleSize = 200,
particleRotationSpeed = 0,
particleRotationDeg = 0,
lastColorRange = [0, 0.3],
currentColorRange = [0, 0.3];

var serial;          // variable to hold an instance of the serialport library
var portName = '/dev/cu.usbmodem1421';  // fill in your serial port name here
portName = 'COM6';
var inData;

var lines = ""; 




var stlMesh;

var stlIndex = 0;

var stlFiles = ["body.STL", "tire.STL", "wheel.STL"];


function setup() {

/*
  serial = new p5.SerialPort();       // make a new instance of the serialport library
  serial.on('list', printList);  // set a callback function for the serialport list event
  serial.on('connected', serverConnected); // callback for connecting to the server
  serial.on('open', portOpen);        // callback for the port opening
  serial.on('data', serialEvent);     // callback for when new data arrives
  serial.on('error', serialError);    // callback for errors
  serial.on('close', portClose);      // callback for the port closing
 
  serial.list();                      // list the serial ports

  serial.close(portName);
  serial.open(portName);   */           // open a serial port

  setScene();

  setControls();

  setLights();
  //setFloor();
  //setParticles();

  clock = new THREE.Clock();
  animate();
}

function setScene() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.001, 700);
  camera.position.set(0, 15, 0);
  scene.add(camera);

  renderer = new THREE.WebGLRenderer();
  element = renderer.domElement;
  container = document.getElementById('webglviewer');
  container.appendChild(element);

  effect = new THREE.StereoEffect(renderer);
  
    camera.position.x -= 200;
}

function keyPressed() {

  if(keyCode === UP_ARROW) {

    camera.position.x += 40;

  }
  else if(keyCode === DOWN_ARROW) {

    camera.position.x -= 40;

  }
  else if(keyCode === ENTER) {

    changeSTL();

  }

}

function setLights() {
  // Lighting
  var light = new THREE.PointLight(0x999999, 2, 100);
  light.position.set(50, 50, 50);
  scene.add(light);

  var lightScene = new THREE.PointLight(0x999999, 2, 100);
  lightScene.position.set(0, 5, 0);
  scene.add(lightScene);

  var lightScene = new THREE.PointLight(0x999999, 2, 100);
  lightScene.position.set(0, 5, 10);
  scene.add(lightScene);

  var lightScene = new THREE.PointLight(0x999999, 2, 100);
  lightScene.position.set(10, 5, 0);
  scene.add(lightScene);

  var lightScene = new THREE.PointLight(0x999999, 2, 100);
  lightScene.position.set(0, 20, 0);
  scene.add(lightScene);

  var light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );
}

function setFloor() {
  var floorTexture = THREE.ImageUtils.loadTexture('textures/grass.png');
  floorTexture.wrapS = THREE.RepeatWrapping;
  floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat = new THREE.Vector2(50, 50);
  floorTexture.anisotropy = renderer.getMaxAnisotropy();

  var floorMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    specular: 0xffffff,
    shininess: 20,
    shading: THREE.FlatShading,
    map: floorTexture
  });

  var geometry = new THREE.PlaneBufferGeometry(1000, 1000);

  var floor = new THREE.Mesh(geometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  //scene.add(floor);
}

// ASCII file
var loader = new THREE.STLLoader();
loadSTL(stlFiles[0]);

function setParticles() {
  var particleTexture = THREE.ImageUtils.loadTexture('textures/particle.png'),
  spriteMaterial = new THREE.SpriteMaterial({
    map: particleTexture,
    color: 0xffffff
  });

  for (var i = 0; i < totalParticles; i++) {
    var sprite = new THREE.Sprite(spriteMaterial);

    sprite.scale.set(64, 64, 1.0);
    sprite.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.75);
    sprite.position.setLength(maxParticleSize * Math.random());

    sprite.material.blending = THREE.AdditiveBlending;

    particles.add(sprite);
  }
  particles.position.y = 70;
  //scene.add(particles);
}
function draw() {

  var file = "http://creativecodingvr.herokuapp.com/LEDstate.txt";

   //= loadStrings(file);
  var allText;

  var txtFile = new XMLHttpRequest();
txtFile.open("GET", file, true);
txtFile.onreadystatechange = function() {
  if (txtFile.readyState === 4) {  // Makes sure the document is ready to parse.
    if (txtFile.status === 200) {  // Makes sure it's found the file.
      if(txtFile.responseText != "") {
          lines = txtFile.responseText; 
        }
      //txtFile.responseText.split("\n"); // Will separate each line into an array
    }
  }
}

//this is necessary!
txtFile.send(null);
  
//console.log(lines);

var indexP = lines.indexOf('P');
var indexR = lines.indexOf('R');
var indexA = lines.indexOf('A');

var yaw = parseFloat(lines.substring(1, indexP));


var pitch = parseFloat(lines.substring(indexP+1, indexR));


//change this to be from indexR+1 to lines.length -1 if you're getting values directly from the Arduino
var roll = parseFloat(lines.substring(indexR+1, indexA));

var on = parseInt(lines.substring(indexA + 1, lines.length - 1));


console.log("Y: " + yaw + " P: " + pitch + " R: " + roll + " State: " + on);


if(!(typeof stlMesh === "undefined") && on == 1) {

   stlMesh.rotation.x =pitch;//ma(yaw, 0,360,0, 2* Math.PI);
   stlMesh.rotation.y = yaw;//map(pitch, 0,360,0,2 * Math.PI);
   stlMesh.rotation.z = roll;//map(roll, 0, 360, 0, 2 * Math.PI);
 }
}

function animate() {
  var elapsedSeconds = clock.getElapsedTime(),
  particleRotationDirection = particleRotationDeg <= 180 ? -1 : 1;

  particles.rotation.y = elapsedSeconds * particleRotationSpeed * particleRotationDirection;

  // We check if the color range has changed, if so, we'll change the colours
  if (lastColorRange[0] != currentColorRange[0] && lastColorRange[1] != currentColorRange[1]) {

    for (var i = 0; i < totalParticles; i++) {
      particles.children[i].material.color.setHSL(currentColorRange[0], currentColorRange[1], (Math.random() * (0.7 - 0.2) + 0.2));
    }

    lastColorRange = currentColorRange;
  }

  //this is included in case the STL file hasn't been loaded yet
      //will return undefined if loading isn't complete
  /*if(!(typeof stlMesh === "undefined")) {

    //map the roation value from 0 to 255 (domain) to 0 to 2 * PI (range of rotation values)
    stlMesh.rotation.y = map(inData, 0, 255, 0, 2* Math.PI);  
  }*/

  //else, debug saying that the object is still undefined
  else {
    //console.log("undefined");
  }


  requestAnimationFrame(animate);


  update(clock.getDelta());
  render(clock.getDelta());
}


function setControls() {
  // Our initial control fallback with mouse/touch events in case DeviceOrientation is not enabled
  controls = new THREE.OrbitControls(camera, element);
  controls.target.set(
    camera.position.x + 0.15,
    camera.position.y,
    camera.position.z
  );
  controls.noPan = true;
  controls.noZoom = true;

  // Our preferred controls via DeviceOrientation
  function setOrientationControls(e) {
    if (!e.alpha) {
      return;
    }

    controls = new THREE.DeviceOrientationControls(camera, true);
    controls.connect();
    controls.update();

    element.addEventListener('click', fullscreen, false);

    window.removeEventListener('deviceorientation', setOrientationControls, true);
  }
  window.addEventListener('deviceorientation', setOrientationControls, true);
}

function resize() {
  var width = container.offsetWidth;
  var height = container.offsetHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  effect.setSize(width, height);
}

function update(dt) {
  resize();

  camera.updateProjectionMatrix();

  controls.update(dt);
}

function render(dt) {
  effect.render(scene, camera);
}

function fullscreen() {
  if (container.requestFullscreen) {
    container.requestFullscreen();
  } else if (container.msRequestFullscreen) {
    container.msRequestFullscreen();
  } else if (container.mozRequestFullScreen) {
    container.mozRequestFullScreen();
  } else if (container.webkitRequestFullscreen) {
    container.webkitRequestFullscreen();
  }
}

function getURL(url, callback) {
  var xmlhttp = new XMLHttpRequest();

  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4) {
      if (xmlhttp.status == 200){
        callback(JSON.parse(xmlhttp.responseText));
      }
      else {
        console.log('We had an error, status code: ', xmlhttp.status);
      }
    }
  }

  xmlhttp.open('GET', url, true);
  xmlhttp.send();
}


function loadSTL(name) {

  loader.load( "STL/" + name, function ( geometry ) {
    var material = new THREE.MeshPhongMaterial( { color: 0xff0000, specular: 0x111111, shininess: 200 } );
    stlMesh = new THREE.Mesh( geometry,material );
    stlMesh.position.set( 25, - 0.25,10);
    stlMesh.rotation.set( 0, - Math.PI, 0 );
    stlMesh.scale.set( 1, 1, 1);
    //mesh.castShadow = true;
    //mesh.receiveShadow = true;
    scene.add(stlMesh );

    camera.fov *= 1;
    camera.updateProjectionMatrix();

  } );

}

function changeSTL() {

  stlIndex++;

  if(stlIndex >= stlFiles.length) {

    stlIndex = 0;

  }

  scene.remove(stlMesh);

  loadSTL(stlFiles[stlIndex]);

}

// get the list of ports:
function printList(portList) {
 // portList is an array of serial port names
 for (var i = 0; i < portList.length; i++) {
 // Display the list the console:
  console.log(i + " " + portList[i]);
 }
}
/*
function serverConnected() {
  console.log('connected to server.');
}
 
function portOpen() {
  console.log('the serial port opened.')
}
 
function serialEvent() {
  inData = serial.read();
}
 
function serialError(err) {
  console.log('Something went wrong with the serial port. ' + err);
}
 
function portClose() {
  console.log('The serial port closed.');
}*/