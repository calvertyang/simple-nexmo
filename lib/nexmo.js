/*

The MIT License (MIT)

Copyright © 2013 Calvert Yang

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

/**
 * Load required modules
 */
var http = require('http');
var https = require('https');
var querystring = require('querystring');

/**
 * Declare variables
 */
var headers = {
	'Content-Type': 'application/x-www-form-urlencoded',
  'accept':'application/json'
};
var initialized = false;
var credentials = {
  api_key: '',
  api_secret: ''
};
var useHttps = false;
var debugMode = false;
var baseUrl = 'rest.nexmo.com';
var smsEndpoint = '/sms/json?';

/**
 * Declare error messages
 */
var ERROR_MESSAGES = { 
  initializeRequired: 'nexmo not initialized, call nexmo.initialize(api_key, api_secret) first before calling any nexmo API',
  keyAndSecretRequired: 'Key and secret cannot be empty',
  invalidTextMessage: 'Invalid text message',
  invalidBody: 'Invalid body value in binary message',
  invalidUdh: 'Invalid udh value in binary message',
  invalidTitle: 'Invalid title in WAP push message',
  invalidUrl: 'Invalid url in WAP push message',
	invalidSender: 'Invalid from address',
	invalidRecipient: 'Invalid to address',
	invalidCountryCode: 'Invalid country code',
	invalidMsisdn: 'Invalid MSISDN passed',
  invalidMessageId: 'Invalid message id(s)',
  tooManyMessageId: 'Too many message id',
  invalidDate: 'Invalid date value',
  invalidNewSecret: 'Invalid new secret',
  invalidCallbackUrl: 'Invalid callback url'
};

