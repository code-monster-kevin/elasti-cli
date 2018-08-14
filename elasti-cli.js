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

commander.parse(process.argv);

if(!commander.args.filter(arg => typeof arg === 'object').length) {
  commander.help();
}
