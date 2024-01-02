

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { EffectComposer } from 'postprocessing';
import { RenderPass } from 'postprocessing';

import model from './vs.glb';

const scene = new THREE.Scene();
let camera;

//scene.fog = new THREE.FogExp2(0x111111, 0.08);

const renderer = new THREE.WebGLRenderer({
	powerPreference: "high-performance",
	antialias: true,
	//stencil: false,
	//depth: false,
    precision: 'highp'
});

renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;

document.body.appendChild( renderer.domElement );

let lightPlane;
let lightBall;
let allPlanes;
let finalScene;


/*
const composer = new EffectComposer(renderer, {
    frameBufferType: THREE.HalfFloatType
});
*/

const sceneLoader = new GLTFLoader();

sceneLoader.load(model, (m) => {

    m.scene.traverse((obj) => {

        if(obj.name === 'Camera'){
            camera = obj;
        }

        if(obj.name === 'Spot'){
            obj.intensity = .5;
        }

        if(obj.name === 'Plane009'){
            allPlanes = obj;
            obj.children.map(c => {
                //c.material.roughness = 0.2;
                //c.material.metalness = 1;
                //console.log(c.material)                
                c.material.onBeforeCompile = function(shader, renderer) {
                    //console.log(shader, renderer);
                    //console.log(shader.fragmentShader);                    
                }

            });
        }

    });

    const hemi = new THREE.HemisphereLight(0x000000, 0xffffff, 0);

    const geo = new THREE.SphereGeometry(.02, 32, 16);
    const mat = new THREE.MeshBasicMaterial({ color: 0x888888 });
    lightBall = new THREE.Mesh(geo, mat);
    lightBall.position.y += 6;
    //lightBall.position.z += 5;

    let pointLight = new THREE.PointLight(0x555555, 111, 100);
    pointLight.intensity = 0;
    pointLight.position.set(...lightBall.position);

    let lightPlane = lightSource();

    scene.add(m.scene, lightBall, lightPlane, pointLight);

    finalScene = rt();

    let pass1 = new RenderPass(scene, camera);
    let pass2 = new RenderPass(finalScene.scene, finalScene.camera);        

/*
    composer.addPass( pass1 );


    finalScene.mesh.material.uniforms.tex.value = composer.inputBuffer.texture;    

    composer.addPass(pass2);    
    */

    //composer.addPass( new ShaderPass(GammaCorrectionEffect) );

    //composer.addPass( new OutputPass() );


    animate();
});


