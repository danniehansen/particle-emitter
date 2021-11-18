import { Layer } from "./layer";
import { Renderer } from "./renderer";

export class Scene {
    private _renderer: Renderer;
    private _layers: Layer[] = [];
    private _lastRenderTime = Date.now();
    private _fps = 0;
    private _debugFpsElement: HTMLSpanElement | null = null;
    private _debugParticleCountElement: HTMLSpanElement | null = null;
    private _debugContainer?: HTMLDivElement;
    private _nextFpsRender = Date.now() + 1000;
    private _destroyed = false;
    private _debug: boolean;

    constructor(renderer: Renderer, debug?: boolean) {
        this._debug = debug ?? false;
        this._renderer = renderer;

        if (this._debug) {
            this.initializeDebugPanel();
        }

        this.render = this.render.bind(this);
        this.render();
    }

    private initializeDebugPanel () {
        this._debugContainer = document.createElement('div');
        this._debugContainer.style.cssText = `
            position: absolute;
            left: 0;
            top: 0;
            width: 150px;
            height: 60px;
            text-align: center;
            line-height: 30px;
            color: #fff;
            background-color: rgba(0, 0, 0, 0.5);
        `;

        this._debugContainer.innerHTML = `
            FPS: <span>0</span><br />
            Particles: <span>0</span>
        `;

        this._debugFpsElement = this._debugContainer.querySelectorAll('span')[0];
        this._debugParticleCountElement = this._debugContainer.querySelectorAll('span')[1];

        document.body.appendChild(this._debugContainer);
    }

    addLayer(size: number, spawnRate: number, spawns: number, textureImage: HTMLImageElement) {
        const layer = new Layer(this, size, spawnRate, spawns, textureImage);
        this._layers.push(layer);
        return layer;
    }

    render() {
        if (this._destroyed) {
            return;
        }

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

        if (
            this._debug &&
            this._debugFpsElement &&
            this._debugParticleCountElement &&
            this._lastRenderTime >= this._nextFpsRender
        ) {
            this._nextFpsRender = this._lastRenderTime + 1000;
            this._debugFpsElement.innerText = this._fps.toFixed(0);

            this._debugParticleCountElement.innerText = this._layers.map((layer) => layer.particleCount).reduce((carry, a) => carry + a, 0).toString();
        }
    }

    destroy () {
        if (this._debugContainer) {
            this._debugContainer.parentNode?.removeChild(this._debugContainer);
            this._debugContainer = undefined;
            this._debugFpsElement = null;
            this._debugParticleCountElement = null;
        }

        this._destroyed = true;
    }

    get renderer () {
        return this._renderer;
    }
}