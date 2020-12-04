#! /usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs')

const name = process.argv[2];
const yarnFlag = process.argv[3];

if (!name || name.match(/[<>:"\/\\|?*\x00-\x1F]/)) {
  if (!yarnFlag || !yarnFlag.match(/^-(-yarn|y)$/)) {
    return console.log(`
    Invalid directory name.
    Usage: create-simple-api name-of-api [-y|--yarn]
  `);
  }
}

const repoURL = 'https://github.com/rizama/simple-api-starter.git';
const directory = `${name}/.git`

runCommand('git', ['clone', repoURL, name])
  .then(() => {
    return rm(directory)
  }).then(() => {
    console.log('Installing dependencies...');

    //Check if operative system is windows to pass npm.cmd or npm
    let command = 'npm';
    if (/^win/.test(process.platform)) {
      command = 'npm.cmd'
    } else if (yarnFlag && /^win/.test(process.platform)) {
      command = 'yarn.cmd'
    } else if (yarnFlag) {
      command = 'yarn'
    }

    return runCommand(command, [yarnFlag ? "" : "install"], {
      cwd: process.cwd() + '/' + name
    });
  }).then(() => {
    console.log('');
    console.log('Done! 🏁');
    console.log('');
    console.log('To get started:');
    console.log('cd', name);
    console.log(yarnFlag ? "yarn dev" : "npm run dev");
  });

function runCommand(command, args, options = undefined) {
  const spawned = spawn(command, args, options);

  return new Promise((resolve) => {
    spawned.stdout.on('data', (data) => {
      console.log(data.toString());
    });

    spawned.stderr.on('data', (data) => {
      console.error(data.toString());
    });

    spawned.on('close', () => {
      resolve();
    });
  });
}

//Replace rm command as a function to Work also on Windows (PowerShell/cmd)
function rm(path) {
  return new Promise((resolve) => {
    fs.rmdir(path, { recursive: true }, (err) => {
      if (err) {
        console.error('Error removing file :', err);
      } else {
        //Optional , show or not message if folder deleted?
        console.log(`${path} is deleted!`);
        resolve();
      }
    });
  });
}
