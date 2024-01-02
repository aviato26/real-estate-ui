

import react, { useMemo, useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { useLoader, useFrame } from "@react-three/fiber";
//import HeroImg from '/images/r-architecture-2gDwlIim3Uw-unsplash.jpg'
//import HeroImg from '/images/hero-image.jpg'
//import ColorHeroImg from '/images/kitchen.jpg'
import ColorHeroImg from '/images/color-img.png'
import HeroImg from '/images/black-white-hero-image.jpg'
import './home-style.css'

import { TextureLoader, Vector2 } from "three";

import { heroVertexShader } from "../../../shaders/home-page/hero-vertex";
import { heroFragmentShader } from "../../../shaders/home-page/hero-fragment";



const Hero3DScene = (props) => {

    const mesh = useRef();
    const heroImage = useLoader(TextureLoader, HeroImg);
    const colorHeroImage = useLoader(TextureLoader, ColorHeroImg )

    let scale;

    let width = window.innerWidth;
    let height = window.innerHeight;

    if( (width / height) < 1. ){
        scale = [ (1. / 2721) * 4328 , 1, 1]
    } else{
        scale = [1, 1, 1]
    }

    const uniforms = useMemo(() => ({
        tex: {
            value: heroImage
        },

        colorTex: {
            value: colorHeroImage
        },

        spiralSceneTexture: {
            value: null
        },

        time: {
            value: 0
        },

        switch2: {
            value: 0
        }

    }));

    useEffect(() => {
        props.getMesh.current = mesh.current;
    }, [] )

    return(
                //<mesh ref={mesh}>
        <mesh ref={mesh} scale={ scale } >
            <planeGeometry args={[ 2, 2 ]} />
            <shaderMaterial
                vertexShader={heroVertexShader}
                fragmentShader={heroFragmentShader}                                
                uniforms={uniforms}
            />
        </mesh>
    )
}

export default Hero3DScene;