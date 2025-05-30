import chalk from 'chalk';

export const green = (...args: any[]) => chalk.green(...args);
export const red = (...args: any[]) => chalk.red(...args);

interface PrettyLogOptions {
  space?: boolean;
  onlyValues?: boolean;
}

export const prettyLog = (
  data: any,
  options: PrettyLogOptions = { space: false, onlyValues: false }
) => {
  const format = (item: any, depth: number = 0) => {
    const indent = '  '.repeat(depth); // Indentation for nested levels
    if (Array.isArray(item)) {
      console.log(`${indent}${green('[')}`);
      item.forEach((value) => format(value, depth + 1));
      console.log(`${indent}${green(']')}`);
    } else if (typeof item === 'object' && item !== null) {
      console.log(`${indent}${green('{')}`);
      Object.entries(item).forEach(([key, value]) => {
        const formattedKey = chalk.cyan(key); // Key in cyan for clarity
        if (typeof value === 'object') {
          console.log(`${indent}  ${formattedKey}:`);
          format(value, depth + 1);
        } else {
          console.log(`${indent}  ${formattedKey}: ${green(value)}`);
        }
      });
      console.log(`${indent}${green('}')}`);
    } else {
      console.log(`${indent}${green(item)}`);
    }
  };

  format(data);

  if (options.space) console.log('\n');
};
