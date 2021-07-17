const compile = require('../utils/compile');
const childProcess = require('child_process');

const outFilename = process.platform == 'win32' ? 'solution.exe' : 'solution';

exports.command = 'debug [testId] [problemDir]';

exports.describe = 'Compile and debug the solution';

exports.builder = yargs => {
    return yargs
        .positional('testId', {
            describe: 'the id of the test to be run (-1 to specify manual input)',
            default: 0
        })
        .positional('problemDir', {
            descirbe: 'the directory of the problem',
            default: process.cwd
        });
};

exports.handler = async argv => {
    compile(outFilename, argv.problemDir).then(() => {
        let runCmd = 'run';
        if (argv.testId != -1) {
            runCmd = 'run <tests/' + argv.testId + '/' + argv.testId + '.in';
        }
        childProcess.spawn('gdb', ['-ex', 'b main', '-ex', runCmd, outFilename], {
            stdio: ['inherit', 'inherit', 'inherit']
        });
    });
};