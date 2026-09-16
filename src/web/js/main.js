canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d");
const FOREGROUND_COLOR = "#77dd77"
const BACKGROUND_COLOR = "black"
const h = 300;
const w = 300;
canvas.height = h;
canvas.width = w;

function clear() {
  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function draw_point({ x, y }, size) {
  ctx.fillStyle = FOREGROUND_COLOR;
  ctx.fillRect(x - (size / 2), y - (size / 2), size, size)
}
function screen_coords({ x, y }) {
  // (-1 , 1) + 1 --> (0, 2) /2 --> (0, 1) * w ----> (0, w )
  x = ((x + 1) / 2) * canvas.width;

  // (-1 , 1) + 1 --> (0, 2) /2 --> (0, 1) * h ----> (0, h )
  y = ((((y * (-1)) + 1) / 2)) * canvas.height;
  return { x: x, y: y }

}

clear();
let p = { x: .9, y: .9, z: 1 };

function project({ x, y, z }) {
  return { x: x / z, y: y / z }

}
const vertices = [
  { x: .5, y: .5, z: .5 },
  { x: .5, y: -.5, z: .5 },
  { x: -.5, y: -.5, z: .5 },
  { x: -.5, y: .5, z: .5 },

  { x: .5, y: .5, z: -.5 },
  { x: .5, y: -.5, z: -.5 },
  { x: -.5, y: -.5, z: -.5 },
  { x: -.5, y: .5, z: -.5 }
]
const faces = [
  [0, 1, 2, 3],
  [4, 5, 6, 7],
  [0, 4], 
  [1, 5], 
  [2, 6], 
  [3, 7], 


]
function rotate_xz({ x, y, z }, theta) {
  // rotate around the y axis
  const new_x = x * Math.cos(theta) - z * Math.sin(theta);
  const new_z = x * Math.sin(theta) + z * Math.cos(theta);

  return { x: new_x, y: y, z: new_z };
}
function translate_z({ x, y, z }, dz) {
  return { x: x, y: y, z: z + dz };

}
function draw_line(p1, p2) {
  ctx.beginPath();
  ctx.strokeStyle = FOREGROUND_COLOR;
  ctx.lineWidth = 1;
  ctx.moveTo(p1.x, p1.y)
  ctx.lineTo(p2.x, p2.y)
  ctx.stroke();
}
const FPS = 60;
let d_theta = 0
function frame() {

  clear()
  d_theta += (2 * Math.PI) / (FPS * 4);
  for (face of faces) {
    for (let i = 0; i < face.length; i++) {
      const a = vertices[face[i]];
      const b = vertices[face[(i + 1) % face.length]];
      draw_line(
        screen_coords(project(translate_z(rotate_xz(a, d_theta), 2))),
        screen_coords(project(translate_z(rotate_xz(b, d_theta), 2)))
      );
    }
  }
  setTimeout(frame, 1000 / FPS);
}
frame();
