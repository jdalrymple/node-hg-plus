import { spawn as Spawn } from 'child-process-promise';
import Fs from 'fs-extra-promise';
import Promise from 'bluebird';


function runCommand(command, options) {
  return Spawn(`hg ${command} ${options}`, [], { capture: ['stdout', 'stderr'] })
    .catch(() => {});
}

class HgRepo {
  /*
  Create a HgRepo with a root path defined by the passed in `@path`
  (defaults to `process.cwd()`)
  */
  constructor(path = process.cwd()) {
    this.path = path;
    return Fs.mkDirAsync(path);
  }

  /*
  Initialize a new repository at the provided path.
  */
  init() {
    return runCommand('init', this.path);
  }
}


const HgRepoExport = new HgRepo();

export default HgRepoExport;
