

import React, { forwardRef, useMemo } from 'react'
import { DepthOfFieldEffect } from 'postprocessing'

export const DOF = forwardRef(({ cam }, ref) => {
  if(cam.current.current){
    const effect = useMemo(() => new DepthOfFieldEffect(cam.current.current, {
        focalLength: 20.,
        worldFocusDistance: 14.1,
        focusDistance: .005,
        focusRange: .002,
        bokehScale: 4
      }), [cam])
      return <primitive ref={ref} object={effect} dispose={null} />
  }
})