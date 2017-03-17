const request = require('request');

const config = require(`${CONF_DIR}/client_id.json`).installed;

class Curl {
  static request(code) {
    return new Promise((resolve, reject) => {
      request.post(config.token_uri, {
        form: {
          client_id: config.client_id,
          client_secret: config.client_secret,
          redirect_uri: config.redirect_uris[0],
          grant_type: 'authorization_code',
          code,
        },
      }, (err, httpResponse, body) => {
        if (err) reject(err);
        resolve(JSON.parse(body));
      });
    });
  }
}

module.exports = Curl;