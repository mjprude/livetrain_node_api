const expect = require('chai').expect;
const feedParser = require('../../lib/utils/feedParser');
const feedUpdate = require('../factories/feedUpdate');

// const feedUpdate1 = 
describe('feedParser', function() {
  beforeEach(function() {
    this.update = feedUpdate(1000, {
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
  });
  it('formats the raw JSON for a single line after a single request', function() {
    const expectedOutput = {
      '000001_L..N': [
        { stopId: 'stop0', arrival: 1200, departure: 1200 },
        { stopId: 'stop1', arrival: 1300, departure: 1300 },
        { stopId: 'stop2', arrival: 1400, departure: 1400 }
      ],
      '000002_L..S': [
        { stopId: 'stopA', arrival: 1000, departure: 1000 },
        { stopId: 'stopB', arrival: 2000, departure: 2000 },
        { stopId: 'stopC', arrival: 3000, departure: 3000 }
      ]
    };
    expect(feedParser(this.update)).to.deep.eq(expectedOutput);
  });
});
