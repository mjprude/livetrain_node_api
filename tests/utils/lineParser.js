const expect = require('chai').expect;
const lineParser = require('../../utils/lineParser');
const feedUpdate = require('../factories/feedUpdate');
const x = feedUpdate(1000, [
  {
    route_id: 'L',
    stop_time_update: [
      { stop_id: 'stop1', arrival: 999 },
      { stop_id: 'stop2', arrival: 1001 }
    ]
  },
  {
    route_id: 'L',
    stop_time_update: [
      { stop_id: 'stop3', arrival: 998 },
      { stop_id: 'stop4', arrival: 1002 }
    ]
  }
]);

console.log(x.entity[0].trip_update.stop_time_update[0].departure);
// const feedUpdate1 = 
// describe('fetch', function fetchTest() {
//   beforeEach(function before() {
//     setupDom();
//   });
//
//   it('`open`s and `send`s the request, and adds `onload` and `onerror` functions!', function() {
//   });
// });
