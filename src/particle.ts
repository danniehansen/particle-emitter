import { Layer } from "./layer";
import { Renderer } from "./renderer";

export class Particle {
    private _x: number;
    private _y: number;
    private _width: number;
    private _height: number;
    private _layer: Layer;
    private _velocityX: number;
    private _velocityY: number;
    private _renderer: Renderer;
    private _destroyed = false;
    private _startTime = Date.now();

    constructor(
        layer: Layer,
        x: number,
        y: number,
        width: number,
        height: number,
        velocityX: number,
        velocityY: number
    ) {
        this._x = x;
        this._y = 100;
        this._width = width;
        this._height = height;
        this._layer = layer;
        this._velocityX = velocityX;
        this._velocityY = velocityY;
        this._layer.addQuad(
            this._x,
            this._y,
            this._x + this._width,
            this._y + this._height,
            this._velocityY,
            this._velocityX,
            this._startTime
        );
        // this._renderer = this._layer.scene.renderer;
    }

    /*render (delta: number) {
        if (
            // Exceeds bottom
            this._y >= this._renderer.height ||

            // Outside frame left
            (this._x + this._width) <= 0  ||

            // Outside frame right
            this._x >= this._renderer.width
        ) {
            if (!this._destroyed) {
                this._destroyed = true;
                this._layer.removeParticle(this);
            }
            return;
        }

        const speedDelta = (delta / 100);
        
        this._x += this._velocityX * speedDelta;
        this._y += this._velocityY * speedDelta;

        this._layer.addQuad(
            this._x,
            this._y,
            this._x + this._width,
            this._y + this._height
        );
    }*/
}