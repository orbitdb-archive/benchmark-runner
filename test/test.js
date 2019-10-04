const assert = require('assert');
const sinon = require('sinon');
const reporter = require('../report');

describe('ReporterTest', () => {
    it('should print empty line when no data passed', () => {
        sinon.spy(process.stdout, 'write');
        reporter([]);
        assert.equal(process.stdout.write.called, true);
    });
});
