//// DOM ELEMENTS ////

const canvas = $('#canvas');
const ctx = canvas.getContext('2d');
const colorSpaceMenu = $('#color-space-menu');
const stopBtn = $('#btn');
const refreshBrn = $('#refresh');
const out = $('output');

//// CLASSES ////

class CircleField {
  constructor(ctx, n = 1) {

    if (ctx === undefined 
      || !(ctx instanceof CanvasRenderingContext2D)) {      
      throw new TypeError('Argument 1: '
        + 'Expected CanvasRenderingContext2D but received ' 
        + ctx?.constructor.name ?? 'undefined');
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
    for (let circle of this.circles) {
      // distance from mouse pointer to circle
      const d = Math.hypot(
        relativeMouseX - circle.x, 
        relativeMouseY - circle.y
      );
      const params = {
        d: d, 
        circle: circle, 
        animateLightness: animateLightness,
        width: this.width,
        height: this.height,
        canvasDiagonal: this.canvasDiagonal
      }
      const color = this.colorSpaceFunctions['lab'](params);
      circle.draw(color);
      // console.log(color);
    }  
  }

  colorSpaceFunctions = {

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

    "hsl": () => {
      return 'gray';
    },
    
    "hwb": () => {
      return 'gray';
    }
  };

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
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }
}

//// EVENT LISTENERS ////

let relativeMouseX = 0;
let relativeMouseY = 0;

canvas.addEventListener('mousemove', e => {
  relativeMouseX = constrain(
    e.clientX - canvas.offsetLeft, 
    0, 
    canvas.width
  )
  relativeMouseY = constrain(
    e.clientY - canvas.offsetTop, 
    0, 
    canvas.height
  )
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
  circles = new CircleField(ctx, numCircles);
})


function populateColorSpaceMenu() {
  for (f of circles.getColorSpaceFunctionNames()) {
    const opt = document.createElement('option');
    opt.setAttribute('value', f);
    opt.innerText = f;
    colorSpaceMenu.append(opt);
  }
}

//// MAIN LOOP ////


const numCircles = 64;
let circles = new CircleField(ctx, numCircles);
let animateLightness = true;
populateColorSpaceMenu();

draw();
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  out.innerText = `(${relativeMouseX}, ${relativeMouseY})`;
  circles.draw(animateLightness);
  
  if (!stopped) {
    requestAnimationFrame(draw);
  }
}
