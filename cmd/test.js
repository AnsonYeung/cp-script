exports.command = 'test [problemDir]';

exports.describe = 'Test the solution with the sample data';

exports.builder = yargs => {
    return yargs.positional('problemDir', {
        descirbe: 'the directory of the problem',
        default: process.cwd
    });
};

exports.handler = argv => {

};