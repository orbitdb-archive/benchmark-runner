const expect  = require('chai').expect;
const sinon = require('sinon');
const reporter = require('../report');

describe('ReporterTest', () => {
    it('should print empty line when no data passed', () => {
        sinon.spy(process.stdout, 'write');
        reporter([]);
        expect(process.stdout.write.called).to.be.true;
        expect(process.stdout.write.calledWithExactly('\n')).to.be.true;
    });
});
