import {vec3, mat4, quat} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Mesh from './geometry/Mesh';
import ScreenQuad from './geometry/ScreenQuad';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import {readTextFile} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import Turtle from './Turtle';
import ExpansionRule from './ExpansionRule';
import DrawingRule from './DrawingRule';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  angle: 15,
  iterations: 5,
  color: [255, 255, 255]
};

let screenQuad : ScreenQuad;
let time : number = 0.0;

// Import object meshes
let branch : Mesh = new Mesh(readTextFile('../resources/obj/cylinder.obj'), vec3.fromValues(0, 0, 0));
let fruit  : Mesh = new Mesh(readTextFile('../resources/obj/heart.obj'), vec3.fromValues(0, 0, 0));
let leaf   : Mesh;
let pot    : Mesh = new Mesh(readTextFile('../resources/obj/pot.obj'), vec3.fromValues(0, 0, 0));

let bcount : number,
    fcount : number,
    lcount : number;

// Set up expansion rules
let expansionRules : Map<string, ExpansionRule> = new Map();
let er1 : ExpansionRule = new ExpansionRule();
er1.addOutcome('SSF', 0.25);
er1.addOutcome('[+SCF]-CSF', 0.75);
expansionRules.set('F', er1);
/*let er2 : ExpansionRule = new ExpansionRule();
er2.addOutcome('SL');
er2.addOutcome();*/

// Set up drawing rules
let drawingRules : Map<string, DrawingRule> = new Map();
let push : DrawingRule = new DrawingRule();
push.addOutcome(pushTurtle, 1.0);
let pop : DrawingRule = new DrawingRule();
pop.addOutcome(popTurtle, 1.0);
let rotatePos : DrawingRule = new DrawingRule();
rotatePos.addOutcome(rotateTurtlePos, 1.0);
let rotateNeg : DrawingRule = new DrawingRule();
rotateNeg.addOutcome(rotateTurtleNeg, 1.0);
let putfruit : DrawingRule = new DrawingRule();
putfruit.addOutcome(putFruit, 1.0);
let putleaf : DrawingRule = new DrawingRule();
putleaf.addOutcome(putLeaf, 1.0);
let straight : DrawingRule = new DrawingRule();
straight.addOutcome(drawStraight, 1.0);
let curved : DrawingRule = new DrawingRule();
curved.addOutcome(drawStraight, 1.0);

drawingRules.set('+', rotatePos);
drawingRules.set('-', rotateNeg);
drawingRules.set('[', push);
drawingRules.set(']', pop);
drawingRules.set('F', putfruit);
drawingRules.set('L', putleaf);
drawingRules.set('S', straight);
drawingRules.set('C', curved);

// Set up Turtle functions
let turtleStack : Array<Turtle> = [];
let turtle : Turtle = new Turtle(vec3.fromValues(0, -1, 0), vec3.fromValues(0, 1, 0));

function pushTurtle() {
  let temp : Turtle = new Turtle(vec3.fromValues(0, -1, 0), vec3.fromValues(0, 1, 0));
  Object.assign(temp, turtle);
  turtleStack.push(temp);
}

function popTurtle() {
  Object.assign(turtle, turtleStack[turtleStack.length - 1]);
  turtleStack.pop();
}

function drawStraight() {
  turtle.moveForward(2);

  // Calculate transformation
  let transform : mat4 = mat4.create();
  let q : quat = quat.create();
  quat.rotationTo(q, vec3.fromValues(0, 1, 0), turtle.orientation);
  mat4.fromRotationTranslation(transform, q, turtle.position);
  for(let i = 0; i < 4; i++) {
    branchTCol1Array.push(transform[i]);
    branchTCol2Array.push(transform[4 + i]);
    branchTCol3Array.push(transform[8 + i]);
    branchTCol4Array.push(transform[12 + i]);
  }

  branchColorsArray.push(1);
  branchColorsArray.push(1);
  branchColorsArray.push(1);
  branchColorsArray.push(1);
  bcount++;
}

function drawCurved() {
  turtle.moveForward(10);
  bcount++;
}

function rotateTurtlePos() {
  turtle.rotate(2 * controls.angle, controls.angle);
}

function rotateTurtleNeg() {
  turtle.rotate(-controls.angle, -controls.angle);
}

function putFruit() {
  let transform : mat4 = mat4.create();
  mat4.fromTranslation(transform, turtle.position);
  for(let i = 0; i < 4; i++) {
    fruitTCol1Array.push(transform[i]);
    fruitTCol2Array.push(transform[4 + i]);
    fruitTCol3Array.push(transform[8 + i]);
    fruitTCol4Array.push(transform[12 + i]);
  }

  fruitColorsArray.push(controls.color[0] / 255);
  fruitColorsArray.push(controls.color[0] / 255);
  fruitColorsArray.push(controls.color[0] / 255);
  fruitColorsArray.push(1);
  fcount++;
}

