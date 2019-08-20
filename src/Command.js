import { exec } from 'child_process';
import { asCallback } from './Utils';

export function run(command, directory = process.cwd(), options = []) {
  return new Promise((resolve, reject) => {
    const commandString = `${command} ${options.join(' ')}`;

    exec(commandString, { cwd: directory }, (error, stdout, stderr) => {
      const output = { error, stdout, stderr };

      if (error) {
        reject(output);
        return;
      }

      resolve(output);
    });
  });
}

export async function runWithHandling(
  command,
  directory = process.cwd(),
  options = [],
  done,
) {
  let output;

  try {
    output = await run(command, directory, options);
  } catch (error) {
    output = { error };
  }

  return asCallback(output.error, output.stdout, done);
}