module.exports = {
  /**
   * @constant
   */
  VERSION: '1.0.1',

  /**
   * Initialize settings, protocol and debug are optional
   */
  initialize: function initialize(key, secret, protocol, debug) {
    if (!key || !secret) {
      throw ERROR_MESSAGES.keyAndSecretRequired;
    }
    credentials.api_key = key;
    credentials.api_secret = secret;
    smsEndpoint += querystring.stringify(credentials);
    useHttps = protocol && protocol == 'https'; // default to http
    debugMode = debug;
    initialized = true;
  },

  /**
   * Messaging SMS
   *
   * Send a Plain text message
   */
  sendTextMessage: function sendTextMessage(sender, recipient, message, callback) {
    if (!message) {
      sendErrorResponse(callback, new Error(ERROR_MESSAGES.invalidTextMessage));
    } else {
      var options = {
        from: sender,
        to: recipient,
        type: 'unicode',
        text: message
      };

      sendMessage(options, callback);
    }
  },

  /**
   * Messaging SMS
   *
   * Send a Binary data message
   */
  sendBinaryMessage: function sendBinaryMessage(sender, recipient, body, udh, callback) {
    if (!body) {
      sendErrorResponse(callback, new Error(ERROR_MESSAGES.invalidBody));
    } else if (!udh) {
      sendErrorResponse(callback, new Error(ERROR_MESSAGES.invalidUdh));
    } else {
      var options = {
        from: sender,
        to: recipient,
        type: 'binary',
        body: body,
        udh: udh
      };

      sendMessage(options, callback);
    }
  },

  /**
   * Messaging SMS
   *
   * Send a WAP push message
   */
  sendWapPushMessage: function sendWapPushMessage(sender, recipient, title, url, validity, callback) {
    if (!title) {
      sendErrorResponse(callback, new Error(ERROR_MESSAGES.invalidTitle));
    } else if (!url) {
      sendErrorResponse(callback, new Error(ERROR_MESSAGES.invalidUrl));
    } else {
      if (typeof validity == 'function') {
        callback = validity;
        validity = 172800000;
      }

      var options = {
        from: sender,
        to: recipient,
        type: 'wappush',
        title: title,
        url: encodeURIComponent(url),
        validity: validity
      };

      sendMessage(options, callback);
    }
  },

  /**
   * Account: Get Balance(HTTP Verb: GET)
   *
   * Retrieve current account balance
   */
  getBalance: function getBalance(callback) {
    var endpoint = getPath('/account/get-balance/');
    sendRequest(endpoint, callback);
  },

  /**
   * Account: Pricing(HTTP Verb: GET)
   *
   * Retrieve our outbound pricing for a given country
   */
  getPricing: function getPricing(countryCode ,callback) {
    if (!countryCode || countryCode.length != 2) {
      sendErrorResponse(callback, new Error(ERROR_MESSAGES.invalidCountryCode));
    } else {
      var endpoint = getPath('/account/get-pricing/outbound/') + '/' + countryCode;
      sendRequest(endpoint, callback);
    }
  },

  /**
   * Account: Settings(HTTP Verb: POST)
   *
   * Update API secret
   */
  updateSecret: function updateSecret(newSecret, callback) {
    if (!newSecret || newSecret.length > 8) {
      sendError(callback, new Error(ERROR_MESSAGES.invalidNewSecret));
    } else {
      var endpoint = getPath('/account/settings/') + '?newSecret=' + encodeURIComponent(newSecret);
      sendRequest(endpoint, 'POST', callback);
    }
  },

  /**
   * Account: Settings(HTTP Verb: POST)
   *
   * Update inbound call back URL
   */
  updateMoCallBackUrl: function updateMoCallBackUrl(newUrl, callback) {
    if (!newUrl) {
      sendError(callback, new Error(ERROR_MESSAGES.invalidCallbackUrl));
    } else {
      var endpoint = getPath('/account/settings/') + '?moCallBackUrl=' + encodeURIComponent(newUrl);
      sendRequest(endpoint, 'POST', callback);
    }
  },

  /**
   * Account: Settings(HTTP Verb: POST)
   *
   * Update DLR call back URL
   */
  updateDrCallBackUrl: function updateDrCallBackUrl(newUrl, callback) {
    if (!newUrl) {
      sendError(callback, new Error(ERROR_MESSAGES.invalidCallbackUrl));
    } else {
      var endpoint = getPath('/account/settings/') + '?drCallBackUrl=' + encodeURIComponent(newUrl);
      sendRequest(endpoint, 'POST', callback);
    }
  },

  /**
   * Account: Top Up(HTTP Verb: GET)
   *
   * Top-up your account, only if you have turn-on the 'auto-reload' feature.
   */
  getTopUp: function getTopUp(trxId, callback) {
    throw 'Not yet implemented!'
  },

  /**
   * Account: Numbers(HTTP Verb: GET)
   *
   * Get all inbound numbers associated with Nexmo account
   */
  getNumbers: function getNumbers(callback) {
    var endpoint = getPath('/account/numbers/');
    sendRequest(endpoint, callback);
  },

  /**
   * Number: Search(HTTP Verb: GET)
   *
   * Get available inbound numbers for a given country
   */
  searchNumbers: function searchNumbers(countryCode, pattern, index, size, callback) {
    if (!countryCode || countryCode.length != 2) {
      sendErrorResponse(callback, new Error(ERROR_MESSAGES.invalidCountryCode));
    } else {
      var endpoint = getPath('/number/search/') + '/' + countryCode;
      if (typeof pattern == 'function') {
        callback = pattern;
      } else {
        endpoint += '?pattern=' + pattern;
        if (typeof index == 'function') {
          callback = index;
        } else {
          endpoint += '&index=' + index;
          if (typeof size == 'function') {
            callback = size;
          } else {
            endpoint += '&size=' + size;
          }
        }
      }
      sendRequest(endpoint, callback);
    }
  },

  /**
   * Number: Buy(HTTP Verb: POST)
   *
   * Purchase a given inbound number
   */
  buyNumber: function buyNumber(countryCode, msisdn, callback) {
    if (!countryCode || countryCode.length != 2) {
      sendErrorResponse(callback, new Error(ERROR_MESSAGES.invalidCountryCode));
    } else if (!msisdn || msisdn.length < 10) { // check if MSISDN validation is correct for international numbers
      sendErrorResponse(callback, new Error(ERROR_MESSAGES.invalidMsisdn));
    } else {
      var endpoint = getPath('/number/buy/') + '/' + countryCode + '/' + msisdn;
      sendRequest(endpoint, 'POST', callback);
    }
  },

  /**
   * Number: Cancel(HTTP Verb: POST)
   *
   * Cancel a given inbound number subscription
   */
  cancelNumber: function cancelNumber(countryCode, msisdn, callback) {
    if (!countryCode || countryCode.length != 2) {
      sendErrorResponse(callback, new Error(ERROR_MESSAGES.invalidCountryCode));
    } else if (!msisdn || msisdn.length < 10) {
      sendErrorResponse(callback, new Error(ERROR_MESSAGES.invalidMsisdn));
    } else {
      var endpoint = getPath('/number/cancel/') + '/' + countryCode + '/' + msisdn;
      sendRequest(endpoint, 'POST', callback);
    }
  },

  /**
   * Number: Update(HTTP Verb: POST)
   *
   * Update your number callback.
   */
  updateNumberCallback: function updateNumberCallback(countryCode, msisdn, newUrl, sysType, callback) {
    throw 'Not yet implemented!'
  },

  /**
   * Search: Message(HTTP Verb: GET)
   *
   * Search a previously sent message for a given message id
   */
  searchMessage: function searchMessage(messageId, callback) {
    if (!messageId) {
      sendErrorResponse(callback, new Error(ERROR_MESSAGES.invalidMessageId));
    } else {
      var endpoint = getPath('/search/message/') + '/' + messageId;
      sendRequest(endpoint, callback);
    }
  },

  /**
   * Search: Messages(HTTP Verb: GET)
   *
   * Search sent messages by message ids
   */
  searchMessageByIds: function searchMessageByIds(messageIds, callback) {
    if (!messageIds || messageIds.length == 0) {
      sendErrorResponse(callback, new Error(ERROR_MESSAGES.invalidMessageId));
    } else {
      if (messageIds.length > 10) {
        sendErrorResponse(callback, new Error(ERROR_MESSAGES.tooManyMessageId));
      } else {
        var endpoint = getPath('/search/messages/') + '?';
        for(var idx in messageIds) {
          endpoint += 'ids=' + messageIds[idx];

          if (idx < messageIds.length - 1) {
            endpoint += '&';
          }
        }
        sendRequest(endpoint, callback);
      }
    }
  },

  /**
   * Search: Messages(HTTP Verb: GET)
   *
   * Search sent messages by recipient and date
   */
  searchMessagesByRecipient: function searchMessagesByRecipient(date, to, callback) {
    if (!date) {
      sendErrorResponse(callback, new Error(ERROR_MESSAGES.invalidDate));
    } else if (!to) {
      sendErrorResponse(callback, new Error(ERROR_MESSAGES.invalidRecipient));
    } else {
      var endpoint = getPath('/search/messages/') + '?date=' + date + '&to=' + to;
      sendRequest(endpoint, callback);
    }
  },

  /**
   * Search: Rejections(HTTP Verb: GET)
   *
   * Search rejected messages
   */
  searchRejections: function searchRejections(date, to, callback) {
    if (!date) {
      sendErrorResponse(callback, new Error(ERROR_MESSAGES.invalidDate));
    } else {
      var endpoint = getPath('/search/rejections/') + '?date=' + date;
      if (typeof to == 'function') {
        callback = to;
      } else if (to) {
        endpoint += '&to=' + to;
      }
      sendRequest(endpoint, callback);
    }
  }
}