function putLeaf() {
  //lcount++;
}

// Set up instanced rendering data arrays.
let branchTCol1Array : Array<number>,
    branchTCol2Array : Array<number>,
    branchTCol3Array : Array<number>,
    branchTCol4Array : Array<number>,
    branchColorsArray : Array<number>;

let fruitTCol1Array : Array<number>,
    fruitTCol2Array : Array<number>,
    fruitTCol3Array : Array<number>,
    fruitTCol4Array : Array<number>,
    fruitColorsArray : Array<number>;

let leafTCol1Array : Array<number>,
    leafTCol2Array : Array<number>,
    leafTCol3Array : Array<number>,
    leafTCol4Array : Array<number>,
    leafColorsArray : Array<number>;

function loadScene() {
  screenQuad = new ScreenQuad();
  screenQuad.create();
  branch.create();

  // Reset mesh counts
  bcount = 0;
  fcount = 0;
  lcount = 0;

  // Reset instanced rendering data arrays.
  branchTCol1Array = [];
  branchTCol2Array = [];
  branchTCol3Array = [];
  branchTCol4Array = [];
  branchColorsArray = [];

  fruitTCol1Array = [];
  fruitTCol2Array = [];
  fruitTCol3Array = [];
  fruitTCol4Array = [];
  fruitColorsArray = [];

  leafTCol1Array = [];
  leafTCol2Array = [];
  leafTCol3Array = [];
  leafTCol4Array = [];
  leafColorsArray = [];

  // Initial grammar
  let str : string = 'F';
  
  // Expand the grammar
  for(let i = 0; i < controls.iterations; i++) {
    let newstr : string = '';
    for(let j = 0; j < str.length; j++) {
      let result = expansionRules.get(str.charAt(j));
      if(result) {
        newstr += result.getOutcome();
      }
    }
    str = newstr;
  }

  console.log(str);

  // Draw based on final grammar
  for(let i = 0; i < str.length; i++) {
    let func = drawingRules.get(str.charAt(i)).getOutcome();
    if(func) {
      func();
    }
  }

  let btCol1: Float32Array = new Float32Array(branchTCol1Array);
  let btCol2: Float32Array = new Float32Array(branchTCol2Array);
  let btCol3: Float32Array = new Float32Array(branchTCol3Array);
  let btCol4: Float32Array = new Float32Array(branchTCol4Array);
  let bcolors: Float32Array = new Float32Array(branchColorsArray);
  branch.setInstanceVBOs(btCol1, btCol2, btCol3, btCol4, bcolors);
  branch.setNumInstances(bcount);

  /*
  let ftCol1: Float32Array = new Float32Array(fruitTCol1Array);
  let ftCol2: Float32Array = new Float32Array(fruitTCol2Array);
  let ftCol3: Float32Array = new Float32Array(fruitTCol3Array);
  let ftCol4: Float32Array = new Float32Array(fruitTCol4Array);
  let fcolors: Float32Array = new Float32Array(fruitColorsArray);
  fruit.setInstanceVBOs(ftCol1, ftCol2, ftCol3, ftCol4, fcolors);
  fruit.setNumInstances(fcount);
  */
/*
  let ltCol1: Float32Array = new Float32Array(leafTCol1Array);
  let ltCol2: Float32Array = new Float32Array(leafTCol2Array);
  let ltCol3: Float32Array = new Float32Array(leafTCol3Array);
  let ltCol4: Float32Array = new Float32Array(leafTCol4Array);
  let lcolors: Float32Array = new Float32Array(leafColorsArray);
  leaf.setInstanceVBOs(ltCol1, ltCol2, ltCol3, ltCol4, lcolors);
  leaf.setNumInstances(lcount);*/

  // Draw the pot
  pot.setInstanceVBOs(new Float32Array([10, 0, 0, 0]),
                      new Float32Array([0, 10, 0, 0]),
                      new Float32Array([0, 0, 10, 0]),
                      new Float32Array([0, 0, 0, 1]),
                      new Float32Array([1, 1, 1, 1]));
  pot.setNumInstances(1);
}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  gui.add(controls, 'angle', 0, 45).step(1);
  gui.add(controls, 'iterations', 0, 12).step(1);
  gui.addColor(controls, 'color');

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(10, 10, 10), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.DEPTH_TEST);

  const instancedShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-frag.glsl')),
  ]);

  const flat = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    instancedShader.setTime(time);
    flat.setTime(time++);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    renderer.render(camera, flat, [screenQuad]);
    renderer.render(camera, instancedShader, [
      branch, fruit, pot
    ]);
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
    flat.setDimensions(window.innerWidth, window.innerHeight);
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();
  flat.setDimensions(window.innerWidth, window.innerHeight);

  // Start the render loop
  tick();
}

main();
