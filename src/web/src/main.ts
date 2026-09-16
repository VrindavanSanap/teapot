import "./style.css";

type Vec2 = { x: number; y: number };
type Vec3 = { x: number; y: number; z: number };
type Triangle = Vec3[];

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

const css_vars = getComputedStyle(document.documentElement);
const FOREGROUND_COLOR = css_vars.getPropertyValue("--line").trim() || "#64d2ff";
const BACKGROUND_COLOR = css_vars.getPropertyValue("--canvas-bg").trim() || "#0d0d0f";

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
  const new_x = x * Math.cos(theta) - z * Math.sin(theta);
  const new_z = x * Math.sin(theta) + z * Math.cos(theta);

  return { x: new_x, y: y, z: new_z };
}

function rotate_yz({ x, y, z }: Vec3, phi: number): Vec3 {
  const new_y = y * Math.cos(phi) - z * Math.sin(phi);
  const new_z = y * Math.sin(phi) + z * Math.cos(phi);

  return { x: x, y: new_y, z: new_z };
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
let d_theta =0
let d_phi = 0

const MIN_DZ = 4;
const MAX_DZ = 50;
const START_DZ = 5;
let dz = START_DZ;

canvas.addEventListener("wheel", (event) => {
  event.preventDefault();
  dz *= Math.exp(event.deltaY * 0.001);
  dz = Math.min(MAX_DZ, Math.max(MIN_DZ, dz));
}, { passive: false });

let drag_start: Vec2 | null = null;

canvas.addEventListener("pointerdown", (event) => {
  drag_start = { x: event.clientX, y: event.clientY };
  canvas.setPointerCapture(event.pointerId);
  canvas.classList.add("dragging");
});

canvas.addEventListener("pointermove", (event) => {
  if (drag_start === null) return;
  const dx = event.clientX - drag_start.x;
  const dy = event.clientY - drag_start.y;
  drag_start = { x: event.clientX, y: event.clientY };

  d_theta += (dx / canvas.clientWidth) * 2 * Math.PI;
  d_phi -= (dy / canvas.clientHeight) * 2 * Math.PI;
});

function end_drag() {
  drag_start = null;
  canvas.classList.remove("dragging");
}
canvas.addEventListener("pointerup", end_drag);
canvas.addEventListener("pointercancel", end_drag);

const MOVE_SPEED = 3;
let offset_x = 0;
let offset_y = 0;
const held_keys = new Set<string>();

window.addEventListener("keydown", (event) => {
  if (!event.key.startsWith("Arrow")) return;
  event.preventDefault();
  held_keys.add(event.key);
});
window.addEventListener("keyup", (event) => held_keys.delete(event.key));
window.addEventListener("blur", () => held_keys.clear());

function move_from_keys() {
  const step = (MOVE_SPEED / FPS) * (dz / START_DZ);
  if (held_keys.has("ArrowLeft")) offset_x -= step;
  if (held_keys.has("ArrowRight")) offset_x += step;
  if (held_keys.has("ArrowUp")) offset_y += step;
  if (held_keys.has("ArrowDown")) offset_y -= step;
}

document.getElementById("reset")!.addEventListener("click", () => {
  d_theta = 0;
  d_phi = 0;
  dz = START_DZ;
  offset_x = 0;
  offset_y = 0;
});

const CENTER_Y = 1.5;

const triangles: Triangle[] = [];
function cook_vertex(vertex: Vec3, d_theta: number, d_phi: number): Vec2 {
  const centered = translate(vertex, { dx: 0, dy: -CENTER_Y, dz: 0 });
  const rotated = rotate_yz(rotate_xz(centered, d_theta), d_phi);
  const translated = translate(rotated, { dx: offset_x, dy: CENTER_Y - 1 + offset_y, dz: dz });
  const projected = project(translated);
  const screen_point = normalized_to_screen_space(projected);
  return screen_point;
}
function frame() {
  clear()
  move_from_keys();
  for (const triangle of triangles) {
    draw_triangle(cook_vertex(triangle[0], d_theta, d_phi), cook_vertex(triangle[1], d_theta, d_phi), cook_vertex(triangle[2], d_theta, d_phi));

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
