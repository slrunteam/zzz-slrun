module.exports = { add, sub, mul, div, mod, default: defaultFunction }

function defaultFunction (x, y) {
  return `(x = ${x}, y = ${y})`
}

function add (x, y) {
  return x + y
}

function sub (x, y) {
  return x - y
}

function mul (x, y) {
  return x * y
}

function div (x, y) {
  return x / y
}

function mod (x, y) {
  return x % y
}
