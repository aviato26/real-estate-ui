

import react, { useEffect, useRef, forwardRef, useMemo, useState, Suspense  } from "react";
import { Scene, SRGBColorSpace, PerspectiveCamera } from "three";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useLoader, useFrame, createPortal } from "@react-three/fiber";
import { useFBO } from "@react-three/drei";
import { useProgress } from "@react-three/drei";

import Hero3DScene from "./main/Home/hero-3d-scene";
import SearchPage from './SearchPage/SearchPage';
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

    const { progress } = useProgress();

    const [ time, updateTime ] = useState(0);

    let scale;
    let width = window.innerWidth;
    let height = window.innerHeight;


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

        //console.log(mod.current.loaded)

        state.gl.setRenderTarget(renderTarget);
        state.gl.render(scene2, props.camera.current);

        state.gl.setRenderTarget(renderTarget2);
        //state.gl.render(scene3, props.camera.current);
        state.gl.render(scene3, searchPageCamera.current);                 

        mainMesh.current.material.uniforms.tex.value = renderTarget.texture;
        mainMesh.current.material.uniforms.tex2.value = renderTarget2.texture;        

        planeMesh.current.material.uniforms.spiralSceneTexture.value = renderTarget2.texture;        

        mainMesh.current.material.uniforms.counter.value = mod.current.count;
        mainMesh.current.material.uniforms.l2.value = mod.current.l2;

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
                            counter: { value: 0 },
                            l2: { value: 0. }
                        }
                    }

                    vertexShader="
                        uniform sampler2D tex;
                        uniform sampler2D tex2;          
                        uniform float counter;     
                        uniform float l2;        

                        varying vec2 vuv;

                        void main(){
                            vuv = uv;
                            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
                        }
                    "

                    fragmentShader="
                        uniform sampler2D tex;    
                        uniform sampler2D tex2;                                        
                        uniform float counter;                
                        uniform float l2;                                   

                        varying vec2 vuv;


                        float box( in vec2 p, in vec2 b )
                        {
                            vec2 d = abs(p)-b;
                            return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
                        }
                        

                        void main(){
                            vec2 uv = vuv;
                            uv -= 0.5;
    
                            vec2 uv2 = uv;
                             
                            uv2.x *= .8;
                            uv2.y *= 8.;                            


                            float b1 = step( 0.001, box(uv2 * 5., vec2(1.) ) );
                            float b2 = step( 0.001, box(uv2 * 5., vec2(1.) ) );                              
                    
                            vec3 box1 = vec3(0.2) * (1. - b1);
                            vec3 box2 = vec3(1) * (1. - b2);                             

                            vec4 t = texture(tex, vuv);                            
                            vec4 t2 = texture(tex2, vuv);                                                        

                            vec3 bmix = mix( box2, box1, step(0.1, (uv2.x + 0.3) - ( counter / 100. ) * 0.4 ) );

                            vec4 bmix2 = mix( vec4(bmix, 1.), t, l2 );
                        
                            // Output to screen

                            // this makes a cool ink type of spreading animation
                            //gl_FragColor = mix( vec4(.01 / (col) + (box1 * vec3(.05)) ,1.0), t, step(0.01, length(t.r + uv4) - l2 ) );                            
                            
                            //gl_FragColor = mix( bar, t, 1. );                                                        
                            
                            gl_FragColor = bmix2;                 
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