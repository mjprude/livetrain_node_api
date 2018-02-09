const expect = require('chai').expect;
const feedUpdate = require('../factories/feedUpdate');
const v1Update = require('../../lib/utils/v1/v1Update');

describe('v1Update', function() {
  it('returns a function', function() {
    const update = feedUpdate(1000, {
      '000001_L..N': [
        { stop_id: 'stop0', arrival: 1200 },
        { stop_id: 'stop1', arrival: 1300 },
        { stop_id: 'stop2', arrival: 1400 }
      ],
      '000002_L..S': [
        { stop_id: 'stopA', arrival: 1000 },
        { stop_id: 'stopB', arrival: 2000 },
        { stop_id: 'stopC', arrival: 3000 }
      ]
    });
    expect(v1Update).to.be.instanceOf(Function);
  });
});
