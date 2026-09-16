canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d");
const FOREGROUND_COLOR = "#77dd77"
const BACKGROUND_COLOR = "black"
const h = 500;
const w = 500;
canvas.height = h;
canvas.width = w;

function clear() {
  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(0, 0, canvas.height, canvas.width)
}

function draw_point({x, y}, size) {
  ctx.fillStyle = FOREGROUND_COLOR;
  ctx.fillRect(x - (size/2), y - (size/2), size, size)
}

clear();
let p = {x: h/2, y: w/2}

draw_point(p, 5)
