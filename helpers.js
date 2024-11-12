import chalk from 'chalk';

export const green = (...args) => chalk.green(...args);
export const red = (...args) => chalk.red(...args);

export const prettyLog = (data, options = { space: false, onlyValues: false }) => {
  Object.keys(data).forEach((key) => {
    const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
    options.onlyValues
      ? console.log(green(data[key]))
      : console.log(`${formattedKey}: ${green(data[key])}`);
  });
  if (options.space) console.log('\n');
};