/**
 * Check SMS required parameter and send out message(HTTP Verb: POST)
 */
function sendMessage(data, callback) {
  if (!data.from) {
    sendErrorResponse(callback, new Error(ERROR_MESSAGES.invalidSender));
  } else if (!data.to) {
    sendErrorResponse(callback, new Error(ERROR_MESSAGES.invalidRecipient));
  } else {
    var path = smsEndpoint + '&' + querystring.stringify(data);
    log('Sending message from ' + data.from + ' to ' + data.to + ' with message ' + data.text);
    sendRequest(path, 'POST', function (err, apiResponse) {
      if (!err && apiResponse.status && apiResponse.messages[0].status > 0) {
        sendErrorResponse(callback, new Error(apiResponse.messages[0]['error-text']), apiResponse);
      } else {
        if (callback) {
          callback(err, apiResponse);
        }
      }
    });
  }
}

/**
 * Send HTTP/HTTPS request to nexmo
 */
function sendRequest(path, method, callback) {
  if (!initialized) {
    throw ERROR_MESSAGES.initializeRequired;
  }

  if (typeof method == 'function') {
    callback = method;
    method = 'GET';
  }

  var options = {
    host: baseUrl,
    port: 80,
    path: path,
    method: method,
    headers: headers
  };

  log(options);
  
  var request;

  if (useHttps) {
    options.port = 443;
    request = https.request(options);
  } else {
    request = http.request(options);
  }

  request.end();

  var buffer = '';
  request.on('response', function (response) {
    response.setEncoding('utf8'); 
    
    response.on('data', function (chunk) {
      buffer += chunk;
    });

    response.on('end', function () {
      log('response ended');
      if (callback) {
        var responseData;
        var err = null;
        try {
          responseData = JSON.parse(buffer);
        } catch (parserError) {
          // ignore parser error for now and send raw response to client
          log(parserError);
          log('could not convert API response to JSON, above error is ignored and raw API response is returned to client');
          err = parserError;
        }
        callback(err, responseData);
      }
    })
    
    response.on('close', function (e) {
      log('problem with API request detailed stacktrace below ');
      log(e);
      callback(e);
    });
  });
  
  request.on('error', function (e) {
    log('problem with API request detailed stacktrace below ');
    log(e);
    callback(e);
  });
}

/**
 * Get api endpoint path
 */
function getPath(action) {
  return action + credentials.api_key + '/' + credentials.api_secret;
}

/**
 * Send back or throw out error response
 */
function sendErrorResponse(callback, err, returnData) {
  // Throw the error in case if there is no callback passed
  if (callback) {
    callback(err, returnData);
  } else {
    throw err;
  }
}

/**
 * Logging messages
 */
function log(message) {
  console.log(message instanceof Error);
  if (message instanceof Error) {
    console.log(message.stack);
  }

  if (debugMode) {
    if (typeof message == 'object') {
      console.dir(message);
    } else {
      console.log(message);
    }
  }
}
