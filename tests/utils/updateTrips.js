const expect = require('chai').expect;
const updateTrips = require('../../lib/utils/updateTrips');

describe('updateTrips', function() {
  context('when trips is empty', function() {
    it('Stores trips by tripId', function() {
      let trips = {};
      const feedUpdate = {
        '000001_L..N': [
          { stop_id: 'stop0', arrival: 1200, departure: 1200 },
          { stop_id: 'stop1', arrival: 1300, departure: 1300 },
          { stop_id: 'stop2', arrival: 1400, departure: 1400 }
        ],
        '000002_L..S': [
          { stop_id: 'stopA', arrival: 1000, departure: 1000 }, { stop_id: 'stopB', arrival: 2000, departure: 2000 },
          { stop_id: 'stopC', arrival: 3000, departure: 3000 }
        ]
      };
      expect(trips).to.deep.eq({});
      trips = updateTrips(trips, feedUpdate, 1000);
      expect(trips).to.deep.eq(feedUpdate);
    });
  });

  context('On subsequent updates (adding/modifying a stop)', function() {
    it('Combines feed updates', function() {
      let trips = {};
      const feedUpdate1 = {
        '000001_L..N': [
          { stop_id: 'stop1', arrival: 1300, departure: 1300 },
          { stop_id: 'stop2', arrival: 1400, departure: 1400 }
        ],
        '000002_L..S': [
          { stop_id: 'stopA', arrival: 1000, departure: 1000 },
          { stop_id: 'stopB', arrival: 2000, departure: 2000 }
        ]
      };

      const feedUpdate2 = {
        '000001_L..N': [
          { stop_id: 'stop1', arrival: 1300, departure: 1300 },
          { stop_id: 'stop2', arrival: 1500, departure: 1500 }
        ],
        '000002_L..S': [
          { stop_id: 'stopA', arrival: 1000, departure: 1000 },
          { stop_id: 'stopB', arrival: 2000, departure: 2000 },
          { stop_id: 'stopC', arrival: 3000, departure: 3000 }
        ]
      };

      expect(trips).to.deep.eq({});
      trips = updateTrips(trips, feedUpdate1, 1000);
      expect(trips).to.deep.eq(feedUpdate1);

      trips = updateTrips(trips, feedUpdate2, 1000);
      expect(trips).to.deep.eq(feedUpdate2);
    });
  });

  context('On subsequent updates (with stops in the past)', function() {
    it('Combines feed updates and removes all but most recent past stops', function() {
      let trips = {};
      const feedUpdate1 = {
        '000001_L..N': [
          { stop_id: 'stop1', arrival: 1000, departure: 1000 },
          { stop_id: 'stop2', arrival: 1100, departure: 1100 },
          { stop_id: 'stop3', arrival: 1500, departure: 1500 }
        ]
      };

      const feedUpdate2 = {
        '000001_L..N': [
          { stop_id: 'stop3', arrival: 1500, departure: 1500 },
          { stop_id: 'stop4', arrival: 1600, departure: 1600 },
        ]
      };

      const expected = {
        '000001_L..N': [
          { stop_id: 'stop2', arrival: 1100, departure: 1100 },
          { stop_id: 'stop3', arrival: 1500, departure: 1500 },
          { stop_id: 'stop4', arrival: 1600, departure: 1600 },
        ]
      };

      expect(trips).to.deep.eq({});
      trips = updateTrips(trips, feedUpdate1, 1000);
      expect(trips).to.deep.eq(feedUpdate1);

      trips = updateTrips(trips, feedUpdate2, 1200);
      expect(trips).to.deep.eq(expected);
    });
  });

  context('On subsequent updates (adding stops to trip)', function() {
    it('Combines feed updates and adds in new stops', function() {
      let trips = {};
      const feedUpdate1 = {
        '000001_L..N': [
          { stop_id: 'stop1', arrival: 1000, departure: 1000 },
          { stop_id: 'stop4', arrival: 1500, departure: 1500 }
        ]
      };

      const feedUpdate2 = {
        '000001_L..N': [
          { stop_id: 'stop2', arrival: 1100, departure: 1100 },
          { stop_id: 'stop3', arrival: 1200, departure: 1200 },
          { stop_id: 'stop4', arrival: 1500, departure: 1500 },
        ]
      };

      const expected = {
        '000001_L..N': [
          { stop_id: 'stop1', arrival: 1000, departure: 1000 },
          { stop_id: 'stop2', arrival: 1100, departure: 1100 },
          { stop_id: 'stop3', arrival: 1200, departure: 1200 },
          { stop_id: 'stop4', arrival: 1500, departure: 1500 }
        ]
      };

      expect(trips).to.deep.eq({});
      trips = updateTrips(trips, feedUpdate1, 1000);
      expect(trips).to.deep.eq(feedUpdate1);

      trips = updateTrips(trips, feedUpdate2, 1100);
      expect(trips).to.deep.eq(expected);
    });
  });

  context('On subsequent updates (removing stops from trip)', function() {
    it('Combines feed updates and adds in new stops', function() {
      let trips = {};
      const feedUpdate1 = {
        '000001_L..N': [
          { stop_id: 'stop1', arrival: 1000, departure: 1000 },
          { stop_id: 'stop2', arrival: 1100, departure: 1100 },
          { stop_id: 'stop3', arrival: 1200, departure: 1200 },
          { stop_id: 'stop4', arrival: 1500, departure: 1500 }
        ]
      };

      const feedUpdate2 = {
        '000001_L..N': [
          { stop_id: 'stop2', arrival: 1100, departure: 1100 },
          { stop_id: 'stop4', arrival: 1500, departure: 1500 },
        ]
      };

      const expected = {
        '000001_L..N': [
          { stop_id: 'stop1', arrival: 1000, departure: 1000 },
          { stop_id: 'stop2', arrival: 1100, departure: 1100 },
          { stop_id: 'stop4', arrival: 1500, departure: 1500 }
        ]
      };

      expect(trips).to.deep.eq({});
      trips = updateTrips(trips, feedUpdate1, 1000);
      expect(trips).to.deep.eq(feedUpdate1);

      trips = updateTrips(trips, feedUpdate2, 1100);
      expect(trips).to.deep.eq(expected);
    });
  });
});
