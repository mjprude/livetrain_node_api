const update0 = require('./g-train-0');
const update1 = require('./g-train-1');
const stopInterval = 10

module.exports = function mockUpdate(callCount = 0) {
  return (req, res) => {
    const fixture = [update0, update1][callCount % 2];
    callCount++;
    const currentTime = Math.round(Date.now() / 1000);
    const response = fixture.map((trip) => {
      let firstStopTime = currentTime - stopInterval / 2;
      trip.stops = trip.stops.map((stop, i) => {
        const stopTime = firstStopTime + stopInterval * i;
        return Object.assign(stop, { arrival: stopTime, departure: stopTime });
      })
      return trip;
    });
    res.send(response);
  }
}

