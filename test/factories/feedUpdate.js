module.exports = function jsonFeedUpdate(time, updates) {
  const start_date = _getStartDate(time);
  let id = 0;
  let entity = []

  Object.keys(updates).forEach(trip_id => {
    const stop_time_update = updates[trip_id] || [];
    const route_id = trip_id.split('_')[1][0];

    entity.push({
      id,
      "is_deleted": false,
      "trip_update": {
        "trip": {
          trip_id,
          route_id,
          "direction_id": null,
          "start_time": null,
          start_date,
          "schedule_relationship": null
        },
        "vehicle": null,
        "stop_time_update": stop_time_update.map(update => {
          const {
            stop_id = 'A53N',
            arrival = time + id,
            departure = arrival
          } = update;

          return {
            "stop_sequence": null,
            stop_id,
            "arrival": {
              "delay": null,
              "time": {
                "low": arrival,
                "high": 0,
                "unsigned": false
              },
              "uncertainty": null
            },
            "departure": {
              "delay": null,
              "time": {
                "low": departure,
                "high": 0,
                "unsigned": false
              },
              "uncertainty": null
            },
            "schedule_relationship": 0
          };
        }),
        "timestamp": null,
        "delay": null
      },
      "vehicle": null,
      "alert": null
    });
    entity.push({
      id: id + 1,
      is_deleted: false,
      trip_update: null,
      vehicle: {
        trip: {
          trip_id,
          route_id,
          direction_id: null,
          start_time: null,
          start_date,
          schedule_relationship: null
        },
        vehicle: null,
        position: null,
        current_stop_sequence: 21,
        stop_id: null,
        current_status: 1,
        timestamp: {
          low: time,
          high: 0,
          unsigned: true
        },
        congestion_level: null,
        occupancy_status: null
      },
      alert: null
    });
    id = id + 2;
  });
  return {
    "header": {
      "gtfs_realtime_version": "1.0",
      "incrementality": 0,
      "timestamp": {
        "low": time,
        "high": 0,
        "unsigned": true
      }
    },
    entity
  };
}

function _getStartDate(time) {
  const date = new Date(time);
  const isoDate = date.toISOString();
  const yearMonthDay = isoDate.match(/(\d{4})-(\d{2})-(\d{2})/).slice(1, 4);
  return yearMonthDay.join('');
}
