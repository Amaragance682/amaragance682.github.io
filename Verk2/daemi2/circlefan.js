/////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//     Teikna nálgun á hring sem TRIANGLE_FAN
//
//    Hjálmtýr Hafsteinsson, ágúst 2024
/////////////////////////////////////////////////////////////////
var canvas;
var gl;
var vBuffer;

// numCirclePoints er fjöldi punkta á hringnum
// Heildarfjöldi punkta er tveimur meiri (miðpunktur + fyrsti punktur kemur tvisvar)

var numCirclePoints = 20;       
var radius = 0.5;
var center = vec2(0, 0);
var points = [];

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);


    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    document.getElementById("slider").oninput = function(event) {
        numCirclePoints = Number(event.target.value);

        document.getElementById("vertexCount").textContent = numCirclePoints + " vertices";
        render();
    };

    render();
}

function createCirclePoints(cent, rad, k) {
    points = [];
    points.push(cent);

    var dAngle = 2 * Math.PI / k;
    for (var i = 0; i <= k; i++) {
        var a = i * dAngle;
        var p = vec2(rad * Math.sin(a) + cent[0], rad * Math.cos(a) + cent[1]);
        points.push(p);
    }
    
    points.push(points[1])
}

function render() {
    createCirclePoints(center, radius, numCirclePoints);
    
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);  // Reallocate buffer data with new points

    
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, numCirclePoints + 2);
}
