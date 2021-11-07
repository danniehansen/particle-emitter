import { Particle } from "./particle";
import { Renderer } from "./renderer";
import { Scene } from "./scene";

const MAX_QUADS_PER_BATCH = 1000;
const VERTS_PER_QUAD = 6;
const FLOATS_PER_VERT = 4;

export class Layer {
    private _particles: Particle[] = [];
    private _scene: Scene;
    private _nextSpawn = Date.now();
    private _renderer: Renderer;
    private _size: number;
    private _spawnRate: number;
    private _spawns: number;

    private _quadCount = 0;
    private _verticies = new Float32Array(MAX_QUADS_PER_BATCH * VERTS_PER_QUAD * FLOATS_PER_VERT);
    private _vertsBuffer: WebGLBuffer;

    private _texture: WebGLTexture;

    constructor(scene: Scene, size: number, spawnRate: number, spawns: number, textureImage: HTMLImageElement) {
        this._scene = scene;
        this._size = size;
        this._spawnRate = ((1920 / window.innerWidth) * 100) * (spawnRate / 100);
        this._spawns = spawns;
        this._renderer = this._scene.renderer;

        const buffer = this._scene.renderer.gl.createBuffer();

        if (!buffer) {
            throw new Error('Unable to create webgl buffer');
        }

        this._vertsBuffer = buffer;

        const texture = this.createTexture(textureImage);
        
        if (!texture) {
            throw new Error('Unable to create texture');
        }

        this._texture = texture;
    }

    private createTexture(textureImage: HTMLImageElement) {
        const gl = this._renderer.gl;
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
     
        // Set the parameters so we can render any size image.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
     
        // Upload the image into the texture.
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImage);
        
        return texture;
    }

    addQuad(left: number, top: number, right: number, bottom: number) {
        const offset = this._quadCount * VERTS_PER_QUAD * FLOATS_PER_VERT;
    
        // Triangle #1
        this._verticies[offset] = left;
        this._verticies[offset + 1] = top;
        this._verticies[offset + 2] = 0;
        this._verticies[offset + 3] = 1;

        this._verticies[offset + 4] = right;
        this._verticies[offset + 5] = top;
        this._verticies[offset + 6] = 1;
        this._verticies[offset + 7] = 1;

        this._verticies[offset + 8] = right;
        this._verticies[offset + 9] = bottom;
        this._verticies[offset + 10] = 1;
        this._verticies[offset + 11] = 0;
        
        // Triangle #2
        this._verticies[offset + 12] = left;
        this._verticies[offset + 13] = top;
        this._verticies[offset + 14] = 0;
        this._verticies[offset + 15] = 1;

        this._verticies[offset + 16] = left;
        this._verticies[offset + 17] = bottom;
        this._verticies[offset + 18] = 0;
        this._verticies[offset + 19] = 0;

        this._verticies[offset + 20] = right;
        this._verticies[offset + 21] = bottom;
        this._verticies[offset + 22] = 1;
        this._verticies[offset + 23] = 0;
    
        this._quadCount++;
    
        if (this._quadCount == MAX_QUADS_PER_BATCH) {
            this.flushQuads();
        }
    }

    flushQuads() {
        const gl = this._scene.renderer.gl;
        const program = this._scene.renderer.program;

        const uImageLocation = gl.getUniformLocation(program, 'u_image');
        gl.uniform1i(uImageLocation, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D,this._texture);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this._verticies, gl.STATIC_DRAW);

        const positionAttributeLocation = gl.getAttribLocation(program, 'vertPosition');
        const texCoordAttributeLocation = gl.getAttribLocation(program, 'vertTexCoord');

        gl.vertexAttribPointer(
            positionAttributeLocation,
            2, // number of elements per attribute
            gl.FLOAT,
            false,
            FLOATS_PER_VERT * Float32Array.BYTES_PER_ELEMENT, // size of an individual vertex
            0 // offset from the beginning of an vertex
        );

        gl.vertexAttribPointer(
            texCoordAttributeLocation,
            2, // number of elements per attribute
            gl.FLOAT,
            false,
            FLOATS_PER_VERT * Float32Array.BYTES_PER_ELEMENT, // size of an individual vertex
            2 * Float32Array.BYTES_PER_ELEMENT, // offset from the beginning of an vertex
        );

        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.enableVertexAttribArray(texCoordAttributeLocation);
    
        gl.drawArrays(gl.TRIANGLES, 0, this._quadCount * VERTS_PER_QUAD);

        this._quadCount = 0;
    }

    addParticle(x: number, y: number, width: number, height: number, velocityX: number, velocityY: number) {
        this._particles.push(new Particle(this, x, y, width, height, velocityX, velocityY));
    }

    randomNumber(min: number, max: number) {
        return Math.random() * (max - min + 1) + min
    }

    spawn (num: number) {
        let i = 0;
        while (i < num) {
            this.addParticle(
                this.randomNumber(0, this._renderer.width - this._size),
                -this._size,
                this._size,
                this._size,
                this.randomNumber(-1, 1),
                5
            );
            i++;
        }
    }

    removeParticle (particle: Particle) {
        this._particles.splice(this._particles.indexOf(particle), 1);
    }

    render (delta: number) {
        const now = Date.now();

        if (now >= this._nextSpawn) {
            this._nextSpawn = now + this._spawnRate;
            this.spawn(this._spawns);
        }
        
        let i = 0, len = this._particles.length;
        while (i < len) {
            this._particles[i]?.render(delta);
            i++;
        }

        this.flushQuads();
    }

    get scene () {
        return this._scene;
    }

    get particleCount () {
        return this._particles.length;
    }
}