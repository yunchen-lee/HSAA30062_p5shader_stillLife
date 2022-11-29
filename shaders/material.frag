precision highp float;
#define PI 3.14159265359


uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform mat3 uNormalMatrix;
uniform vec3 u_lightDir;
uniform vec3 u_col;
uniform float u_time;
uniform vec3 u_lightPos;

//attributes, in
varying vec3 var_vertPos;
varying vec2 var_vertTexCoord;
varying vec3 var_vertNormal;
varying vec3 v_camera;
varying vec3 v_cameraDir;



// ==========================================================
float random (in vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

#define OCTAVES 6
float fbm (in vec2 st) {
    // Initial values
    float value = 0.0;
    float amplitude = .5;
    float frequency = 0.;
    //
    // Loop of octaves
    for (int i = 0; i < OCTAVES; i++) {
        value += amplitude * noise(st);
        st *= 2.;
        amplitude *= .5;
    }
    return value;
}


void main(){

    vec2 st = var_vertTexCoord.xy /u_resolution.xy;
    vec3 vertPos = var_vertPos.xyz;

    vec3 col = vec3(0.0,0.0,0.0);
    // vec3 lightPos = u_lightPos+vec3(-100.0*(cos(u_time)+0.8),-100.0*(sin(u_time)+1.0),-100.0*(cos(u_time)+0.5));
    vec3 lightPos = u_lightPos + vec3(-20);
    vec4  specular = vec4(1.0);
    float roughness = 50.0;
    float layerDiv = 2.0;
    vec3 diffuse = u_col;
    float edgeThickness = 0.3;
    float ambient = 0.62;
    vec4 edgeColor = vec4(0.3,0.15,0.3,1.0);

    vec3 eyeDirection = normalize(v_camera - vertPos.xyz);
    vec3 lightDirection = normalize(lightPos - vertPos.xyz);
    vec3 n = normalize(var_vertNormal);

    // oil painting texture
    n += vec3(fbm(n.xy*1.0),fbm(n.xy*1.0)*0.01,fbm(n.xy*1.0)*0.1);
    n += vec3(fbm(n.xy*6.0)*0.1,fbm(n.xy*4.0)*0.2,fbm(n.xy*4.0)*0.01);
    vec3 n_sec = n;
    n += vec3(fbm(n.xy*6.0),fbm(n.xy*3.0)*0.01,fbm(n.xy*3.0));
    n += vec3(fbm(n.xy*20.0)*0.1,fbm(n.xy*90.0)*0.2,fbm(n.xy*6.0)*0.01);

    // specular
    vec3 reflectDiration = normalize(reflect(-lightDirection,n));
    float spec = floor(pow(max(dot(reflectDiration,v_cameraDir),0.0),roughness)*2.0+0.5)/2.0;
    if(spec>0.0) spec = 1.0;

    // diffuse + ambient
    float diff = exp(floor(dot(-lightDirection,n)*layerDiv+0.5)/layerDiv);
    vec3 ambientCol = vec3(ambient) * diffuse.rgb;
    col = mix(ambientCol, diffuse.rgb, diff);

    // edge
    float dotval = abs(dot(var_vertNormal, -v_cameraDir));
    dotval = step(edgeThickness, dotval);
    col = edgeColor.rbg*(1.0-dotval)+col+spec*specular.xyz;
    vec3 color_prim = col;


    // shadow
    vec4 color = vec4(1.0);
    color.rgb = vec3( 1.0 + vertPos.z ) * 0.5;
    vec3 light_depth = vec3(normalize(vertPos.xyz)-normalize(lightPos));
    if(normalize(light_depth).z >normalize(vertPos).z) col = col*vec3(0.8);



    // reflect color
    vec4 reflect_color = vec4(0.0, 0.27, 0.7, 1.0);
    vec4 reflect_color_sec = vec4(0.62, 0.55, 0.35, 1.0);

    if(reflectDiration.y>0.15 && reflectDiration.z<0.1) col = mix(col, mix(reflect_color.rgb,vec3(fbm(n.xy*8.0)),0.2), 0.35);
    if(reflectDiration.y>0.1 && reflectDiration.x<0.4) col = mix(col,reflect_color_sec.rgb, 0.4);


    //second light
    vec3 lightPos_sec = u_lightPos + vec3(-20)+vec3(-200,200,-100);
    vec3 lightDirection_sec = normalize(lightPos_sec - vertPos.xyz);
    vec3 diffuse_color = vec3(0.7216, 0.1843, 0.1373);

    float roughness_sec = 60.0;
    n_sec+=vec3(fbm(n.xy*2.0)*0.2,fbm(n.xy*3.0)*0.01,fbm(n.xy*1.0));
    vec3 reflectDiration_sec = normalize(reflect(-lightDirection_sec,n_sec));
    float spec_sec = floor(pow(max(dot(reflectDiration_sec,v_cameraDir),0.0),roughness_sec)*2.0+0.5)/2.0;
    if(spec_sec>0.0) spec_sec = 1.0;

    float diff_sec = exp(floor(dot(-lightDirection_sec,n)*layerDiv+0.5)/layerDiv);
    vec3 ambientCol_sec = vec3(ambient) * diffuse_color.rgb;
    vec3 color_sec = mix(ambientCol_sec, diffuse_color.rgb, diff_sec);
    color_sec = color_sec+spec_sec*specular.xyz;

    vec3 reflectDiration_sec_oldn = normalize(reflect(-lightDirection_sec,n));
    if(reflectDiration_sec_oldn.y<0.002 && reflectDiration_sec_oldn.x>0.04) col = mix(col,color_sec,0.18);
    if(spec_sec>0.0) col = mix(col,vec3(1.0, 1.0, 1.0),0.3);
    

    gl_FragColor = vec4(col,1.0);

}
