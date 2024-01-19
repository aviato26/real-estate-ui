

import react, { useEffect, useRef, forwardRef, useMemo, useState, Suspense  } from "react";
import { Scene, SRGBColorSpace, PerspectiveCamera } from "three";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useLoader, useFrame, createPortal } from "@react-three/fiber";
import { TextureLoader, CubeTextureLoader } from "three";
import { useFBO } from "@react-three/drei";
import { useProgress } from "@react-three/drei";

import Hero3DScene from "./main/Home/hero-3d-scene";
import SearchPage from './SearchPage/SearchPage';
import { Contact3DModel } from "./ContactPage/contact-3d-model";

import * as THREE from 'three'


const SceneContainer = (props) => {

    const planeMesh = useRef();
    const mainMesh = useRef();
    const searchPageCamera = useRef();


    const mod = useRef({});
    mod.current.count = 0;
    mod.current.loaded = false;
    mod.current.l2 = 0.;
    mod.current.tileTransition1 = -.5;
    mod.current.tileTransition2 = 1;    
    mod.current.spiralAnimation = {};
    mod.current.contactTransition = 1;



    useEffect(() => {
        // animation to switch from spiral image scene to contact scene
        const contactTransition = gsap.timeline();
        contactTransition.to(mod.current, { contactTransition: 0, duration: 1 } );
        contactTransition.pause();

        const contactSection = document.querySelector('#contact-container');
        const contactObserver = new IntersectionObserver((e) => {
            if(mod.current.contactTransition > 0 && e[0].isIntersecting){
                    contactTransition.play();
                } else{
                    contactTransition.reverse();    
                }
        });

        contactObserver.observe(contactSection);

    }, [])

    const { progress } = useProgress();

    const [ time, updateTime ] = useState(0);

    let scale;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const res = new THREE.Vector2(width, height);

    //const flashLightTex = useLoader(TextureLoader, '/images/flash-light-image.png');
    const flashLightTex = useLoader(TextureLoader, '/images/color.png');    
    //const flashLightNormalTex = useLoader(TextureLoader, '/images/norm2.png');
    const flashLightNormalTex = useLoader(TextureLoader, '/images/normal.png');   

    const [ flashLightCubeTex ] = useLoader(CubeTextureLoader, [ [
        '/images/cube-for-flash-light-effect/nx.jpg',
        '/images/cube-for-flash-light-effect/ny.jpg',
        '/images/cube-for-flash-light-effect/nz.jpg',
        '/images/cube-for-flash-light-effect/px.jpg',
        '/images/cube-for-flash-light-effect/py.jpg',
        '/images/cube-for-flash-light-effect/pz.jpg'
    ] ]);

    // setting the window width and height bring fps back up to 60, with out the render target texture size goes to 4k
    // possibly from the hero images which are 4k, going to have to lower resolution
    const renderTarget = useFBO(width, height, {});
    const renderTarget2 = useFBO(width, height, {});


    //const renderTarget = useFBO();
    //const renderTarget2 = useFBO();
    

    const scene2 = new Scene();
    scene2.background = '0x000000';

    const scene3 = new Scene();
    scene3.background = '0x000000';   

    const contactScene = new Scene();
    contactScene.background = '0x000000';       

    let testCam = new PerspectiveCamera(5, width / height, 1, 1000);
    testCam.position.z = 5;

    
    if( (width / height) < 1. ){
        scale = [ (1. / 2721) * 4328 , 1, 1]
    } else{
        scale = [1, 1, 1]
    }
    

    const { contextSafe } = useGSAP({ scope: mod }); // we can pass in a config object as the 1st parameter to make scoping simple


    // start up animation, this includes loading screen and the tile animation to the search page
    const transition = contextSafe(() => {
        const t = gsap.timeline();
        t.to(mod.current, { l2: 1, duration: .5 });
        t.add(props.textAnime);
        t.add(props.textAnime2);                
        t.to(mod.current, { tileTransition1: 2.5, duration: 2.5, delay: 2 });
        t.to(mod.current, { tileTransition2: 0 });        
        t.to(mod.current, { tileTransition1: -.8, duration: 2.5 });        
        
        t.to(mod.current, { onStart: () => {
            /*
                this function is passed up from the child component Searchpage
                and is called once the tile animation is done, this triggers the spiral
                picture animation
            */
            mod.current.spiralAnimation.s1((c) => c = true)
        } }, '-=1.5' )
        
    });


    useFrame((state, time) => {   
        
        planeMesh.current.material.uniforms.time.value = mod.current.tileTransition1;
        planeMesh.current.material.uniforms.switch2.value = mod.current.tileTransition2;

        
        if(mod.current.count < progress.toFixed(0)){
            mod.current.count += 1.;
        } else {
            if(!mod.current.loaded){
                transition();
                mod.current.loaded = true;
            }
        } 

        state.gl.setRenderTarget(renderTarget);
        state.gl.render(scene2, props.camera.current);

        state.gl.setRenderTarget(renderTarget2);
        //state.gl.render(scene3, props.camera.current);
        state.gl.render(scene3, searchPageCamera.current);                 

        mainMesh.current.material.uniforms.tex.value = renderTarget.texture;
        mainMesh.current.material.uniforms.tex2.value = renderTarget2.texture;        

        mainMesh.current.material.uniforms.mousePos.value = props.mousePos.current;

        //console.log(contactPage)

        planeMesh.current.material.uniforms.spiralSceneTexture.value = renderTarget2.texture;        

        mainMesh.current.material.uniforms.counter.value = mod.current.count;
        mainMesh.current.material.uniforms.l2.value = mod.current.l2;
        mainMesh.current.material.uniforms.contactTransition.value = mod.current.contactTransition;        

        state.gl.setRenderTarget(null);        
        
    })


    return(
        <>
            <mesh ref={mainMesh} >
                <planeGeometry args={ [2, 2] } />
                <shaderMaterial 
                    uniforms={
                        {
                            tex: { value: null},
                            tex2: { value: null },
                            tex3: { value: null },
                            res: { value: res },
                            flashLightTex: { value: flashLightTex },
                            flashLightNormal: { value: flashLightNormalTex },
                            cubeMap: { value: flashLightCubeTex },                            
                            mousePos: { value: props.mousePos.current },
                            counter: { value: 0 },
                            l2: { value: 0. },
                            contactTransition: { value: mod.current.contactTransition }
                        }
                    }

                    vertexShader="
                        uniform sampler2D tex;
                        uniform sampler2D tex2;          
                        uniform float counter;     
                        uniform sampler2D flashLightTex;
                        uniform sampler2D flashLightNormal;      
                        uniform samplerCube cubeMap;                                          
                        uniform vec2 mousePos;
                        uniform float l2;        
                        uniform vec2 res;
                        uniform float contactTransition;

                        varying vec2 vuv;
                        varying vec3 vNormal;                        
                        varying mat4 vModelMatrix;                        

                        void main(){
                            vuv = uv;
                            vNormal = normal;
                            vModelMatrix = modelMatrix;                     
                            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
                        }
                    "

                    fragmentShader="
                        uniform sampler2D tex;    
                        uniform sampler2D tex2;                                        
                        uniform float counter;               
                        uniform sampler2D flashLightTex;  
                        uniform sampler2D flashLightNormal;  
                        uniform samplerCube cubeMap;                                                                              
                        uniform vec2 mousePos;                                       
                        uniform float l2;                
                        uniform vec2 res;                         
                        uniform float contactTransition;                                          

                        varying vec2 vuv;
                        varying vec3 vNormal;                        
                        varying mat4 vModelMatrix;                        

                        float box( in vec2 p, in vec2 b )
                        {
                            vec2 d = abs(p)-b;
                            return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
                        }
                        
                        mat4 mx(){
                            return mat4(
                                -1.3435885626300603e-7 ,-2.220446049250313e-16, 1.0000001343588563, 0.,
                                1.0000001343588563, -1.3435885626300603e-7, 0., 0.,
                                0., 1.0000001343588563, -1.3435885604096143e-7, 0.,
                                1.0723499059677124, 0., 0., 1.
                            );
                        }

                        void main(){
                            //vec2 uv = (gl_FragCoord.xy - .5 * res.xy) / res.y;                            
                            vec2 uv = vuv;                            
                            uv -= 0.5;
                            //uv.x *= res.x / res.y;                            
    
                            vec2 uv2 = uv;
                            //uv2 -= 0.5;
                            vec2 mouse = mousePos;
                             
                            uv2.x *= .8;
                            uv2.y *= 8.;                     
                            
                            



                            vec3 normals = vNormal;
                            vec2 vvx2 = vuv;
                            vvx2.x = 1. - vvx2.x;

                            vec4 nm = texture(flashLightNormal, vvx2);
                            //vec4 t = texture(flashLightTex, vuv);                        
                            vec2 uvLight = vuv;
    
    
                            uvLight.x -= mouse.x;
                            uvLight.y += mouse.y;
    
                            vec2 ll = vec2( length(uvLight - 0.5) * 1.3 );
    
                            //ll = 1. / ll;
                            //ll *= 0.008;

                            ll = 1. - ll;
                            ll *= 0.05;
                            
                            vec3 lightVec = normalize( vec3( vec2( ll ), -.5)) + cross( vec3( vec2(ll), 0.0), vec3( mouse.x - uvLight.x, mouse.y - uvLight.y, 0.5) );                        
                                
                            
                            vec3 normalVec = normalize((mx() * (nm * 1. + vec4(vNormal, 1.))).xyz );                        

                            float lightIntensity = max(0., dot(lightVec, normalVec)) + .0;        
    
    
    
                            vec3 ldir = lightVec;                        
                            float dp = max(0., dot(lightVec, normalVec));
    
    
                            vec2 vvx = vuv;
                            vvx.x = 1. - vvx.x;

                            vec3 dif = vec3(dp * 12.) * texture(flashLightTex, vvx).xyz;
    
                            vec3 viewDir = vec3( vec2( dot( vec2(0.5), ldir.xy ) ), .0);
    
                            vec3 r = normalize( reflect(-ldir, normalVec) );
                            float pvalue = max(0., dot(viewDir, r) );
                            pvalue = pow( pvalue, 128. );
    
                            vec3 specular = vec3(pvalue);
    
                            vec3 cbCoord = normalize( reflect(-viewDir, normalVec) );
                            vec3 cbSample = textureCube(cubeMap, cbCoord).xyz;
    
                            //specular += cbSample * .1;
    
                            vec3 col = lightIntensity + dif * 12. + specular;
    
    
                            //gl_FragColor = texture(flashLightNormal, vuv);
                            
                            //gl_FragColor = mix(vec4(1, 0, 0, 1), vec4(col, 1.), contactTransition);








                            //float b1 = step( 0.001, box(uv2 * 5., vec2(1.) ) );
                            //float b2 = step( 0.001, box(uv2 * 5., vec2(1.) ) );                              
                            float b1 = step( 0.001, box(uv2 * 5., vec2(1.) ) );
                            float b2 = step( 0.001, box(uv2 * 5., vec2(1.) ) );                                                          
                    
                            vec3 box1 = vec3(0.2) * (1. - b1);
                            vec3 box2 = vec3(1) * (1. - b2);                             

                            vec4 t = texture(tex, uv + 0.5);                            
                            vec4 t2 = texture(tex2, uv + 0.5);                                                        


                            //vec3 bmix = mix( box2, box1, step(0.1, (uv2.x + 0.3) - ( counter / 100. ) * 0.4 ) );
                            //vec4 bmix2 = mix( vec4(bmix, 1.), t, l2 );

                            vec3 bmix = mix( box2, box1, step(0.1, (uv2.x + 0.3) - ( counter / 100. ) * 0.4 ) );
                            vec4 bmix2 = mix( vec4(bmix, 1.), t, l2 );                            
                      
                            // Output to screen

                            // this makes a cool ink type of spreading animation
                            //gl_FragColor = mix( vec4(.01 / (col) + (box1 * vec3(.05)) ,1.0), t, step(0.01, length(t.r + uv4) - l2 ) );                            
                            
                            //gl_FragColor = mix( bar, t, 1. );                                                        
                            
                            //gl_FragColor = bmix2;                 
                            
                            gl_FragColor = mix(vec4(col, 1.), bmix2, contactTransition);                                             
                        }



                    "

                    
                />
            </mesh>            

            { 

                createPortal(
                    <Hero3DScene getMesh={planeMesh} />, scene2
                )
            }

            <Suspense fallback={null}>
                {
                    createPortal(
                        <SearchPage camera={searchPageCamera} camState={searchPageCamera} time={time} update={mod.current.spiralAnimation} />, scene3
                    ) 
                }
            </Suspense>            

        </>
    );
}

export default SceneContainer;