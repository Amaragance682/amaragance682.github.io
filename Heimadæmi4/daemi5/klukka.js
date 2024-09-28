
var canvas;
var gl;

var numVertices  = 36;

var points = [];
var colors = [];

var movement = false;     // Do we rotate?
var spinX = 0;
var spinY = 0;
var origX;
var origY;

var rotYear = 0.0;
var rotDay = 0.0;
var earthTilt = 23.5;

var matrixLoc;


window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    colorCube();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.9, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);


    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    matrixLoc = gl.getUniformLocation( program, "rotation" );


    canvas.addEventListener("mousedown", function(e){
        movement = true;
        origX = e.offsetX;
        origY = e.offsetY;
        e.preventDefault();         
    } );

    canvas.addEventListener("mouseup", function(e){
        movement = false;
    } );

    canvas.addEventListener("mousemove", function(e){
        if(movement) {
    	    spinY = ( spinY + (origX - e.offsetX) ) % 360;
            spinX = ( spinX + (origY - e.offsetY) ) % 360;
            origX = e.offsetX;
            origY = e.offsetY;
        }
    } );

    render();
}

function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function quad(a, b, c, d) 
{
    var vertices = [
        vec3( -0.5, -0.5,  0.5 ),
        vec3( -0.5,  0.5,  0.5 ),
        vec3(  0.5,  0.5,  0.5 ),
        vec3(  0.5, -0.5,  0.5 ),
        vec3( -0.5, -0.5, -0.5 ),
        vec3( -0.5,  0.5, -0.5 ),
        vec3(  0.5,  0.5, -0.5 ),
        vec3(  0.5, -0.5, -0.5 )
    ];

    var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
        [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
        [ 1.0, 1.0, 1.0, 1.0 ]   // white
    ];

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices
    
    //vertex color assigned by the index of the vertex
    
    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        colors.push(vertexColors[a]);
        
    }
}


function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Base transformation matrix
    var mv = mat4();
    mv = mult(mv, rotateX(spinX));
    mv = mult(mv, rotateY(spinY));



    // Increment time values
    rotDay += 1.0; // Simulate seconds (adjust speed for smoothness if needed)
    rotYear = rotDay / 60.0; // Minutes
    var hourRotation = rotYear / 12.0; // Hours (divided by 12 for the 12-hour format)

    // Draw the hour hand
    var hourHand = mult(mv, rotateZ(hourRotation)); // Rotate the hour hand
    hourHand = mult(hourHand, translate(0.1, 0.0, 0.0)); // Move to the right end (half-length of the hand)
    hourHand = mult(hourHand, scalem(0.5, 0.1, 0.05)); // Scale to form the hour hand shape
    gl.uniformMatrix4fv(matrixLoc, false, flatten(hourHand));
    gl.drawArrays(gl.TRIANGLES, 0, numVertices);

    // Draw the minute hand (attach at the end of the hour hand)
    var minuteHand = mult(hourHand, rotateZ(hourRotation)); // Rotate minute hand twice the speed
    minuteHand = mult(minuteHand, translate(0.5, 0.0, 0.0)); // Attach at the end of the hour hand
    minuteHand = mult(minuteHand, scalem(0.7, 0.4, 0.05)); // Scale the minute hand
    gl.uniformMatrix4fv(matrixLoc, false, flatten(minuteHand));
    gl.drawArrays(gl.TRIANGLES, 0, numVertices);

    // Add the second hand (attach at the end of the minute hand)
    var secondHand = mult(minuteHand, rotateZ(rotDay * 3)); // Rotate three times the speed
    secondHand = mult(secondHand, translate(0.5, 0.0, 0.0)); // Attach at the end of the minute hand
    secondHand = mult(secondHand, scalem(0.5, 0.03, 0.03)); // Scale the second hand
    gl.uniformMatrix4fv(matrixLoc, false, flatten(secondHand));
    gl.drawArrays(gl.TRIANGLES, 0, numVertices);

    requestAnimFrame(render);
}