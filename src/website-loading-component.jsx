

import React, { useState } from "react";
import { Html, useProgress } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";


const LoadingComponent = (scene) => {

    const { progress } = useProgress();
    const [counter, updateCounter ] = useState(0);

    useFrame(() => {
        if(counter < progress){
            updateCounter((c) => c + 0.8)
        }
    })

}

export default LoadingComponent;