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

    

    describe('baseline', () => {
        it('should parse basline value', () => {
            const yargsCmd = yargs.command(cli);
            const yargsResult = yargsCmd.parse(
                'cli --baseline', {}
            );
            expect(yargsResult.baseline).to.be.true;
            expect(yargsResult.b).to.be.true;
        });

        it('should parse basline value when using alias', () => {
            const yargsCmd = yargs.command(cli);
            const yargsResult = yargsCmd.parse(
                'cli -b', {}
            );
            expect(yargsResult.baseline).to.be.true;
            expect(yargsResult.b).to.be.true;
        });
    }); 

    describe('report', () => {
        it('should parse report value', () => {
            const yargsCmd = yargs.command(cli);
            const yargsResult = yargsCmd.parse(
                'cli --report', {}
            );
            expect(yargsResult.report).to.be.true;
            expect(yargsResult.r).to.be.true;
        });

        it('should parse report value when using alias', () => {
            const yargsCmd = yargs.command(cli);
            const yargsResult = yargsCmd.parse(
                'cli -r', {}
            );
            expect(yargsResult.report).to.be.true;
            expect(yargsResult.r).to.be.true;
        });
    });  
    
    describe('list', () => {
        it('should parse list value', () => {
            const yargsCmd = yargs.command(cli);
            const yargsResult = yargsCmd.parse(
                'cli --list', {}
            );
            expect(yargsResult.list).to.be.true;
            expect(yargsResult.l).to.be.true;
        });

        it('should parse report value when using alias', () => {
            const yargsCmd = yargs.command(cli);
            const yargsResult = yargsCmd.parse(
                'cli -l', {}
            );
            expect(yargsResult.list).to.be.true;
            expect(yargsResult.l).to.be.true;
        });
    });

    describe('grep', () => {
        it('should parse grep value', () => {
            const yargsCmd = yargs.command(cli);
            const yargsResult = yargsCmd.parse(
                'cli --grep append-baseline', {}
            );
            expect(yargsResult.grep).to.equal('append-baseline');
            expect(yargsResult.g).to.equal('append-baseline');
        });

        it('should parse grep value when using alias', () => {
            const yargsCmd = yargs.command(cli);
            const yargsResult = yargsCmd.parse(
                'cli -g append-baseline', {}
            );
            expect(yargsResult.grep).to.equal('append-baseline');
            expect(yargsResult.g).to.equal('append-baseline');
        });
        
        it('should show error msg when arg not passed to grep', async() => {
            const yargsCmd = yargs.command(cli);
            const output = await new Promise((resolve) => {
                yargsCmd.parse("cli -g", (err, argv, output) => {
                  resolve(output);
                })
            });
            expect(output).to.contain("Not enough arguments following: g");
        });
    });

    describe('stressLimit', () => {
        it('should parse stressLimit value', () => {
            const yargsCmd = yargs.command(cli);
            const yargsResult = yargsCmd.parse(
                'cli --stressLimit 300', {}
            );
            expect(yargsResult.stressLimit).to.equal(300);
        });
        
        it('should show error msg when arg not passed to stressLimit', async() => {
            const yargsCmd = yargs.command(cli);
            const output = await new Promise((resolve) => {
                yargsCmd.parse("cli --stressLimit", (err, argv, output) => {
                  resolve(output);
                })
            });
            expect(output).to.contain("Not enough arguments following: stressLimit");
        });
    });

    describe('baselineLimit', () => {
        it('should parse baselineLimit value', () => {
            const yargsCmd = yargs.command(cli);
            const yargsResult = yargsCmd.parse(
                'cli --baselineLimit 1000', {}
            );
            expect(yargsResult.baselineLimit).to.equal(1000);
        });
        
        it('should show error msg when arg not passed to baselineLimit', async() => {
            const yargsCmd = yargs.command(cli);
            const output = await new Promise((resolve) => {
                yargsCmd.parse("cli --baselineLimit", (err, argv, output) => {
                  resolve(output);
                })
            });
            expect(output).to.contain("Not enough arguments following: baselineLimit");
        });
    });

    describe('logLimit', () => {
        it('should parse logLimit value', () => {
            const yargsCmd = yargs.command(cli);
            const yargsResult = yargsCmd.parse(
                'cli --logLimit 1000', {}
            );
            expect(yargsResult.logLimit).to.equal(1000);
        });
        
        it('should show error msg when arg not passed to logLimit', async() => {
            const yargsCmd = yargs.command(cli);
            const output = await new Promise((resolve) => {
                yargsCmd.parse("cli --logLimit", (err, argv, output) => {
                  resolve(output);
                })
            });
            expect(output).to.contain("Not enough arguments following: logLimit");
        });
    });

});
