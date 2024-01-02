

import { useFrame } from "@react-three/fiber";
import React, { useRef, useState } from "react";
import { SphereGeometry, MeshBasicMaterial, Mesh, Color } from "three";

let geo = new SphereGeometry(.1, 20, 20);
let mat = new MeshBasicMaterial( { color: 0xffffff } );
let mesh = new Mesh(geo, mat);

mesh.position.y = 5.5;
mesh.position.z += 1.;


const SpiralVolumeEffect = (props) => {

    const m = useRef(mesh);

    useFrame((state, delta) => {
        //mesh.position.y += Math.sin(state.clock.getElapsedTime()) * 0.1;
    })

    if(props.camera.current){

        return(
            <>
                <mesh ref={m} position={ [ 0, 5.5, 1. ] } >
                    <sphereGeometry args={ [ 0.013, 20, 20 ] } />
                    <meshBasicMaterial color={ 0xffffff } />
                </mesh>

                <mesh position={ [ 0, 5, 1. ] } >
                            <planeGeometry args={ [ 10, 10 ] } />
                            <shaderMaterial 
                                uniforms={{
                                    //lightPos: { value: mesh.position },
                                    lightPos: { value: m.current.position },                                    
                                    cameraPos: { value: props.camera.current.position  }
                                    //cameraPos: { value: { x: 0, y: 0, z: 0 } }                                
                                }}

                                transparent={true}

                                vertexShader="

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

                                "

                                fragmentShader="

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
                    
                                    //return pow( max( 0., l / 150. ), 0.3 );
                                    return pow( max( 0., l / 150. ), 0.5 );                    
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
                    
                                    gl_FragColor = vec4(vec3(scatter + dot(lightDir, cameraToWorldDir) * .5 * exp(-.1 * rand(lightDir.xy))), .7);                                
                                }

                                "
                            />
                        </mesh>

            </>
        );
    }
}

export default SpiralVolumeEffect;