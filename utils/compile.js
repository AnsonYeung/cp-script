const childProcess = require('child_process');
const path = require('path');

module.exports = (outFilename, dir) => {
    let compiler = childProcess.spawn('g++', ['-std=c++17', '-ggdb3', '-march=native', '-DLOCAL', '-Wall', '-o', path.resolve(dir, outFilename), path.resolve(dir, 'solution.cpp')], {
        stdio: ['ignore', 'inherit', 'inherit'],
    });
    return new Promise((res, rej) => {
        compiler.on('close', async code => {
            if (code != 0) {
                console.log(`gcc exited with code ${code}`);
                rej();
                return;
            }
            res();
        });
    });

};