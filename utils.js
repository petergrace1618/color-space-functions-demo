
function $(selector) {
  return document.querySelector(selector);
}


function $$(selector) {
  return document.querySelectorAll(selector);
}


// Returns a random integer, 0 <= N < r
function rnd(a, b) {
  if (!a) {
    return Math.random();
  } else if (!b) {
    return Math.floor(Math.random() * a);
  } else {
    return a + Math.floor(Math.random() * (b - a));
  }
}

function constrain(n, lowerBound, upperBound) {
  if (n < lowerBound) return lowerBound;
  if (n > upperBound) return upperBound;
  return n;
}

function lerp(a, b, x) {
  return a + (b - a) * x;
}

function easeInQuad(x) {
  return x * x;
}

function easeInQuart(x) {
  return x*x*x*x;
}

function easeInExpo(x) {
  return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
}
