import { Renderer } from './renderer';
import { Scene } from './scene';
import { FragmentShaderText } from './shaders/fragmentShader';
import { VertexShaderText } from './shaders/vertexShader';
import flakeImageUrl from './assets/flake.png';

export enum ParticleType {
    SNOW
};

export interface ParticleEmitterOptions {
    type: ParticleType;

    debug?: boolean;

    multipliers?: {
        spawning?: {
            rate?: number;
            spawns?: number;
        };
    };
}

export class ParticleEmitter {
    private _canvas: HTMLCanvasElement;
    private _renderer!: Renderer;
    private _scene!: Scene;
    private _options: ParticleEmitterOptions;

    constructor (options: ParticleEmitterOptions) {
        this._options = options;

        this._canvas = document.createElement('canvas');
        this._canvas.style.cssText = `
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
        `;

        document.body.appendChild(this._canvas);

        this.initializeRenderer();
    }

    initializeRenderer () {
        this._renderer = new Renderer(this._canvas);
        this._renderer.addShader(this._renderer.gl.VERTEX_SHADER, VertexShaderText);
        this._renderer.addShader(this._renderer.gl.FRAGMENT_SHADER, FragmentShaderText);
        this._renderer.linkProgram();

        this._scene = new Scene(this._renderer, this._options.debug ?? false);

        const spawnRateMultiplier = this._options.multipliers?.spawning?.rate ?? 1;
        const spawnsMultiplier = this._options.multipliers?.spawning?.spawns ?? 1;

        if (this._options.type === ParticleType.SNOW) {
            const flake = new Image();

            flake.addEventListener('load', () => {
                this._scene.addLayer(3, 100 / spawnRateMultiplier, 3 * spawnsMultiplier, flake);
                this._scene.addLayer(5, 150 / spawnRateMultiplier, 2 * spawnsMultiplier, flake);
                this._scene.addLayer(10, 200 / spawnRateMultiplier, 1 * spawnsMultiplier, flake);
            });
    
            flake.src = flakeImageUrl;
        }
    }

    destroy () {
        this._scene.destroy();
        this._canvas.parentNode?.removeChild(this._canvas);
    }
}