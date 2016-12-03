import { spawn as Spawn } from 'child-process-promise';
import Fs from 'fs-extra-promise';
import Promise from 'bluebird';


function runCommand(command, options) {
  return new Promise((resolve, reject) => {
      console.log('fff');
      resolve(true);
    })
    // return Spawn(`hg ${command} ${options}`, [], { capture: ['stdout', 'stderr'] });
}

export default class HgRepo {
  /*
  Create a HgRepo with a root path defined by the passed in `@path`
  (defaults to `process.cwd()`)
  */
  constructor(path = process.cwd()) {
    this.path = path;
    Fs.mkdirs(path);
  }

  /*
  Initialize a new repository at the provided path.
  */
  init() {
    return runCommand('init', this.path);
  }

  clone(from) {
    return runCommand('clone', [this.path, from]);
  }
}

export const __useDefault = true;
