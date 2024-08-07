//// DOM ELEMENTS ////

const canvas = $('#canvas');
const ctx = canvas.getContext('2d');
const colorSpaceMenu = $('#color-space-menu');
const stopBtn = $('#btn');
const refreshBrn = $('#refresh');
const out = $('output');
const pre = $('pre');
let colorSpaceFunction;

//// CLASSES ////

class CircleField {
  constructor(ctx, n = 1) {

    if (ctx === undefined 
      || !(ctx instanceof CanvasRenderingContext2D)) {
      throw new TypeError('Argument 1: ' + 
        'Expected CanvasRenderingContext2D but received ' + 
        ctx?.constructor.name ?? 'undefined');
    }

    this.ctx = ctx;
    this.width = ctx.canvas.width;
    this.height = ctx.canvas.height;
    this.minRadius = 2;
    this.maxRadius = 
      parseInt(getComputedStyle(ctx.canvas)['font-size']);
    this.circles = this.init(n);
  }

  init(n) {
    this.canvasDiagonal = Math.hypot(
      this.width,
      this.height,
    );
    return Array.from({length: n}, () => {
      const r = rnd(this.minRadius, this.maxRadius);
      return new Circle( 
        rnd(r, this.width - r),
        rnd(r, this.height - r),
        r
      )
    });
  }

  draw(animateLightness = false) {
    let s = '';
    for (let circle of this.circles) {
      // distance from mouse pointer to circle
      const d = Math.hypot(
        canvasX - circle.x, 
        canvasY - circle.y
      );
      const params = {
        d, circle, animateLightness,
        width: this.width,
        height: this.height,
        canvasDiagonal: this.canvasDiagonal
      }
      const color = this.colorSpaceFunctions[colorSpaceFunction](params);
      circle.draw(color);
      s += color + '\n';
    }  
    // pre.innerText = s;
  }
  

  colorSpaceFunctions = {
    "hsl": (params) => {
      const x = params.circle.x - (params.width / 2);
      const y = params.circle.y - (params.height / 2);

      const h = this.calculateTheta({x, y}) / (2 * Math.PI) * 360;

      const r = Math.hypot(x, y) / (params.width / 2);
      let l = 25;

      let s = 0; 
      if (params.animateLightness) {
        l = lerp(
          25, 75, easeInQuart(1 - params.d / params.canvasDiagonal)
        );
        s = lerp(
          0, 100, easeInQuart(1 - params.d / params.canvasDiagonal)
        );
      } 
      return `hsl(${h} ${s} ${l})`;
    },
    
    "lab": (params) => {
      // l: lightness, a: red/green axis, b: blue/yellow axis
      let l = 0; 
      if (params.animateLightness) {
        l = lerp(
          0, 100, easeInExpo(1 - params.d / params.canvasDiagonal)
        );
      }
      const a = lerp(-150, 150, params.circle.x / params.width);
      const b = lerp(-150, 150, params.circle.y / params.height);
      return `lab(${l} ${a} ${b})`;    
    },
    
    "lch": () => {
      return 'gray';
    }
  };


  calculateTheta(p) {
    let theta = Math.atan(p.y / p.x);

    // Converts the result of sign (-1, 0, 1) to 
    // (0, 1, 2) for use as index into multiplier array
    const x = Math.sign(p.x) + 1;
    const y = Math.sign(p.y) + 1;
    
    // Adds a multiple of PI based on the quadrant of the point
    // to give an angle in the range [0, 2 * PI)
    const multiplier = [
      [1, 2, 2],
      [1, 0, 0],
      [1, 0, 0]
    ];
    return theta + multiplier[y][x] * Math.PI;
  }

  getColorSpaceFunctionNames() {
    return Object.keys(this.colorSpaceFunctions);
  }
  
}


class Circle {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
  }

  draw(color = 'gray', r = this.r) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }
}

//// EVENT LISTENERS ////

let canvasX = 0;
let canvasY = 0;

canvas.addEventListener('mousemove', e => {
  canvasX = e.offsetX;
  canvasY = e.offsetY;
  animateLightness = true;
});


canvas.addEventListener('mouseout', () => {
  animateLightness = false;
});


canvas.addEventListener('mouseenter', () => {
  animateLightness = true;
});


let stopped = false;
stopBtn.addEventListener('click', () => {
  if (stopBtn.innerText === 'Stop') {
    stopped = true;
    stopBtn.innerText = 'Start';
    console.log('stopped', stopped)
  } else {
    stopBtn.innerText = 'Stop';
    stopped = false;
    console.log('stopped', stopped)
    draw();
  }
});


refreshBrn.addEventListener('click', () => {
  circleField = new CircleField(ctx, numCircles);
})


colorSpaceMenu.addEventListener('change', e => {
  colorSpaceFunction = e.target.value;
})


function populateColorSpaceMenu() {
  for (f of circleField.getColorSpaceFunctionNames()) {
    const opt = document.createElement('option');
    opt.setAttribute('value', f);
    opt.innerText = f;
    colorSpaceMenu.append(opt);
  }
  colorSpaceFunction = colorSpaceMenu.value;
}

//// MAIN LOOP ////


const numCircles = 72;
let circleField = new CircleField(ctx, numCircles);
let animateLightness = false;
populateColorSpaceMenu();

draw();
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  out.innerText = `(${canvasX}, ${canvasY})`;
  circleField.draw(animateLightness);
  
  if (!stopped) {
    requestAnimationFrame(draw);
  }
}
