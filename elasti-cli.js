'use strict';

const fs = require('fs');
const request = require('request');
const commander = require('commander');
const pkg = require('./package.json');

const fullUrl = (path = '') => {
  let url = `http://${commander.host}:${commander.port}/`;
  if (commander.index) {
    url += commander.index + '/';
    if (commander.type) {
      url += commander.type + '/';
    }
  }
  return url + path.replace(/^\/*/, '');  // avoid extra slash in the URL
};

const handleResponse = (err, res, body) => {
  if (commander.json) {
    console.log(JSON.stringify(err || body));
  }
  else {
    if (err) { throw err; }
    console.log(body);
  }
}

commander
  .version(pkg.version)
  .description(pkg.description)
  .usage('[options] <command> [...]')
  .option('-o, --host <hostname>', 'hostname [localhost]', 'localhost')
  .option('-p, --port <number>', 'port number [9200]', '9200')
  .option('-j, --json', 'format output as JSON')
  .option('-i, --index <name>', 'which index to use')
  .option('-t, --type <type>', 'default type for bulk operations');

commander
  .command('url [path]')
  .description('generate the URL for the options and path (default is /)')
  .action((path='') => console.log(fullUrl(path)));

commander
  .command('get [path]')
  .description('perform a HTTP GET request for path (default is /)')
  .action((path='/') => {
    const options = {
      url: fullUrl(path),
      json: commander.json,
    };
    request(options, (err, res, body) => {
      if (commander.json) {
        console.log(JSON.stringify(err || body));
      }
      else {
        if (err) { throw err; }
        console.log(body);
      }
    });
  });

commander
  .command('create-index')
  .description('create an index')
  .action(() => {
    if (!commander.index) {
      const msg = 'No index specified! Use --index <name>';
      if (!commander.json) { throw Error(msg); }
      console.log(JSON.stringify({ error: msg }));
      return;
    }
    request.put(fullUrl(), handleResponse);
  });

commander
  .command('list-indices')
  .alias('li')
  .description('get a list of indices')
  .action(() => {
    const path = commander.json ? '_all' : '_cat/indices?v';
    request({ url: fullUrl(path), json: commander.json }, handleResponse);
  });

commander
  .command('bulk-insert <file>')
  .description('read and perform bulk inserts from the specified file')
  .action((file) => {
    fs.stat(file, (err, stats) => {
      if (err) {
        if (commander.json) {
          console.log(JSON.stringify(err));
          return;
        }
        throw err;
      }

      const options = {
        url: fullUrl('_bulk'),
        json: true,
        headers: {
          'content-length' : stats.size,
          'content-type' : 'application/x-ndjson'
        }
      };

      const req = request.post(options);
      const stream = fs.createReadStream(file);
      stream.pipe(req);
      req.pipe(process.stdout);
    });
  });

commander.parse(process.argv);

if(!commander.args.filter(arg => typeof arg === 'object').length) {
  commander.help();
}
