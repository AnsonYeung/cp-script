const net = require('../utils/net');
const path = require('path');
const problem = require('../utils/problem');

exports.command = 'problem [name]';

exports.describe = 'Create a problem with the name';

exports.builder = yargs => {
    return yargs.positional('name', {
        describe: 'name of the problem',
        default: null
    });
};

exports.handler = async argv => {
    const server = net.server(argv.port);
    let targetProblem = await server.getNext();
    let problemTask = problem.makeProblem(
        path.resolve(process.env.CP, 'problems', argv.name == null ? path.join(targetProblem.group, targetProblem.name) : argv.name),
        targetProblem,
        argv.template
    );
    server.close();
    await problemTask;
    process.exit();
};
