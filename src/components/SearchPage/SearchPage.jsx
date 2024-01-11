

import React, { useRef, useEffect, useState } from "react";
//import SpiralModel from "./SpiralModel";
//import SpiralModel from "./SpiralModel2";
import SpiralModel from "./SpiralModel3";


import SpiralVolumeEffect from "./spiralVolumeEffect";

const SearchPage = (props) => {

    return(
        <>
            <SpiralModel time={props.time} cam={ props.camera } update={props.update} />                            
            <SpiralVolumeEffect camera={ props.camera } time={props.time} />                        
        </>            
    );
    
}

export default SearchPage;