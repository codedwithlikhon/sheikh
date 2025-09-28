// Welcome to CodeAct AI Agent!
// This is a sample JavaScript file to get you started.

console.log("Hello, World!");

// Example function
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Test the function
console.log("Fibonacci sequence:");
for (let i = 0; i < 10; i++) {
  console.log(`fib(${i}) = ${fibonacci(i)}`);
}

// Example async function
async function fetchData() {
  try {
    const response = await fetch('https://api.github.com/users/octocat');
    const data = await response.json();
    console.log('GitHub user data:', data);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Uncomment to test async function
// fetchData();
