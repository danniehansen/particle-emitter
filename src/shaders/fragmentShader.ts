export const FragmentShaderText = `
    precision mediump float;

    varying vec2 fragTexCoord;

    uniform sampler2D u_texture;

    void main() {
        gl_FragColor = texture2D(u_texture, fragTexCoord);
        gl_FragColor.rgb *= gl_FragColor.a;
        //gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
`;