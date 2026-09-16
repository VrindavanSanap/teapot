canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d");

const FOREGROUND_COLOR = "#7dc2b3"
const BACKGROUND_COLOR = "black"


canvas.height = 800;
canvas.width = 800;

function clear() {
  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}



function normalized_to_screen_space({ x, y }) {
  // (-1 , 1) + 1 --> (0, 2) /2 --> (0, 1) * w ----> (0, w )
  x = ((x + 1) / 2) * canvas.width;

  // (-1 , 1) + 1 --> (0, 2) /2 --> (0, 1) * h ----> (0, h )
  y = ((((y * (-1)) + 1) / 2)) * canvas.height;
  return { x: x, y: y }
}

clear();

function project({ x, y, z }) {
  return { x: x / z, y: y / z }
}

function rotate_xz({ x, y, z }, theta) {
  // rotate around the y axis
  const new_x = x * Math.cos(theta) - z * Math.sin(theta);
  const new_z = x * Math.sin(theta) + z * Math.cos(theta);

  return { x: new_x, y: y, z: new_z };
}

function translate({ x, y, z }, { dx, dy, dz }) {
  return { x: x + dx, y: y + dy, z: z + dz };
}

function draw_point({ x, y }, size) {
  ctx.fillStyle = FOREGROUND_COLOR;
  ctx.fillRect(x - (size / 2), y - (size / 2), size, size)
}

function draw_line(p1, p2) {
  ctx.beginPath();
  ctx.strokeStyle = FOREGROUND_COLOR;
  ctx.lineWidth = .1;
  ctx.moveTo(p1.x, p1.y)
  ctx.lineTo(p2.x, p2.y)
  ctx.stroke();
}

function draw_triangle(p1, p2, p3) {
  draw_line(p1, p2);
  draw_line(p3, p2);
  draw_line(p3, p1);
}

const FPS = 60;
let d_theta = 0
let triangles = [];
function cook_vertex(vertex, d_theta) {
  let rotated = rotate_xz(vertex, d_theta);
  let translated = translate(rotated, { dx: 0, dy: -1, dz: 5 });
  let projected = project(translated);
  let screen_point = normalized_to_screen_space(projected);
  return screen_point;
}
function frame() {
  clear()
  d_theta += (2 * Math.PI) / (FPS * 10);
  for (const triangle of triangles) {
    draw_triangle(cook_vertex(triangle[0], d_theta), cook_vertex(triangle[1], d_theta), cook_vertex(triangle[2], d_theta));

  }

  setTimeout(frame, 1000 / FPS);
}
frame();
let text;
async function loadData() {
  try {
    const response = await fetch('js/data.txt');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    text = await response.text();
    text = text.split("\n\n");
    vertices = []
    for (triangle_text of text) {
      let points = triangle_text.split("\n");
      const triangle = points.map(str => {
        const [x, y, z] = str.trim().split(/\s+/).map(Number);
        return { x, y, z };
      });
      triangles.push(triangle);
    }
  } catch (error) {
    console.error('Failed to load js/data.txt:', error);
  }
}
loadData()