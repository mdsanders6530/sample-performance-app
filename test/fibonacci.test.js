const assert = require('node:assert/strict');
const test = require('node:test');
const { fibonacci } = require('../app');

test('fibonacci returns the expected sequence values', () => {
  assert.equal(fibonacci(-1), -1);
  assert.equal(fibonacci(0), 0);
  assert.equal(fibonacci(1), 1);
  assert.equal(fibonacci(10), 55);
  assert.equal(fibonacci(2.5), 0.5);
});

test('fibonacci computes the /fib endpoint value efficiently', () => {
  assert.equal(fibonacci(35), 9227465);
});
