// revolutions per second
var angularSpeed = 0.2; 
var lastTime = 0;

// this function is executed on each animation frame
function animate(){
  // update
  //
  //var time = (new Date()).getTime();
  //var timeDiff = time - lastTime;
  //var angleChange = angularSpeed * timeDiff * 2 * Math.PI / 1000;
  //plane.rotation.z += angleChange;
  //lastTime = time;

  //camera.lookAt(scene.position)

  // render
  renderer.render(scene, camera);
  controls.update();

  // request new frame
  requestAnimationFrame(function(){
      animate();
  });
}


var container = document.getElementById("container");

// renderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// camera
console.log("windowinner = " + window.innerWidth);
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
camera.position.x = 0;
camera.position.y = -500;
camera.position.z = 1000;
//camera.rotation.x = 45 * (Math.PI / 180); //45 degrees, have to use radians? Annoying...

// scene
var scene = new THREE.Scene();

//controls
var controls = new THREE.TrackballControls(camera);
controls.rotateSpeed = 1.0;
controls.zoomSpeed = 1.2;
controls.panSpeed = 0.8;

controls.noZoom = false;
controls.noPan = false;

controls.staticMoving = true;
controls.dynamicDampingFactor = 0.3;

controls.keys = [ 65, 83, 68 ];

//controls.addEventListener( 'change', animate );//CREATE SCENE Objects:


var interiorWallMaterial  = new THREE.MeshBasicMaterial({color: 0x66779a});
var interiorWallMaterial2 = new THREE.MeshBasicMaterial({color: 0x667799});
var exteriorWallMaterial  = new THREE.MeshNormalMaterial({color: 0xddDDdd});
var floorMaterial         = new THREE.MeshBasicMaterial({color: 0x444444});
var ceilingMaterial       = new THREE.MeshNormalMaterial({color: 0xddDDdd});
var defaultMaterial       = new THREE.MeshNormalMaterial();

exteriorWallMaterial.opacity = 0.5
interiorWallMaterial.opacity = 0.7



//convert degrees to radians
function toRadians(deg){

  var radians = deg * Math.PI/180

  return radians;
}


var floor1cubes = {floors: [{obj: null, width: 400, height: 400, depth: 10, posX: 0, posY: 0, posZ: 0, holes: []}],
         walls: [
                {obj: null, width: 400, height: 90, depth: 10, posX: 195, posY: 0, posZ: 50, rotY: 90, rotZ: 0,
                    description: "", material: 1,
                    holes: [
                        {width: 20, height: 30, posX: 0,   posY: 0},
                        {width: 20, height: 30, posX: 80,  posY: 0},
                        {width: 20, height: 30, posX: -90, posY: 0}
                    ]
                },
                {obj: null, width: 400, height: 90, depth: 10, posX: -195, posY: 0, posZ: 50, rotY: 90, rotZ: 0,
                    description: "", material: 1,
                    holes: [
                        {width: 20, height: 30, posX: 0,   posY: 0},
                        {width: 20, height: 30, posX: 80,  posY: 0},
                        {width: 20, height: 30, posX: -90, posY: 0}
                    ]
                },
                {obj: null, width: 400, height: 90, depth: 10, posX:  0, posY: 195, posZ: 50, rotY: 0, rotZ: 0,
                    description: "",
                    material: 2,
                    holes: [
                        {width: 20, height: 30, posX: 0,   posY: 0},
                        {width: 40, height: 70, posX: 80,  posY: -15},
                        {width: 20, height: 30, posX: -90, posY: 0}
                    ]
                },
                {obj: null, width: 400, height: 90, depth: 10, posX:  0, posY: -195, posZ: 50, rotY: 0, rotZ: 0,
                    description: "",
                    material: 2,
                    holes: [
                        {width: 20, height: 30, posX: 0,   posY: 0},
                        {width: 40, height: 70, posX: 80,  posY: -15},
                        {width: 20, height: 30, posX: -90, posY: 0}
                    ]
                },
           ]};



function createCubes(cubes){

  var cube;
  var floor;

  for(var i = 0 ; i < cubes.floors.length; i++){
    floor = cubes.floors[i];
    cube_geo = new THREE.CubeGeometry(floor.width, floor.height, floor.depth);
    cube = new THREE.Mesh(cube_geo, floorMaterial);
    cube.overdraw = true;
    cube.position.setX(floor.posX);
    cube.position.setY(floor.posY);
    cube.position.setZ(floor.posZ);
    floor.obj = cube
    scene.add(cube);
  }



  for(var i = 0 ; i < cubes.walls.length; i++){
    wall = cubes.walls[i];
    cube = new THREE.Mesh(new THREE.CubeGeometry(wall.width, wall.height, wall.depth));
    //set holes if needed
    for(var j = 0 ; j < wall.holes.length; j++){
      var holedims = wall.holes[j];
      hole = new THREE.Mesh(new THREE.CubeGeometry(holedims.width, holedims.height, wall.depth));
      hole.position.setX(holedims.posX);
      hole.position.setY(holedims.posY);

      cube_bsp = new ThreeBSP(cube);
      hole_bsp = new ThreeBSP(hole);

      cube_bsp = cube_bsp.subtract(hole_bsp)
      var material = interiorWallMaterial;
      if(wall.material === 1){

      }else if(wall.material === 2){
        material = interiorWallMaterial2;

      }
      cube = cube_bsp.toMesh(material);
      cube.geometry.computeVertexNormals();
    }
    //position wall
    cube.position.setX(wall.posX);
    cube.position.setY(wall.posY);
    cube.position.setZ(wall.posZ);
    //all walls should be perpendicular to the ground
    cube.rotation.x = toRadians(90);
    cube.rotation.y = toRadians(wall.rotY);
    cube.rotation.z = toRadians(wall.rotZ);
    wall.obj = cube
    scene.add(cube);
  }

}

function getCubeVertices(cube){
  var vertices = [];
  var width = cube.geometry.width;
  var height = cube.geometry.height;
  var depth = cube.geometry.depth;
  vertices[0] = [ cube.position.x + width/2, cube.position.y + height/2, cube.position.z + depth/2 ]; 
  vertices[1] = [ cube.position.x + width/2, cube.position.y + height/2, cube.position.z - depth/2 ]; 
  vertices[2] = [ cube.position.x + width/2, cube.position.y - height/2, cube.position.z + depth/2 ];
  vertices[3] = [ cube.position.x + width/2, cube.position.y - height/2, cube.position.z - depth/2 ];
  vertices[4] = [ cube.position.x - width/2, cube.position.y + height/2, cube.position.z + depth/2 ];
  vertices[5] = [ cube.position.x - width/2, cube.position.y + height/2, cube.position.z - depth/2 ];
  vertices[6] = [ cube.position.x - width/2, cube.position.y - height/2, cube.position.z + depth/2 ];
  vertices[7] = [ cube.position.x - width/2, cube.position.y - height/2, cube.position.z - depth/2 ]; 

  for ( var i = 0 ; i < vertices.length ; i ++){
    console.log(" vertex " + i + "    =  (" + vertices[i][0] + ", "  + vertices[i][1] + ", " + vertices[i][2] + ")" ); 
  }
  return vertices;
}


createCubes(floor1cubes);
animate();
