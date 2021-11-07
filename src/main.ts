import { Renderer } from './renderer';
import { Scene } from './scene';
import { FragmentShaderText } from './shaders/fragmentShader';
import { VertexShaderText } from './shaders/vertexShader';
import flakeImageUrl from './assets/flake.png';

const renderer = new Renderer();
renderer.addShader(renderer.gl.VERTEX_SHADER, VertexShaderText);
renderer.addShader(renderer.gl.FRAGMENT_SHADER, FragmentShaderText);
renderer.linkProgram();

const scene = new Scene(renderer);

const flake = new Image();

const spawnRateMultiplier = 10000;
const spawnsMultiplier = 6;

flake.addEventListener('load', () => {
  scene.addLayer(3, 100 / spawnRateMultiplier, 3 * spawnsMultiplier, flake);
  scene.addLayer(5, 150 / spawnRateMultiplier, 2 * spawnsMultiplier, flake);
  scene.addLayer(10, 200 / spawnRateMultiplier, 1 * spawnsMultiplier, flake);
});

flake.src = flakeImageUrl;