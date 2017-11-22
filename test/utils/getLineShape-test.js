const expect = require('chai').expect;
const {
  reversedShuttleShape,
  shuttleShape,
  stop107to104
} = require('../fixtures/lineShapes');
const {
  getLineShape,
  _resetCache
}= require('../../lib/utils/v1/getLineShape');

describe('getLineShape', function() {
  afterEach(function before() {
    _resetCache();
  });

  it('returns a function', function() {
    expect(getLineShape).to.be.instanceOf(Function);
  });

  it('returns an array of corridintates between two adjacent stops', function() {
    const timesSquare = '901';
    const grandCentral = '902';
    expect(getLineShape(grandCentral, timesSquare, 'GS')).to.include.ordered.members(shuttleShape);
  });

  it('returns an array of corridintates between two adjacent stops going the other way', function() {
    const timesSquare = '901';
    const grandCentral = '902';
    expect(getLineShape(timesSquare, grandCentral, 'GS')).to.include.ordered.members(reversedShuttleShape);
  });

  it('returns the shape between two non-adjacent stops on the normal line', function() {
    const start = '107';
    const end = '104';
    expect(getLineShape(start, end, '1')).to.include.ordered.members(stop107to104);
  });

  it('returns the shape between two non-adjacent stops when the train is running on a different line', function() {
    const start = '107';
    const end = '104';
    expect(getLineShape(start, end, '5')).to.include.ordered.members(stop107to104);
  });
});
