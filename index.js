#!/usr/bin/env node
const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');

const argv = yargs(hideBin(process.argv))
	.scriptName('cps')
	.commandDir('cmd')
	.option('port', {
		'alias': 'p',
		'type': 'number',
		'description': 'the port to listen for competitive companion',
		'default': 10043
	})
	.help('help')
	.alias('h', 'help')
	.alias('v', 'version')
	.argv;
