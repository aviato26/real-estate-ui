

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

    { /* return <Html center> { progress } % loaded </Html> 
            return <Html center>
                <div id='loading-component'>
                    { `${progress.toFixed(0)}%` }
                </div>
            </Html>
      */

            return 

     }

}

export default LoadingComponent;