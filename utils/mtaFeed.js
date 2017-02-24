var GtfsRealtimeBindings = require('gtfs-realtime-bindings');
var request = require('request');
const apiKey = process.env.MTA_REALTIME_API_KEY;

/**
 * mtaJsonFeedMessage
 *
 * Takes a feed ID (see http://datamine.mta.info/list-of-feeds) and parses the
 * protocol buffer response returned by the MTA into JSON wrapped by a Promise
 *
 * @param feedId
 * @returns {Promise wrapped JSON}
 */
module.exports = function mtaJsonFeedMessage(feedId) {
  const url = mtaFeedUrl(feedId);
  const requestSettings = {
    method: 'GET',
    url,
    encoding: null
  };

  return new Promise((resolve, reject) => {
    request(requestSettings, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        try {
          const feed = GtfsRealtimeBindings.FeedMessage.decode(body);
          resolve(feed || []);
        } catch (err) {
          reject(err);
        }
      } else {
        reject(error);
      }
    });
  });
};

/**
 * mtaFeedUrl
 *
 * Takes a feed ID (see http://datamine.mta.info/list-of-feeds) and an MTA
 * realtime API key (reads from ENV by default) and returns a URL
 *
 * @param feedId
 * @param key = apiKey
 * @returns {Object}
 */
function mtaFeedUrl(feedId, key = apiKey) {
  const host = 'http://datamine.mta.info';
  const path = '/mta_esi.php';
  const params = `?key=${ key }&feed_id=${ feedId }`;
  return host + path + params
}
