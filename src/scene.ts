import { Layer } from "./layer";
import { Renderer } from "./renderer";

export class Scene {
    private _renderer: Renderer;
    private _layers: Layer[] = [];
    private _lastRenderTime = Date.now();
    private _fps = 0;
    private _fpsElement: HTMLSpanElement;
    private _particleCountElement: HTMLSpanElement;
    private _nextFpsRender = Date.now() + 1000;

    constructor(renderer: Renderer) {
        this._renderer = renderer;

        const fpsElement = document.querySelector<HTMLSpanElement>('#fps');
        
        if (!fpsElement) {
            throw new Error('FPS meter not found.');
        }

        this._fpsElement = fpsElement;

        const particleCountElement = document.querySelector<HTMLSpanElement>('#particles');
        
        if (!particleCountElement) {
            throw new Error('Particle count not found.');
        }

        this._particleCountElement = particleCountElement;

        this.render = this.render.bind(this);
        this.render();
    }

    addLayer(size: number, spawnRate: number, spawns: number, textureImage: HTMLImageElement) {
        const layer = new Layer(this, size, spawnRate, spawns, textureImage);
        this._layers.push(layer);
        return layer;
    }

    render() {
        const now = Date.now();
        const delta = now - this._lastRenderTime;
        this._lastRenderTime = now;

        this._fps = 1 / (delta / 1000);

        requestAnimationFrame(this.render);

        this._renderer.prepareRender();

        let i = 0, len = this._layers.length;
        while (i < len) {
            this._layers[i].render(delta);
            i++;
        }

        if (this._lastRenderTime >= this._nextFpsRender) {
            this._nextFpsRender = this._lastRenderTime + 1000;
            this._fpsElement.innerText = this._fps.toFixed(0);

            this._particleCountElement.innerText = this._layers.map((layer) => layer.particleCount).reduce((carry, a) => carry + a, 0).toString();
        }
    }

    get renderer () {
        return this._renderer;
    }
}