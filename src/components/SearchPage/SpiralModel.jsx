
import React, { useRef } from "react";
import { useGLTF, PerspectiveCamera, useAnimations } from "@react-three/drei";
import spiralModel from './vs.glb';

export default function Model(props) {

    const group = useRef();
    const { nodes, materials, animations } = useGLTF(spiralModel);
    //const { actions } = useAnimations(animations, group);

    //console.log(props)

    // getting camera position to use in  the volumetric light shader
    props.camera.current = nodes.Camera;

    /*
            <PerspectiveCamera
            name="Camera"
            makeDefault={true}
            far={1000}
            near={0.1}
            fov={22.895}
            position={[0, 5.039, 10.813]}
            rotation={[0, 0, -0.013]}
        />
    */

    return (
    <group ref={group} {...props} dispose={null}>
        <group name="Scene">
        <group name="Spiral" />

        <group name="Plane009" rotation={[-Math.PI / 2, 0, props.time * 0.01 ]} scale={0.3}>
            <mesh
            name="Plane031"
            castShadow
            receiveShadow
            geometry={nodes.Plane031.geometry}
            material={materials["Material.010"]}
            />
            <mesh
            name="Plane031_1"
            castShadow
            receiveShadow
            geometry={nodes.Plane031_1.geometry}
            material={materials["Material.004"]}
            />
            <mesh
            name="Plane031_2"
            castShadow
            receiveShadow
            geometry={nodes.Plane031_2.geometry}
            material={materials["Material.005"]}
            />
            <mesh
            name="Plane031_3"
            castShadow
            receiveShadow
            geometry={nodes.Plane031_3.geometry}
            material={materials["Material.003"]}
            />
            <mesh
            name="Plane031_4"
            castShadow
            receiveShadow
            geometry={nodes.Plane031_4.geometry}
            material={materials["Material.002"]}
            />
            <mesh
            name="Plane031_5"
            castShadow
            receiveShadow
            geometry={nodes.Plane031_5.geometry}
            material={materials["Material.006"]}
            />
            <mesh
            name="Plane031_6"
            castShadow
            receiveShadow
            geometry={nodes.Plane031_6.geometry}
            material={materials["Material.007"]}
            />
            <mesh
            name="Plane031_7"
            castShadow
            receiveShadow
            geometry={nodes.Plane031_7.geometry}
            material={materials["Material.009"]}
            />
            <mesh
            name="Plane031_8"
            castShadow
            receiveShadow
            geometry={nodes.Plane031_8.geometry}
            material={materials["Material.008"]}
            />
            <mesh
            name="Plane031_9"
            castShadow
            receiveShadow
            geometry={nodes.Plane031_9.geometry}
            material={materials["Material.001"]}
            />
        </group>
        <pointLight
            name="Spot"
            intensity={4.}
            decay={2}
            position={[0, 6.228, -0.061]}
            rotation={[-Math.PI / 2, 0, 0]}
        />
        <group name="Spiral2" />
        </group>
    </group>
    );
}

useGLTF.preload(spiralModel);