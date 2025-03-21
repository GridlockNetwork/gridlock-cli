#!/usr/bin/env node

// Check if we're running the example or the main CLI
const args = process.argv.slice(2);
const isExampleCommand = args[0] === 'run-example';

if (isExampleCommand) {
  // Forward to example runner with any additional arguments
  const exampleArgs = args.slice(1);
  process.argv = [process.argv[0], process.argv[1], ...exampleArgs];
  import('../dist/example/exampleUsage.js');
} else {
  // Forward to main CLI
  import('../dist/gridlock.js');
}
