const http = require('http');
const events = require('events');

exports.server = function (port) {
	let buffer = [];
	let serverEventEmitter = new events.EventEmitter();
	let server  = http.createServer(function(req, res) {
		if (req.method == 'POST') {
			let buf = '';
			req.on('data', data => {
				buf += data; 
			});
			req.on('end', () => {
				buffer.push(JSON.parse(buf));
				serverEventEmitter.emit('problemAdded');
				res.writeHead(200);
				res.end();
			}); 
		} else { 
			res.writeHead(404);
			res.end(); 
		}
	}).listen(port);
	return {
		buffer,
		serverEventEmitter,
		getNext: async () => {
			if (buffer.length != 0) {
				return buffer.shift();
			} else {
				return new Promise(resolve => {
					serverEventEmitter.once("problemAdded", () => {
						resolve(buffer.shift());
					});
				});
			}
		},
		close: server.close.bind(server)
	};
};
