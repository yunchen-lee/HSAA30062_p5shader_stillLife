let mesh_table, mesh_teapot, mesh_apple_III, mesh_apple_II, mesh_scene, mesh_apple, mesh_leaf, mesh_cube, mesh_fabric; //# add mesh
var mat_vert, mat_frag;
let cam, cam_pos;
let lightPos;

function preload() {
    mesh_table = loadModel('models/table.obj');
    mesh_teapot = loadModel('models/teapot.obj');
    mesh_apple_III = loadModel('models/apple_III.obj');
    mesh_apple_II = loadModel('models/apple_II.obj');
    mesh_scene = loadModel('models/scene.obj');
    mesh_apple = loadModel('models/apple.obj');
    mesh_leaf = loadModel('models/leaf.obj');
    mesh_cube = loadModel('models/cube.obj');
    mesh_fabric = loadModel('models/fabric.obj');

    mat_vert = loadStrings('shaders/material.vert');
    mat_frag = loadStrings('shaders/material.frag');

}

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    mat_vert = mat_vert.join("\n");
    mat_frag = mat_frag.join("\n");
    sh = createShader(mat_vert, mat_frag);
    this.shader(sh);
    sh.setUniform("u_resolution", [width, height]);
    sh.setUniform("u_lightDir", [1, 1, -1]);
    sh.setUniform('u_mouse', [mouseX, mouseY]);

    noStroke();
    pixelDensity(1);

    // Camera
    cam = createCamera();
    console.log(cam)
    cam_pos = createVector(5, -550, 300);
    cam.setPosition(cam_pos.x, cam_pos.y, cam_pos.z);
    let target = createVector(0, -450, 0);
    cam.lookAt(target.x, target.y, target.z);

    lightPos = createVector(-50.0, -15.0, 10.0);
}




function draw() {

    let scl = 600;
    push();
    sh.setUniform('u_time', millis() / 1000.0);
    sh.setUniform('u_lightPos', [lightPos.x, lightPos.y, lightPos.z]);
    scale(scl);
    rotateZ(PI);
    // rotateY(0.5 + map(mouseX, 0, width, 0.03, -0.03));
    rotateY(0.5);
    translate(-0.2, 0, -0.25);
    drawModel("#3e5e85", mesh_table);
    drawModel("#668eab", mesh_teapot);
    drawModel("#660e0e", mesh_apple_III);
    drawModel("#ba5d2f", mesh_apple_II);
    drawModel("#072d45", mesh_scene);
    drawModel("#7d2519", mesh_apple);
    drawModel("#526340", mesh_leaf);
    drawModel("#435363", mesh_fabric);
    drawModel("#91826a", mesh_cube);
    pop();

}

function setCol(shader, uniformName, colStr) {
    let col = color(colStr);
    let colArray = col._array;
    colArray.pop();
    shader.setUniform(uniformName, colArray);
}

function drawModel(col, meshmodel) {
    setCol(sh, "u_col", col);
    push();
    model(meshmodel);
    pop();
}