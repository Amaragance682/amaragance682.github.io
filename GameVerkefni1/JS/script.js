var player = null;
var playerX = 0;
const playerSpeed = 0.02;
const bulletSpeed = 0.05;
const gameSpeed = 10;
var birds = 0;
var shots = 0;
var gameArea;

var shotsBegin = 3;
var shotsEnd = 3;
var birdsBegin = 3;
var birdsEnd = 3;

var points = [
    vec2(-0.1,-1),
    vec2(0.1,-1),
    vec2(0, -0.9),
];

const mapBounds = {
    left: -1.0,
    right: 1.0,
    top: 1.0,
    bottom: -1.0
};


window.onload = function () {
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.95, 1.0, 1.0, 1.0);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Create the player buffer and initialize it
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.DYNAMIC_DRAW);

    // Set up vertex attributes
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    render();
};


function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    randomBirdSpawn();
    moveBird();
    moveshots();

    // Draw player (triangle)
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 3);

    // Draw bullets and birds (lines)
    for (var i = 3; i < points.length; i += 4) {
        gl.drawArrays(gl.TRIANGLE_FAN, i, 4);
    }

    setTimeout( function () {
        requestAnimFrame(render);
    }, 10);
}


document.addEventListener('keydown', function (e) { 
    if (e.key === 'a' || e.key === 'A') {
        movePlayer(-playerSpeed);
    } else if (e.key === 'd' || e.key === 'D') {
        movePlayer(playerSpeed);
    } else if (e.key === ' ') {
        shoot();
    }
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
});

function movePlayer(x) { 
    for (var i = 0; i < 3; i++) {
        points[i] = add(vec2(x, 0.0), points[i]);
    }
}



function createBird() {
    var birdX = mapBounds.right + 0.1;
    var birdY = Math.random() * (mapBounds.top - mapBounds.bottom) + mapBounds.bottom;

    points.splice(birdsEnd, 0, vec2(birdX - 0.05, birdY + 0.05));
    points.splice(birdsEnd, 0, vec2(birdX + 0.05, birdY + 0.05));
    points.splice(birdsEnd, 0, vec2(birdX + 0.05, birdY - 0.05));
    points.splice(birdsEnd, 0, vec2(birdX - 0.05, birdY - 0.05));

    birds++;

    birdsEnd += 4;

    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.DYNAMIC_DRAW);
    console.log("bird created at", birdX, birdY);
}

function randomBirdSpawn() {
    var randomNumber = Math.random() * 100;
    if (randomNumber < 2 && birds < 3) {
        createBird();
    }
}

function moveBird() {
    for (var i = birdsBegin; i < birdsEnd; i += 1) {
        points[i][0] -= 0.01; // Move bird to the left
    }
    removeOutOfBoundsBirds();
}

function removeOutOfBoundsBirds() {
    for (var i = birdsBegin; i < birdsEnd; i += 4) {
        if (points[i][0] < mapBounds.left) { // gerum bara left side out of bounds for now
            points.splice(i, 4);
            i -= 4;
            birds--;
            birdsEnd -= 4;
        }
    }

    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.DYNAMIC_DRAW);
}

function shoot() {
    // Get the current position of the player's top point to shoot the bullet
    var bulletStartX = points[2][0];
    var bulletStartY = points[2][1];

    // Create a new bullet and add it to the bullets array

    points.splice(shotsEnd, 0, vec2(bulletStartX - 0.02, bulletStartY + 0.02));
    points.splice(shotsEnd, 0, vec2(bulletStartX + 0.02, bulletStartY + 0.02));
    points.splice(shotsEnd, 0, vec2(bulletStartX + 0.02, bulletStartY - 0.02));
    points.splice(shotsEnd, 0, vec2(bulletStartX - 0.02, bulletStartY - 0.02));

    shotsEnd += 4;
    birdsBegin += 4;
    birdsEnd += 4;

    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.DYNAMIC_DRAW);
}

function moveshots() {
    for (var i = shotsBegin; i < shotsEnd; i++) {
        points[i][1] += 0.01;
    }

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
    console.log(points[4]);

    deleteOutOfBoundsShots();
}

function deleteOutOfBoundsShots() {
    for (var i = shotsBegin; i < shotsEnd; i+=4) {
        if (points[i][1] > mapBounds.top + 0.1) {
            points.splice(i, 4);
            shotsEnd -= 4;
        }
    }
}


