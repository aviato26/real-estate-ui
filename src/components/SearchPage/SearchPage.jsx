

import React, { useRef, useEffect, useState } from "react";
//import SpiralModel from "./SpiralModel";
import SpiralModel from "./SpiralModel2";

import SpiralVolumeEffect from "./spiralVolumeEffect";
import { useFrame, useThree } from "@react-three/fiber";
import { Color, PerspectiveCamera } from "three";

const SearchPage = (props) => {

    return(
        <>
            <SpiralVolumeEffect camera={ props.camera } time={props.time} />
            <SpiralModel time={props.time} cam={ props.camera } update={props.update} />                            
        </>            
    );
    
}

export default SearchPage;