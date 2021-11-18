export const VertexShaderText = `
    precision mediump float;

    uniform float u_time;

    attribute vec4 vertPosition;
    attribute vec2 vertTexCoord;
    attribute vec2 velocity;
    attribute float timeAdded;

    varying vec2 fragTexCoord;

    uniform vec2 u_resolution;

    void main() {
        float delta = u_time - timeAdded;
        float speedDelta = delta / 100.0;

        vec2 position = vec2(
            vertPosition.x + (velocity.x * speedDelta),
            vertPosition.y + (velocity.y * speedDelta)
        );

        // convert the position from pixels to 0.0 to 1.0
        vec2 zeroToOne = position.xy / u_resolution;

        // convert from 0->1 to 0->2
        vec2 zeroToTwo = zeroToOne * 2.0;

        // convert from 0->2 to -1->+1 (clipspace)
        vec2 clipSpace = zeroToTwo - 1.0;

        gl_Position = vec4(clipSpace.x, -clipSpace.y, 0, 1);

        fragTexCoord = vertTexCoord;
    }
`;