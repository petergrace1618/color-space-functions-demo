//// DOM ELEMENTS ////

const canvas = $('#canvas');
const ctx = canvas.getContext('2d');
const colorSpaceMenu = $('#color-space-menu');
const stopBtn = $('#btn');
const refreshBrn = $('#refresh');
const out = $('output');

//// CLASSES ////

class CircleField {
  constructor(
    n = 1, 
    ctx = document.querySelector('canvas').getContext('2d')
  ) {
    this.ctx = ctx;
    this.minRadius = 2;
    this.maxRadius = 
      parseInt(getComputedStyle(ctx.canvas)['font-size']);
    this.circles = this.init(n);
  }

  init(n) {
    this.canvasDiagonal = Math.hypot(
      this.ctx.canvas.width,
      this.ctx.canvas.height,
    );
    return Array.from({length: n}, () => {
      const r = rnd(this.minRadius, this.maxRadius);
      return new Circle( 
        rnd(r, canvas.width - r),
        rnd(r, canvas.height - r),
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
      const color = this.colorSpaceFunctions['lab'] (
        d, circle, animateLightness
      );
      circle.draw(color);
      // console.log(color);
    }  
  }

  colorSpaceFunctions = {

    "lab": (d, circle, animateLightness) => {
      // default lightness value
      let l = 0; 
      if (animateLightness) {
        l = lerp(0, 100, easeInExpo(1 - d / this.canvasDiagonal));
      }
      const a = lerp(-150, 150, circle.x / canvas.width);
      const b = lerp(-150, 150, circle.y / canvas.height);
      return `lab(${l} ${a} ${b})`;    },

    "hsl": () => {
    },

    "hwb": () => {
    }
  };
  
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
  circles = new CircleField(numCircles);
})


canvas.addEventListener('click', () => {
})


function populateColorSpaceMenu() {
  // for (f of Object.keys(colorSpaceFunctions)) {

  // }
}

//// MAIN LOOP ////

populateColorSpaceMenu();

const numCircles = 64;
let circles = new CircleField(numCircles);
let animateLightness = true;

draw();
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  out.innerText = `(${relativeMouseX}, ${relativeMouseY})`;
  circles.draw(animateLightness);
  
  if (!stopped) {
    requestAnimationFrame(draw);
  }
}
