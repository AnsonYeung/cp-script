const pidusage = require('pidusage');
const childProcess = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const { write } = require('fs');

exports.command = 'test [problemDir]';

exports.describe = 'Test the solution with the sample data';

exports.builder = yargs => {
    return yargs.positional('problemDir', {
        descirbe: 'the directory of the problem',
        default: process.cwd
    });
};

exports.handler = async argv => {
    let problemJsonTask = fs.readJson(path.join(argv.problemDir, 'problem.json'));
    let compiler = childProcess.spawn('g++', ['-std=c++17', '-ggdb3', '-march=native', '-DLOCAL', '-Wall', '-o', 'solution.exe', 'solution.cpp'], {
        stdio: ['ignore', 'inherit', 'inherit'],
    });
    compiler.on('close', async code => {
        if (code != 0) {
            console.log(`gcc exited with code ${code}`);
            return;
        }

        let problemJson = await problemJsonTask;

        let testArray = [];

        for (let i in problemJson.tests) {
            let filename = problemJson.input.type === 'file' ? problemJson.input.fileName : i.toString() + '.in';
            testArray.push(fs.open(path.resolve(argv.problemDir, 'tests', i.toString(), filename), 'r').then(fd => {
                let progEnd = new Promise(res => {
                    let memUsage = 0;
                    let output = '';
                    let startTime = process.hrtime.bigint();
                    let rte = false;
                    let solutionProcess = childProcess.spawn(path.resolve(argv.problemDir, 'solution.exe'), {
                        cwd: path.resolve(argv.problemDir, 'tests', i.toString()),
                        stdio: [fd, 'pipe', 'inherit']
                    });
                    let memMonitor = () => {
                        pidusage(solutionProcess.pid, (err, stats) => {
                            if (err && err.code === 'ENOENT') return;
                            if (err) throw err;
                            memUsage = Math.max(memUsage, stats.memory);
                        });
                    };
                    memMonitor();
                    solutionProcess.on('close', code => {
                        let endTime = process.hrtime.bigint();
                        let time = Number(endTime - startTime) / 1000000;
                        if (code !== 0) rte = true;
                        if (problemJson.output.type === 'file') {
                            res(fs.readFile(path.resolve(argv.problemDir, 'tests', i.toString(), problemJson.output.fileName), {encoding: 'utf8'}).then(output => {
                                return {
                                    output,
                                    time,
                                    memUsage,
                                    rte
                                };
                            }));
                        } else {
                            res({
                                output,
                                time,
                                memUsage,
                                rte
                            });
                        }
                    });
                    solutionProcess.on('error', () => {
                        rte = true;
                    });
                    solutionProcess.stdout.setEncoding('utf8');
                    solutionProcess.stdout.on('data', (data) => {
                        output += data;
                    });
                    setTimeout(solutionProcess.kill.bind(solutionProcess), problemJson.timeLimit + 1000);
                });
                let tle = new Promise(res => {
                    setTimeout(res.bind(null, {
                        output: '',
                        time: problemJson.timeLimit + 1000,
                        memUsage: 0,
                        rte: false
                    }), problemJson.timeLimit + 1000);
                });
                return Promise.any([progEnd, tle]).then(result => {
                    if (result.time > problemJson.timeLimit) {
                        return {
                            status: 'Time Limit Exceeded',
                            accepted: false
                        };
                    } else if (result.memUsage > problemJson.memoryLimit * 1024 * 1024) {
                        return {
                            status: 'Memory Limit Exceeded',
                            accepted: false
                        };
                    } else if (result.rte) {
                        return {
                            status: 'Runtime Error',
                            accepted: false
                        };
                    } else if (result.output.trim().split('\r\n').join('\n') !== problemJson.tests[i].output.trim()) {
                        return {
                            status: 'Wrong Answer',
                            accepted: false,
                            output: result.output.trim(),
                            expected: problemJson.tests[i].output.trim()
                        }
                    } else {
                        return {
                            status: 'Accepted',
                            accepted: true
                        }
                    }
                })
            }));
        }

        let results = await Promise.all(testArray);

        let accepted = 0;

        for (let i in results) {
            if (results[i].accepted) ++accepted;
            else {
                console.log(`Test ${i}: ${results[i].status}`);
                if (results[i].status == 'Wrong Answer') {
                    console.log(
`Your Answer:
${results[i].output}
Jury's Answer:
${results[i].expected}`
                    );
                }
            }
        }

        if (accepted === results.length) {
            console.log('All tests passed');
        } else {
            console.log(`${accepted} of ${results.length} total tests are passed`);
        }

    })
};