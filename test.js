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

//for making sure STL changes only occur once
var lastChange = 0;

//this is the input variable from the glove
var lines = ""; 

//stores the current STL mesh
var stlMesh;

//stores the index for which STL model you've loaded
var stlIndex = 0;

//stores names of the STL files you will view
var stlFiles = ["body.STL", "tire.STL", "wheel.STL"];


//from here until the STL loader is code taken from Ms. deBB's example (just to get me started with using the Three.js library)
function setup() {

  setScene();

  setControls();

  setLights();

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

//above code is from Ms. deBB's Three.js example


//initialize a new STL loader
var loader = new THREE.STLLoader();

//load the first STL file
loadSTL(stlFiles[0]);

//using p5 draw function
function draw() {

  //the file name on the server
  var file = "LEDstate.txt";

  //initialize new XMLHttpRequest
  var txtFile = new XMLHttpRequest();

  //open the text file on the server using the get request
  txtFile.open("GET", file, true);

  //when the file is ready...
  txtFile.onreadystatechange = function() {
  if (txtFile.readyState === 4) { 

    //file is found
    if (txtFile.status === 200) {  

      //make sure the file has text in it
      if(txtFile.responseText != "") {

          //if so, get the text from the file
          lines = txtFile.responseText; 
        }
    }
  }
}

//this is necessary! 
txtFile.send(null);

//get the indices of markers in the string (markers = characters that indicate when next value starts)
  // P = when pitch starts, R = when roll starts, A = when rotate button starts, B = when stl change button starts
var indexP = lines.indexOf('P');
var indexR = lines.indexOf('R');
var indexA = lines.indexOf('A');
var indexB = lines.indexOf('B');

//get the yaw, pitch, roll, rotate, and stl change values from the input string
var yaw = parseFloat(lines.substring(1, indexP));
var pitch = parseFloat(lines.substring(indexP+1, indexR));
var roll = parseFloat(lines.substring(indexR+1, indexA));
var on = parseInt(lines.substring(indexA + 1, indexB));
var stlChange = parseInt(lines.substring(indexB + 1, lines.length-1));

//if the last stl change was 1 and it's now 0, change the last change to 0
   
   //this is necessary because the controller will send multiple 1 values (which indicates when to change the STL file)
   //if we didn't have this setting, the STL files would change several times at a time if the button is held
   //so, we want to make sure the stl file is change only ONCE each time the button is pressed
if(stlChange == 0 && lastChange == 1) {

  lastChange = 0;

}

//debug the input
console.log(lines);

//if the input says to change the STL and the input didn't say to change the STL before...
if(stlChange === 1  && lastChange != 1) {

  //then change the STL!
  changeSTL();

  //and flag that you just changed the STL
  lastChange = 1;

}

//make sure the current STL is loaded and the user wants to rotate
if(!(typeof stlMesh === "undefined") && on === 1) {

    //set the rotation values of the mesh using the input values from the user 
   stlMesh.rotation.x = pitch * -1;
   stlMesh.rotation.y = yaw;
   stlMesh.rotation.z = roll;

 }
}


//from here until loadSTL is from Ms. deBB's Three.js example so I could get accustomed to the library
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

//above code is from Ms. deBB's Three.js example program


//for loading an STL, using the inputted name of the file
function loadSTL(name) {

  //load the file!
  loader.load( "STL/" + name, function ( geometry ) {

    //set initial characteristics (rotation, color, etc.)
    var material = new THREE.MeshPhongMaterial( { color: 0xff0000, specular: 0x111111, shininess: 200 } );
    stlMesh = new THREE.Mesh( geometry,material );
    stlMesh.position.set( 25, - 0.25,10);
    stlMesh.rotation.set( 0, - Math.PI, 0 );
    stlMesh.scale.set( 1, 1, 1);
    scene.add(stlMesh );
    camera.fov *= 1;
    camera.updateProjectionMatrix();

  } );

}

//function to be called when we want to change the STL
function changeSTL() {

  //increase the current STL index
  stlIndex++;

  //but if the index goes over the array length, reset the index to zero
  if(stlIndex >= stlFiles.length) {

    stlIndex = 0;

  }

  //remove the old mesh and load the new one
  scene.remove(stlMesh);
  loadSTL(stlFiles[stlIndex]);

}