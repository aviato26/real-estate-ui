



export const heroVertexShader = `

    uniform sampler2D tex;
    uniform float time;

    varying vec2 vuv;

    void main(){

        vuv = uv;
        vec3 pos = position;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
    }

`;