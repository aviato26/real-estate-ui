

import React, { useEffect, useState, useRef } from "react";
import data from '/Users/sd/Desktop/real-estate-ui/src/data/sample1.js';

import './search-page.css'
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import { ScrollToPlugin } from "gsap/all";
import { useFrame } from "@react-three/fiber";

const SearchBar = (props) => {
        
    let ims = [];
    for(let i = 1; i < 11; i++){                         
        // need to use minified images or chome will have huge image decode time and jank the interface
        ims.push( <img key={i} src={`/images/mini-images/img-${i + 1}.jpeg`} decoding="async" loading="lazy" style={ { width: '100%', height: '100%' } } /> )
        data.properties.image = ims[i];
    }
    

    const [ query, updateQuery ] = useState('Los Angeles');
    const [ propertyData, updatePropertyData ] = useState(data.properties);

    const [ images, updateImages ] = useState(ims);
    const rf = useRef();
    const searchBar = useRef();
    //rf.current.initialRender = false;

    gsap.registerPlugin( ScrollTrigger, ScrollToPlugin )

    // search bar reveal, animation state needs to be controlled by a parent component to trigger once the model is loaded
    gsap.to('#search-bar', { opacity: 1, delay: 12 });

    // animation for the real estate image reveal once user makes request
    const tm = gsap.timeline({ });

    let dummyObj = { start: 0 }
    tm.to(dummyObj, { start: 100, onUpdate: () => {
        searchBar.current.style.background = `linear-gradient( to right, rgba(255, 255, 255, .3), rgba(255, 255, 255, .3) ${dummyObj.start}%, transparent, transparent 0% )`
    }, ease: "expo.inOut", duration: 2 })    

    tm.to(window, { duration: 1, scrollTo: "#house-items", ease: "expo.inOut", onComplete: () => {
        searchBar.current.style.background = `linear-gradient( to right, rgba(100, 1, 1, 0.1), rgba(1, 1, 1, 0.1) ${0}%, transparent, transparent 0% )`
    }  });                

    tm.to('.property', { opacity: 0, }, '' )
    tm.to('.property', { opacity: 1, duration: 1, stagger: 0.1 } )
    tm.pause();        

    let a = (q) => {

        rf.current.initialRender = true;

        let b = setTimeout(() => {
            
            updatePropertyData((d) => {

              d = data.properties.map((c, i) => {
                    if(i < 12){
                        c.image = images[Math.floor( Math.random() ) + 1 + i]
                    }

                    c.city = query;                    
                    return c;
                });

                return d;
                                
            })

            tm.play();                

        } 
        , 1000);

    }

    useEffect(() => {
        
        if(rf.current.initialRender){
            a();
        }

        // state to skip initial render
        rf.current.initialRender = true;
    }, [ query ])


    // trying to load images async before the user scrolls to them to try and stop jank
    useEffect(() => {
        
        updatePropertyData(() => {

        let d = data.properties.map((c, i) => {
                if(i < 11){
                    c.image = <img key={i} src={`/images/mini-images/img-${i + 1}.jpeg`} decoding="async" loading="lazy" style={ { width: '100%', height: '100%' } } />
                }

                c.city = query;                    
                return c;
            });

            return d;
        })

    }, [])


    const fn = () => {
        updateQuery(() => rf.current.value);              
    }

    return(
        <div>
            <div id="search-bar" ref={searchBar} >
                <input ref={rf} placeholder={query} />
                <button onClick={fn} >Search</button>
            </div>
            <div id='house-items'>
                <h2 className='house-items-title'>Estates</h2>
                <div id="properties-container">
                    {
                        propertyData.map((properties, index) => {
                            if(index < 9){

                                return <div className="property" key={index}>

                                    <div id="image-container">
                                        { properties.image }
                                    </div>
                                
                                    <h3>{properties.price}</h3>
                                    <p>{properties.bedrooms} Bedrooms | {properties.bathrooms} Bathrooms | {properties.sq_ft} sqft</p>
                                    <p>{properties.address}, { properties.city }, { properties.zip }</p>
                                </div>
                            }
                        })
                    }
                </div>
            </div>
        </div>
    );

}

export default SearchBar;