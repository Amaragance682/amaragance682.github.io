"use strict";

var gl;
var points;

var xAxis = 0;
var yAxis = 1

var movement = false;

var NumPoints = 5000;

var xmove=0;
var ymove=0;

var mouseX;
var mouseY;
var canvas;
var scrollValue=1;
var transformColor;
var transformationMatrix;

var toBeColor = vec4(0.0, 0.0, 0.0, 1.0);

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL(canvas);
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.

    var vertices = [
        vec2( -1, -1 ),
        vec2(  0,  1 ),
        vec2(  1, -1 )
    ];

    // Specify a starting point p for our iterations
    // p must lie inside any set of three vertices

    var u = add( vertices[0], vertices[1] );
    var v = add( vertices[0], vertices[2] );
    var p = scale( 0.25, add( u, v ) );

    // And, add our initial point into our array of points

    points = [ p ];

    // Compute new points
    // Each new point is located midway between
    // last point and a randomly chosen vertex

    for ( var i = 0; points.length < NumPoints; ++i ) {
        var j = Math.floor(Math.random() * 3);
        p = add( points[i], vertices[j] );
        p = scale( 0.5, p );
        points.push( p );
    }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    transformationMatrix = gl.getUniformLocation(program, "transform" );
    transformColor = gl.getUniformLocation(program, "transformColor" );
    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
};


function render() {




    gl.clear( gl.COLOR_BUFFER_BIT );

    var mv = mat4();
    mv = mult( mv, scalem(scrollValue,scrollValue,1));
    mv = mult( mv, translate(xmove, ymove, 0) );
    
    gl.uniformMatrix4fv(transformationMatrix, false, flatten(mv));
    gl.uniform4fv(transformColor, flatten(toBeColor) );

    gl.drawArrays( gl.POINTS, 0, points.length );

    requestAnimationFrame(render);
}


document.addEventListener('mousedown', function (e){
    movement = true;
    mouseX = e.offsetX;
    mouseY = e.offsetY;
});

document.addEventListener('mouseup', function (e){
    movement = false;

});


document.addEventListener('keydown', function (e) { 
    if (e.key === ' ') {
        rgb();
    } 
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
});


document.addEventListener('mousemove', function (e){
    if(movement) {
        xmove += 2*(e.offsetX - mouseX)/ canvas.width;
        ymove += -2*(e.offsetY - mouseY)/ canvas.height;
        mouseX = e.offsetX;
        mouseY = e.offsetY;
    }
});

document.addEventListener('wheel', function (e){
    scrollValue += e.deltaY*0.001;

});

function rgb() {
    console.log("halllo :)");
    var x = Math.random();
    var y = Math.random();
    var z = Math.random();
    console.log(x);
    toBeColor = vec4(x, y, z, 1.0);

}