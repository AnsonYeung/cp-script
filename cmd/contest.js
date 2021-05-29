const net = require('../utils/net');
const path = require('path');
const problem = require('../utils/problem');

exports.command = 'contest <name>';

exports.describe = 'Create a directory with the name supplied and listen for the problems';

exports.builder = yargs => {
    return yargs.positional('name', {
        describe: 'name of the contest'
    });
};

exports.handler = async argv => {
    let basePath = path.resolve(process.env.CP, 'contests', argv.name);
    const server = net.server(argv.port);
    let firstProblem = await server.getNext();
    let batchId = firstProblem.batch.id;
    let size = firstProblem.batch.size;
    let problemsPromise = [problem.makeProblem(path.resolve(basePath, firstProblem.name), firstProblem)];
    while (size !== 1) {
        let nextProblem = await server.getNext();
        if (nextProblem.batch.id === batchId) {
            let problemPath = path.resolve(basePath, nextProblem.name);
            problemsPromise.push(problem.makeProblem(problemPath, nextProblem));
            --size;
        }
    }
    server.close();
    await Promise.all(problemsPromise);
    process.exit();
};