


export const heroFragmentShader = `
/*
    //#define F vec3(.2126, .7152, .0722)
    #define F vec3(.9, .1, 1.)

    uniform sampler2D tex;
    uniform sampler2D colorTex;
    uniform float time;
    uniform float switch2;

    varying vec2 vuv;


    float sdBox( in vec2 p, in vec2 b )
    {
        vec2 d = abs(p)-b;
        return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
    }


    mat2 ro(float a){
        return mat2(
            cos(a), sin(a),
            -sin(a), cos(a)
        );
    }


    vec4 fromLinear(vec4 linearRGB) {
        bvec3 cutoff = lessThan(linearRGB.rgb, vec3(0.0031308));
        vec3 higher = vec3(1.055)*pow(linearRGB.rgb, vec3(1.0/2.4)) - vec3(0.055);
        vec3 lower = linearRGB.rgb * vec3(12.92);
    
        return vec4(mix(higher, lower, cutoff), linearRGB.a);
    }


    void main()
    {
        // Normalized pixel coordinates (from 0 to 1)
        vec2 uv = vuv;
        vec2 uv2 = (uv - .0);
        //vec2 uv2 = (uv - .5) * 1.8 + 0.5;        
        
        
        
        //float frames = 6.15;
        float frames = 8.;        
        
        vec3 u2 = vec3(fract((uv2) * frames), 0.);
        vec2 u3 = u2.xy;    

        u2.z = (floor(uv2.y * frames) + uv2.x + 2.);    
        u2.z *= mod(time, frames) * 0.6;
        //u2.z *= 0.16;    
        
        
        vec4 t;

        t = texture(tex, uv);        

        vec4 colorTex = texture(colorTex, uv);
        vec3 s2 = vec3( dot(texture(tex, uv).xyz, F) );
        vec4 t2 = texture(tex, uv);    
        
        
        vec4 col = vec4(0.);
        
        float off = 0.25;
        

        u3.x /= step(1., u2.z - u3.x);

        //float c = sdBox(u3, vec2(1.));        
        float c = sdBox(u3, vec2(1.));                
        

        //vec4 f = mix(t, col, step(0.0001, c));
        vec4 f = mix(colorTex, t, step(0.0001, c));        
        //vec4 f = mix(colorTex, t, step(1., c));                
        //vec4 f = mix(t, col,  c);        

        // Output to screen
        gl_FragColor = f;
        
        //gl_FragColor = t;                
        //gl_FragColor = vec4(s2 * .09, 1.);                
        //fragColor = vec4(u3, 0, 1);    
    }
    */




    uniform sampler2D tex;
    uniform sampler2D colorTex;
    uniform sampler2D spiralSceneTexture;    
    uniform float time;
    uniform float switch2;

    varying vec2 vuv;

    
    mat3 ro(float a){
        return mat3(
            cos(a), 0., sin(a),
            0., 1., 0.,
            .5, .5, .9
        );
    }
    
/*
    mat3 ro(float a){
        return mat3(
            1, 0., 0,
            0., -cos(a), sin(a),
            .5, .5, .9
        );
    }
*/

    void main()
    {
        // Normalized pixel coordinates (from 0 to 1)
        //vuv2.x = vuv2.x - vuv2.y * 1.;    
    
        //vec2 uv = fragCoord/iResolution.xy;
        vec2 uv = vuv;        
        
        vec3 uv3 = vec3(fract(uv * 12.), 1.);
        vec2 uv2 = vec2(0);    
        
        vec2 id = floor(uv * 12.) * .1;    

        id.y /= 2.;
    
            
        float phase = 0.;
        float time2 = time - (id.x - id.y) * 1.;
        //float time2 = (time - .8) + ( id.x - id.y ) * 1.;        

        
        phase += smoothstep(0.0, 1., time2);
        
        float side = step(.34, phase);    
        
        //float side = step(.36, phase);        
        
        float angle = radians( phase * 180. );    
        
        uv3 = inverse( (ro( angle ) ) ) * uv3;
        
        uv2 = uv3.xy / uv3.z + .5;    
        
        float d = -1.0;
        float a = 1.;

        if(uv2.x > 0. && uv2.y > 0. && uv2.x < 3. && uv2.y < 3. && uv3.z > d ){
            a = uv3.z;
        }
        else{
            a = 0.;
        }
        
        
        
        vec4 t = texture(tex, uv);
        vec4 t2 = texture(colorTex, uv);    
        vec4 t3 = texture(spiralSceneTexture, uv);    

        vec4 f1 =  mix( vec4(0), mix( t, t2, side ), a );
        vec4 f2 =  mix( vec4(0) , mix(t3, t2, side ), a );        

        // Output to screen
        //gl_FragColor = mix( vec4(0) , mix(t, t2, side ), a );        
        //gl_FragColor = mix( vec4(0) , mix(f2, f1, side ), a );        

        gl_FragColor = mix( f2, f1, switch2 );                

        //gl_FragColor = t3;                        

        //gl_FragColor = mix( vec4(0) , mix(t2, t3, side ), a );                
    }





`;


/*

    uniform sampler2D tex;
    uniform sampler2D colorTex;
    uniform float time;

    varying vec2 vuv;

    mat3 ro(float a){
        return mat3(
            cos(a), 0., sin(a),
            0., 1., 0.,
            .5, .5, 1.
        );
    }



    void main()
    {
        // Normalized pixel coordinates (from 0 to 1)
        //vuv2.x = vuv2.x - vuv2.y * 1.;    
    
        //vec2 uv = fragCoord/iResolution.xy;
        vec2 uv = vuv;        
        
        vec3 uv3 = vec3(fract(uv * 12.), 1.);
        vec2 uv2 = vec2(0);    
        
        vec2 id = floor(uv * 12.) * .1;    

        id.y /= 12.;
    
            
        float phase = 0.;
        float time2 = time - (id.x - id.y) * 1.;
        //time = clamp(time - 1., 0., 1.);
        //phase = .8 - (id.x - id.y) * 0.1;    
        //phase = radians(phase * 180.);    
        
        phase += smoothstep(0.0, 1., time2);
        //phase += 1.0 - smoothstep(3.0, 4.0, iTime);
        //phase = abs(mod(phase, 2.0) - 1.);    
        //phase = mod(phase, 6.);    
        
        //float side = step(.65, phase);    
        float side = step(.36, phase);        
        
        float angle = radians( phase * 180. );    
        
        uv3 = inverse( (ro( angle ) ) ) * uv3;
        
        uv2 = uv3.xy / uv3.z + .5;    
        
        float d = -1.0;
        float a = 1.;

        if(uv2.x > 0. && uv2.y > 0. && uv2.x < 1.5 && uv2.y < 1.5 && uv3.z > d ){
            a = uv3.z;
        }
        else
            a = 0.;
        
        
        
        vec4 t = texture(tex, uv);
        vec4 t2 = texture(colorTex, uv);    
        

        // Output to screen
        //fragColor = vec4(uv2, uv2.x - uv2.y,1.0);
        //fragColor = mix(  vec4(0) , mix(vec4(1, 0, 0, 0), vec4(0, 0, 1, 0), d), uv2.x );    
        gl_FragColor = mix(  vec4(0) , mix(t, t2, side ), a );        
        //fragColor = vec4(id, 0, 1);
    }


*/