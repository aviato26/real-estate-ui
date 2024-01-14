

import react, { useEffect, useRef, forwardRef, useMemo, useState, Suspense  } from "react";
import { gsap } from "gsap";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, DepthOfField } from "@react-three/postprocessing";
import LoadingComponent  from '/website-loading-component';

import { Perf } from "r3f-perf";

import './home-style.css'

import Hero3DScene from './hero-3d-scene'
import SearchPage from "../../SearchPage/SearchPage";
import ContactPage from "../../ContactPage/contact";

import SearchBar from "../../SearchPage/SearchBar";

import SceneContainer from "../../scene-container";

import { DOF } from "./DepthOfField";
import { OrbitControls, OrthographicCamera } from "@react-three/drei";
import { useGSAP } from "@gsap/react";


const HomePage = () => {

    let width = window.innerWidth;
    let height = window.innerHeight;

    const [scene, updateScene] = useState(false);

    let cam = useRef(0);
    let titleText = useRef();

    const { contextSafe } = useGSAP( { scope: titleText } );

    const textAnime = contextSafe(() => {
        gsap.to( '.hero-title', { opacity: 1 } );
    })

    const textAnime2 = contextSafe(() => {
        gsap.to( '.hero-title span', { opacity: 0, delay: 2, stagger: 0.1 } );        
    })    

    /* 
        <OrthographicCamera makeDefault ref={cam} position={ [0, 0, 0] } left={-1.} right={1.} top={1.} bottom={-1.} near={-1000} far={1000} />
        <SceneContainer camera={cam} textAnime={ textAnime } textAnime2={ textAnime2 } />    
    */

    return(
        <div className="home-hero-section" ref={ titleText } >
            <Canvas resize={ { scroll: false } } scene={{ background: '0x000000'  }} >
                <Perf />
                <OrthographicCamera makeDefault ref={cam} position={ [0, 0, 0] } left={-1.} right={1.} top={1.} bottom={-1.} near={-1000} far={1000} />
                <SceneContainer camera={cam} textAnime={ textAnime } textAnime2={ textAnime2 } />                    
            </Canvas>

            <h1 className="hero-title"><span>SOUTH</span> <span>BAY</span> <span>ESTATES</span></h1>       

            <SearchBar />

            <ContactPage />
            
            {/*<h1 className="hero-title"><span>SUNNY</span> <span>SIDE</span> <span>ESTATES</span></h1>*/}
        </div>
    )
}

export default HomePage;