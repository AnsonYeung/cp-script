const fs = require('fs-extra');
const path = require('path');

exports.makeProblem = async function (p, problem, templateName) {
    console.log(`Making problem "${problem.name}"`);
    await fs.ensureDir(p);
    let problemFileTask = fs.writeJSON(path.resolve(p, 'problem.json'), problem);
    let solutionFileTask = fs.copyFile(path.resolve(process.env.CP, 'templates', templateName), path.resolve(p, 'solution.cpp'))
        .then(() => {
            return fs.chmod(path.resolve(p, 'solution.cpp'), 0o644);
        });
    let inputFileTasks = [];
    for (let i in problem.tests) {
        let inputFilename = problem.input.type === 'file' ? problem.input.fileName : `${i}.in`;
        inputFileTasks.push(fs.ensureDir(path.resolve(p, 'tests', i.toString())).then(() => {
            return fs.writeFile(path.resolve(p, 'tests', i.toString(), inputFilename), problem.tests[i].input);
        }));
    }
    await Promise.all([problemFileTask, solutionFileTask, ...inputFileTasks]);
    console.log(`Created problem "${problem.name}"`);
};
