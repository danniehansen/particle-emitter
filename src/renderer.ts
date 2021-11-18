export class Renderer {
    private _canvas: HTMLCanvasElement;
    private _gl: WebGL2RenderingContext;
    private _shaders: WebGLShader[] = [];
    private _program: WebGLProgram;
    private _resolutionUniformLocation: WebGLUniformLocation | null = null;
    private _timeUniformLocation: WebGLUniformLocation | null = null;

    public width = 0;
    public height = 0;

    constructor(canvas: HTMLCanvasElement) {
        this._canvas = canvas;

        const gl = this._canvas.getContext('webgl2');

        if (!gl) {
            throw new Error('WebGL unavailable');
        }

        this._gl = gl;

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

        const program = this._gl.createProgram();

        if (!program) {
            throw new Error('Unable to create gl program');
        }

        this._program = program;

        this.resize();

        window.addEventListener('resize', () => {
            this.resize();
        });
    }

    resize () {
        this.width = this._canvas.width = window.innerWidth;
        this.height = this._canvas.height = window.innerHeight;

        this._gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    }

    prepareRender () {
        this.clear();

        this._gl.useProgram(this._program);

        this._gl.uniform2f(this._resolutionUniformLocation, this._canvas.width, this._canvas.height);
        this._gl.uniform1f(this._timeUniformLocation, parseFloat(Date.now().toFixed(2)));
    }

    clear () {
        this._gl.clearColor(0, 0, 0, 0);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
    }

    addShader (shaderType: GLenum, source: string) {
        const shader = this._gl.createShader(shaderType);

        if (!shader) {
            throw new Error('Unable to create shader :(');
        }

        this._gl.shaderSource(shader, source);
        this._gl.compileShader(shader);

        if (!this._gl.getShaderParameter(shader, this._gl.COMPILE_STATUS)) {
            console.error(this._gl.getShaderInfoLog(shader));
            throw new Error('Unable to compile shader. See console for more information');
        }

        this._gl.attachShader(this._program, shader);
        
        this._shaders.push(shader);
    }

    linkProgram () {
        this._gl.linkProgram(this._program);

        if (!this._gl.getProgramParameter(this._program, this._gl.LINK_STATUS)) {
            console.error(this._gl.getProgramInfoLog(this._program));
            throw new Error('Unable to link gl program. See console for more information');
        }

        // Only enable in debug more
        this._gl.validateProgram(this._program);

        if (!this._gl.getProgramParameter(this._program, this._gl.VALIDATE_STATUS)) {
            console.error(this._gl.getProgramInfoLog(this._program));
            throw new Error('Unable to validate program. See console for more information');
        }

        this._resolutionUniformLocation = this._gl.getUniformLocation(this._program, 'u_resolution');
        this._timeUniformLocation = this._gl.getUniformLocation(this._program, 'u_time');
    }

    get gl () {
        return this._gl;
    }

    get program () {
        return this._program;
    }
}