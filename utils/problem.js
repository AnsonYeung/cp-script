const fs = require('fs-extra');
const path = require('path');

exports.makeProblem = async function (p, problem) {
    await fs.ensureDir(p);
    let problemFileTask = fs.writeJSON(path.resolve(p, 'problem.json'), problem);
    let solutionFileTask = fs.copyFile(path.resolve(process.env.CP, 'templates', 'default.cpp'), path.resolve(p, 'solution.cpp'));
    await Promise.all([problemFileTask, solutionFileTask]);
    console.log('Created problem ', problem.name);
};