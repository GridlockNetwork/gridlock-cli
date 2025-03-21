# Gridlock SDK Example

This directory contains example code demonstrating how to use the Gridlock SDK.

## How to Run

You can run the example in two modes:

### Automatic Mode (Default)

```bash
npm run build
node dist/example/exampleUsage.js
```

In automatic mode, the example will run through all steps without pausing. If an error occurs, the script will stop execution. This mode is best for quick testing of the entire workflow.

### Interactive Mode

```bash
npm run build
node dist/example/exampleUsage.js --interactive
```

In interactive mode, the example will pause at each step and wait for you to press a key to continue. If an error occurs, you will be given the option to continue to the next step despite the error.

## Error Handling

- **Automatic Mode**: Any error will halt execution of the script
- **Interactive Mode**: Upon error, you can choose to continue or stop execution

This allows for more rigorous testing in automatic mode (where any issues cause the script to stop), while providing flexibility during development and debugging in interactive mode.

## Configuration

You can modify the configuration in `initGridlock.ts`:

- `API_KEY`: Your API key for accessing the Gridlock network
- `BASE_URL`: The URL of the Gridlock API
- `DEBUG_MODE`: Enable/disable verbose logging
- `autoRun`: Default behavior for waiting for user input between steps

## Steps Demonstrated

The example demonstrates the following Gridlock SDK features:

1. Creating a new user
2. Adding a Cloud Guardian
3. Adding a Gridlock Guardian
4. Adding a Partner Guardian
5. Creating a Wallet
6. Signing a Message
7. Verifying a Signature
8. Account Recovery
9. Verifying Recovery Success

## Command Line Options

- `--interactive`, `-i`: Run the example in interactive mode (pause between steps)
- `--help`, `-h`: Show help information
