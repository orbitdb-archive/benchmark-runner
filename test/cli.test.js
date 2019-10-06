const yargs = require('yargs');
const cli = require('../cli');
const expect  = require('chai').expect;

describe('CLI Test', () => {

    it('should return help output', async() => {
        const parser = yargs.command(cli).help();
        const output = await new Promise((resolve) => {
            parser.parse("--help", (err, argv, output) => {
              resolve(output);
            })
          });
        expect(output).to.contain("baseline");
        expect(output).to.contain("report");
        expect(output).to.contain("list");
        expect(output).to.contain("grep");
        expect(output).to.contain("stressLimit");
        expect(output).to.contain("baselineLimit");
        expect(output).to.contain("logLimit");
    });

});
