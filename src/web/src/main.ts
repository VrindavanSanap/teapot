import "./style.css";

type Vec2 = { x: number; y: number };
type Vec3 = { x: number; y: number; z: number };
type Triangle = Vec3[];

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

const FOREGROUND_COLOR = "#7dc2b3"
const BACKGROUND_COLOR = "black"

// Match the canvas's pixel size to its on-screen size so lines stay sharp at any size
function resize_canvas() {
  const { width, height } = canvas.getBoundingClientRect();
  canvas.width = Math.round(width * window.devicePixelRatio);
  canvas.height = Math.round(height * window.devicePixelRatio);
}

resize_canvas();
window.addEventListener("resize", resize_canvas);

function clear() {
  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}



function normalized_to_screen_space({ x, y }: Vec2): Vec2 {
  // (-1 , 1) + 1 --> (0, 2) /2 --> (0, 1) * w ----> (0, w )
  x = ((x + 1) / 2) * canvas.width;

  // (-1 , 1) + 1 --> (0, 2) /2 --> (0, 1) * h ----> (0, h )
  y = ((((y * (-1)) + 1) / 2)) * canvas.height;
  return { x: x, y: y }
}

clear();

function project({ x, y, z }: Vec3): Vec2 {
  return { x: x / z, y: y / z }
}

function rotate_xz({ x, y, z }: Vec3, theta: number): Vec3 {
  // rotate around the y axis
  const new_x = x * Math.cos(theta) - z * Math.sin(theta);
  const new_z = x * Math.sin(theta) + z * Math.cos(theta);

  return { x: new_x, y: y, z: new_z };
}

function translate({ x, y, z }: Vec3, { dx, dy, dz }: { dx: number; dy: number; dz: number }): Vec3 {
  return { x: x + dx, y: y + dy, z: z + dz };
}

function draw_line(p1: Vec2, p2: Vec2) {
  ctx.beginPath();
  ctx.strokeStyle = FOREGROUND_COLOR;
  ctx.lineWidth = .1;
  ctx.moveTo(p1.x, p1.y)
  ctx.lineTo(p2.x, p2.y)
  ctx.stroke();
}

function draw_triangle(p1: Vec2, p2: Vec2, p3: Vec2) {
  draw_line(p1, p2);
  draw_line(p3, p2);
  draw_line(p3, p1);
}

const FPS = 60;
let d_theta = 0
const triangles: Triangle[] = [];
function cook_vertex(vertex: Vec3, d_theta: number): Vec2 {
  const rotated = rotate_xz(vertex, d_theta);
  const translated = translate(rotated, { dx: 0, dy: -1, dz: 5 });
  const projected = project(translated);
  const screen_point = normalized_to_screen_space(projected);
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
async function loadData() {
  try {
    const response = await fetch('data.txt');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    for (const triangle_text of text.split("\n\n")) {
      const points = triangle_text.split("\n");
      const triangle = points.map(str => {
        const [x, y, z] = str.trim().split(/\s+/).map(Number);
        return { x, y, z };
      });
      triangles.push(triangle);
    }
  } catch (error) {
    console.error('Failed to load data.txt:', error);
  }
}
loadData()
