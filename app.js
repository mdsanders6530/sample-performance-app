// Sample Node.js API with performance issues

const http = require('http');
const fs = require('fs');
const path = require('path');

// Issue 1: Global mutable state that could cause race conditions
let requestCount = 0;

// Issue 2: Synchronous file read - blocks event loop
const config = fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8');

// Issue 3: Inefficient loop with unnecessary array operations
function getUserNames(users) {
  let names = [];
  for (let i = 0; i < users.length; i++) {
    let fullName = users[i].first + ' ' + users[i].last;
    names.push(fullName);
  }
  return names;
}

// Issue 4: N+1 query pattern simulation
function getOrdersWithUsers(orders, allUsers) {
  let result = [];
  for (let order of orders) {
    let user = allUsers.find(u => u.id === order.userId);
    result.push({ ...order, user });
  }
  return result;
}

// Issue 5: Unnecessary JSON parsing/stringifying
function formatData(data) {
  let str = JSON.stringify(data);
  let parsed = JSON.parse(str);
  return JSON.stringify(parsed);
}

// Issue 6: Missing caching - recalculates on every call
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Issue 7: Inefficient string concatenation in loop
function buildQueryString(params) {
  let query = '';
  for (let key in params) {
    query += key + '=' + params[key] + '&';
  }
  return query.slice(0, -1);
}

// Issue 8: Catching all errors without specific handling
function parseJSON(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    console.log('Error: ' + e);
    return null;
  }
}

// Issue 9: Efficient array contains check using native includes()
function hasUserId(userId, userIds) {
  return userIds.includes(userId);
}

// Issue 10: Cloning entire objects unnecessarily
function copyUser(user) {
  let copy = {};
  for (let key in user) {
    copy[key] = user[key];
  }
  return copy;
}

// Mock data
const mockUsers = [
  { id: 1, first: 'John', last: 'Doe' },
  { id: 2, first: 'Jane', last: 'Smith' },
  { id: 3, first: 'Bob', last: 'Johnson' },
];

const mockOrders = [
  { id: 100, userId: 1, amount: 50 },
  { id: 101, userId: 2, amount: 75 },
  { id: 102, userId: 1, amount: 100 },
];

const server = http.createServer((req, res) => {
  requestCount++;

  if (req.url === '/users') {
    const names = getUserNames(mockUsers);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ users: names }));
  } else if (req.url === '/orders') {
    const orders = getOrdersWithUsers(mockOrders, mockUsers);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(orders));
  } else if (req.url === '/fib') {
    const result = fibonacci(35);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ result }));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