let lightSource = () => {
    const geo = new THREE.PlaneGeometry(20, 20);
    //const geo = new THREE.BoxGeometry(20, 20, 0);   
    lightPlane = new THREE.ShaderMaterial({ 
        transparent: true,
        uniforms: {
            lightPos: { value: null },
            cameraPos: { value: null }
        },

        vertexShader: `

            uniform vec3 lightPos;
            uniform vec3 cameraPos;

            varying vec2 vuv;
            varying vec3 vPos;
            varying vec3 vNormal;
            varying vec3 wPos;

            void main(){
                vuv = uv;
                vPos = position;
                vNormal = normal;
                wPos = (modelMatrix * vec4(position, 1.)).xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
            }
        `,

        fragmentShader: `

            uniform vec3 lightPos;
            uniform vec3 cameraPos;

            varying vec2 vuv;
            varying vec3 vPos;            
            varying vec3 vNormal;
            varying vec3 wPos;

            float rand(vec2 co){
                return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
            }

            float getScatter(vec3 camPos, vec3 dir, vec3 lightPos, float d){
                // light to ray origin
                vec3 q = camPos - lightPos;

                // coefficients
                float b = dot(dir, q);
                float c = dot(q, q);

                // evaluate integral
                float t = c - b * b;
                float s = 1. / sqrt(max(0.001, t));
                float l = s * (atan(  (d + b) * s) - atan(b * s));

                return pow( max( 0., l / 150. ), 0.3 );

            }


            vec4 fromLinear(vec4 linearRGB) {
                bvec3 cutoff = lessThan(linearRGB.rgb, vec3(0.0031308));
                vec3 higher = vec3(1.055)*pow(linearRGB.rgb, vec3(1.0/2.4)) - vec3(0.055);
                vec3 lower = linearRGB.rgb * vec3(12.92);
            
                return vec4(mix(higher, lower, cutoff), linearRGB.a);
            }


            void main(){
                vec2 uv = vuv;

                vec3 cameraToWorld = wPos - cameraPos;
                vec3 cameraToWorldDir = normalize(cameraToWorld);
                float cameraToWorldDistance = length(cameraToWorld);

                vec3 lightDir = normalize(lightPos -  wPos);
                float diff = max(0., dot(vNormal, lightDir));
                
                float dist = length(lightPos - vPos) * 1.;

                float scatter = getScatter(cameraPos, cameraToWorldDir, lightPos, cameraToWorldDistance);

                //gl_FragColor = vec4(diff + dist, 0, 0,1);
                //gl_FragColor = vec4(vec3(scatter * exp(-.1 * rand(lightDir.xy))), .96);                

                vec4 color = vec4(vec3(scatter + dot(lightDir, cameraToWorldDir) * .5 * exp(-.1 * rand(lightDir.xy))), .5);
                vec4 finalColor = fromLinear( color );

                gl_FragColor = vec4(vec3(scatter + dot(lightDir, cameraToWorldDir) * .5 * exp(-.1 * rand(lightDir.xy))), .5);                                
                //gl_FragColor = finalColor;
            }
        `

     });

    const mesh = new THREE.Mesh(geo, lightPlane);

    //mesh.position.z += 4;

    return mesh;
}

let clock = new THREE.Clock();

let rt = () => {
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
    const geo = new THREE.PlaneGeometry(2, 2);
    const mat = new THREE.ShaderMaterial({
        uniforms: {
            tex: { value: null }
        },

        vertexShader: `
            uniform sampler2D tex;
            varying vec2 vuv;

            void main(){
                vuv = uv;

                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);

            }

        `,

        fragmentShader: `

        uniform sampler2D tex;
        varying vec2 vuv;

        void main(){

            vec2 uv = vuv;

            vec4 t = texture(tex, uv);

            //gl_FragColor = vec4(uv, 0, 1);
            gl_FragColor = t;            
        }
        

        `

    });
    const mesh = new THREE.Mesh(geo, mat);
    const renderTarget = new THREE.RenderTarget(window.innerWidth, window.innerHeight, {
        format: THREE.RGBAFormat,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        colorSpace: THREE.SRGBColorSpace,
        //type: THREE.HalfFloatType
    });

    mesh.position.z += 1;
    camera.position.z += 2;
    
    scene.add(mesh);    


    return {
        scene: scene,
        camera: camera,
        mesh: mesh,
        rt: renderTarget
    }
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    //camera.aspect = window.innerHeight / window.innerWidth;    
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
});


function animate() {
	requestAnimationFrame( animate );
    camera.fov = 50;
    camera.aspect = window.innerWidth / window.innerHeight;
    //camera.aspect = window.innerHeight / window.innerWidth;    
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );


    lightBall.position.y -= Math.sin(clock.getElapsedTime() - lightBall.position.y) * 0.001;

    allPlanes.rotation.z = clock.getElapsedTime() * 0.05;

    lightPlane.uniforms.lightPos.value = lightBall.position;
    lightPlane.uniforms.cameraPos.value = camera.position;    
/*
    renderer.setRenderTarget(finalScene.rt);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);

    //finalScene.rt.texture.colorSpace = THREE.SRGBColorSpace;
    finalScene.mesh.material.uniforms.tex.value = finalScene.rt.texture;
*/
    //composer.render();

    renderer.render(scene, camera);
	
    //renderer.render( scene, finalScene.camera );
	//renderer.render( finalScene.scene, finalScene.camera );
}

//animate();