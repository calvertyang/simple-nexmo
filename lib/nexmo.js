/**
 *
 * The MIT License (MIT)
 *
 * Copyright © 2013 Calvert Yang
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

/**
 * Module dependencies.
 */
var http = require('http');
var https = require('https');
var querystring = require('querystring');

(function() {
  var Nexmo = function() {
    /**
     * @constant
     */
    _VERSION = '1.0.2';

    _HEADERS = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'accept':'application/json'
    };

    _BASE_URL = 'rest.nexmo.com';

    _ENDPOINT = {
      // Messaging SMS API
      sms: '/sms/json',
      // Messaging USSD API
      ussd: '/ussd/json',
      // Voice API
      tts: '/tts/json',
      // Developer API
      accountGetBalance: '/account/get-balance',
      accountPricing: '/account/get-pricing/outbound',
      accountSettings: '/account/settings',
      accountTopUp: '/account/top-up',
      accountNumbers: '/account/numbers',
      numberSearch: '/number/search',
      numberBuy: '/number/buy',
      numberCancel: '/number/cancel',
      numberUpdate: '/number/update',
      searchMessage: '/search/message',
      searchMessages: '/search/messages',
      searchRejections: '/search/rejections'
    };

    _ERROR_MESSAGES = {
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

    /**
     * Settings
     *
     * @private
     */
    _apiKey: '';
    _apiSecret: '';
    _useHttps = false;
    _debugMode = false;
    _initialized = false;


    /**
     * Initialize settings, protocol and debug are optional.
     *
     * @param {String} Api key
     * @param {String} Api secret
     * @param {String} Optional, protocol `http` or `https`
     * @param {Boolean} Optional, show debug messages
     * @api public
     */
    var initialize = function initialize(key, secret, protocol, debug) {
      if (!key || !secret) {
        throw _ERROR_MESSAGES.keyAndSecretRequired;
      }
      _apiKey = key;
      _apiSecret = secret;
      _useHttps = protocol && protocol == 'https';
      _debugMode = debug;
      _initialized = true;
    };

    /**
     * Messaging SMS - Send a Plain text message
     *
     * @param {String} Sender address may be alphanumeric.
     * @param {String} Mobile number in international format, and one recipient per request.
     * @param {String} Body of the text message
     * @param {Function} Callback function
     * @api public
     */
    var sendTextMessage = function sendTextMessage(sender, recipient, message, callback) {
      if (!message) {
        sendErrorResponse(callback, new Error(_ERROR_MESSAGES.invalidTextMessage));
      } else {
        var options = {
          from: sender,
          to: recipient,
          type: 'unicode',
          text: message
        };

        sendMessage(options, callback);
      }
    };

    /**
     * Messaging SMS - Send a Binary data message
     *
     * @param {String} Sender address may be alphanumeric.
     * @param {String} Mobile number in international format, and one recipient per request.
     * @param {String} Hex encoded binary data.
     * @param {String} Hex encoded udh.
     * @param {Function} Callback function
     * @api public
     */
    var sendBinaryMessage = function sendBinaryMessage(sender, recipient, body, udh, callback) {
      if (!body) {
        sendErrorResponse(callback, new Error(_ERROR_MESSAGES.invalidBody));
      } else if (!udh) {
        sendErrorResponse(callback, new Error(_ERROR_MESSAGES.invalidUdh));
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
    };

    /**
     * Messaging SMS - Send a WAP push message
     *
     * @param {String} Sender address may be alphanumeric.
     * @param {String} Mobile number in international format, and one recipient per request.
     * @param {String} Title of WAP Push.
     * @param {String} WAP Push URL.
     * @param {String} Optional, set how long WAP Push is available in milliseconds.
     * @param {Function} Callback function
     * @api public
     */
    var sendWapPushMessage = function sendWapPushMessage(sender, recipient, title, url, validity, callback) {
      if (!title) {
        sendErrorResponse(callback, new Error(_ERROR_MESSAGES.invalidTitle));
      } else if (!url) {
        sendErrorResponse(callback, new Error(_ERROR_MESSAGES.invalidUrl));
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
    };

    /**
     * Account: Pricing - Retrieve current account balance
     * HTTP Verb: GET
     *
     * @param {Function} Callback function
     * @api public
     */
    var getBalance = function getBalance(callback) {
      var endpoint = getPath(_ENDPOINT.accountGetBalance);
      sendRequest(endpoint, callback);
    };

    /**
     * Account: Pricing - Retrieve our outbound pricing for a given country
     * HTTP Verb: GET
     *
     * @param {String} A 2 letter country code.
     * @param {Function} Callback function
     * @api public
     */
    var getPricing = function getPricing(countryCode ,callback) {
      if (!countryCode || countryCode.length != 2) {
        sendErrorResponse(callback, new Error(_ERROR_MESSAGES.invalidCountryCode));
      } else {
        var endpoint = getPath(_ENDPOINT.accountPricing) + '&country=' + countryCode;
        sendRequest(endpoint, callback);
      }
    };

    /**
     * Account: Settings - Update API secret
     * HTTP Verb: POST
     *
     * @param {String} New API secret
     * @param {Function} Callback function
     * @api public
     */
    var updateSecret = function updateSecret(newSecret, callback) {
      if (!newSecret || newSecret.length > 8) {
        sendError(callback, new Error(_ERROR_MESSAGES.invalidNewSecret));
      } else {
        var endpoint = getPath(_ENDPOINT.accountSettings) + '&newSecret=' + encodeURIComponent(newSecret);
        sendRequest(endpoint, 'POST', callback);
      }
    };

    /**
     * Account: Settings - Update inbound call back URL
     * HTTP Verb: POST
     *
     * @param {String} Inbound call back URL.
     * @param {Function} Callback function
     * @api public
     */
    var updateMoCallBackUrl = function updateMoCallBackUrl(newUrl, callback) {
      if (!newUrl) {
        sendError(callback, new Error(_ERROR_MESSAGES.invalidCallbackUrl));
      } else {
        var endpoint = getPath(_ENDPOINT.accountSettings) + '&moCallBackUrl=' + encodeURIComponent(newUrl);
        sendRequest(endpoint, 'POST', callback);
      }
    };

    /**
     * Account: Settings - Update DLR call back URL
     * HTTP Verb: POST
     *
     * @param {String} DLR call back URL.
     * @param {Function} Callback function
     * @api public
     */
    var updateDrCallBackUrl = function updateDrCallBackUrl(newUrl, callback) {
      if (!newUrl) {
        sendError(callback, new Error(_ERROR_MESSAGES.invalidCallbackUrl));
      } else {
        var endpoint = getPath(_ENDPOINT.accountSettings) + '&drCallBackUrl=' + encodeURIComponent(newUrl);
        sendRequest(endpoint, 'POST', callback);
      }
    };

    /**
     * Account: Top Up - Top-up your account, only if you have turn-on the 'auto-reload' feature.
     * HTTP Verb: GET
     *
     * @param {String} The transaction id associated with your **first** 'auto reload' top-up.
     * @param {Function} Callback function
     * @api public
     */
    var getTopUp = function getTopUp(transactionId, callback) {
      throw 'Not yet implemented!'
    };

    /**
     * Account: Numbers - Get all inbound numbers associated with Nexmo account
     * HTTP Verb: GET
     *
     * @param {Function} Callback function
     * @api public
     */
    var getNumbers = function getNumbers(callback) {
      var endpoint = getPath(_ENDPOINT.accountNumbers);
      sendRequest(endpoint, callback);
    };

    /**
     * Number: Search - Get available inbound numbers for a given country
     * HTTP Verb: GET
     *
     * @param {String} Country code.
     * @param {String} Optional, a matching pattern.
     * @param {Integer} Optional, page index (> 0, default 1).
     * @param {Integer} Optional, page size (max 100, default 10).
     * @param {Function} Callback function
     * @api public
     */
    var searchNumbers = function searchNumbers(countryCode, pattern, index, size, callback) {
      if (!countryCode || countryCode.length != 2) {
        sendErrorResponse(callback, new Error(_ERROR_MESSAGES.invalidCountryCode));
      } else {
        var endpoint = getPath(_ENDPOINT.numberSearch) + '&country=' + countryCode;
        if (typeof pattern == 'function') {
          callback = pattern;
        } else {
          endpoint += '&pattern=' + pattern;
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
    };

    /**
     * Number: Buy - Purchase a given inbound number
     * HTTP Verb: POST
     *
     * @param {String} Country code.
     * @param {String} An available inbound number
     * @param {Function} Callback function
     * @api public
     */
    var buyNumber = function buyNumber(countryCode, msisdn, callback) {
      if (!countryCode || countryCode.length != 2) {
        sendErrorResponse(callback, new Error(_ERROR_MESSAGES.invalidCountryCode));
      } else if (!msisdn || msisdn.length < 10) { // check if MSISDN validation is correct for international numbers
        sendErrorResponse(callback, new Error(_ERROR_MESSAGES.invalidMsisdn));
      } else {
        var endpoint = getPath(_ENDPOINT.numberBuy) + '&country=' + countryCode + '&msisdn=' + msisdn;
        sendRequest(endpoint, 'POST', callback);
      }
    };

    /**
     * Number: Cancel - Cancel a given inbound number subscription
     * HTTP Verb: POST
     *
     * @param {String} Country code.
     * @param {String} One of your inbound numbers
     * @param {Function} Callback function
     * @api public
     */
    var cancelNumber = function cancelNumber(countryCode, msisdn, callback) {
      if (!countryCode || countryCode.length != 2) {
        sendErrorResponse(callback, new Error(_ERROR_MESSAGES.invalidCountryCode));
      } else if (!msisdn || msisdn.length < 10) {
        sendErrorResponse(callback, new Error(_ERROR_MESSAGES.invalidMsisdn));
      } else {
        var endpoint = getPath(_ENDPOINT.numberCancel) + '&country=' + countryCode + '&msisdn=' + msisdn;
        sendRequest(endpoint, 'POST', callback);
      }
    };

    /**
     * Number: Update - Update your number callback.
     * HTTP Verb: POST
     *
     * @param {String} Country code.
     * @param {String} One of your inbound numbers
     * @param {String} Optional, number call back URL
     * @param {String} Optional, the associated system type for SMPP client only
     * @param {Function} Callback function
     * @api public
     */
    var updateNumberCallback = function updateNumberCallback(countryCode, msisdn, newUrl, sysType, callback) {
      throw 'Not yet implemented!'
    };

    /**
     * Search: Message - Search a previously sent message for a given message id
     * HTTP Verb: GET
     *
     * @param {String} Your message id received at submission time
     * @param {Function} Callback function
     * @api public
     */
    var searchMessage = function searchMessage(messageId, callback) {
      if (!messageId) {
        sendErrorResponse(callback, new Error(_ERROR_MESSAGES.invalidMessageId));
      } else {
        var endpoint = getPath(_ENDPOINT.searchMessage) + '&id=' + messageId;
        sendRequest(endpoint, callback);
      }
    };

    /**
     * Search: Message - Search sent messages by message ids
     * HTTP Verb: GET
     *
     * @param {Array} A list of message ids, up to 10
     * @param {Function} Callback function
     * @api public
     */
    var searchMessageByIds = function searchMessageByIds(messageIds, callback) {
      if (!messageIds || messageIds.length == 0) {
        sendErrorResponse(callback, new Error(_ERROR_MESSAGES.invalidMessageId));
      } else {
        if (messageIds.length > 10) {
          sendErrorResponse(callback, new Error(_ERROR_MESSAGES.tooManyMessageId));
        } else {
          var endpoint = getPath(_ENDPOINT.searchMessages) + '&';
          for(var idx in messageIds) {
            endpoint += 'ids=' + messageIds[idx];

            if (idx < messageIds.length - 1) {
              endpoint += '&';
            }
          }
          sendRequest(endpoint, callback);
        }
      }
    };

    /**
     * Search: Message - Search sent messages by recipient and date
     * HTTP Verb: GET
     *
     * @param {String} Message date submission YYYY-MM-DD
     * @param {String} A recipient number
     * @param {Function} Callback function
     * @api public
     */
    var searchMessagesByRecipient = function searchMessagesByRecipient(date, to, callback) {
      if (!date) {
        sendErrorResponse(callback, new Error(_ERROR_MESSAGES.invalidDate));
      } else if (!to) {
        sendErrorResponse(callback, new Error(_ERROR_MESSAGES.invalidRecipient));
      } else {
        var endpoint = getPath(_ENDPOINT.searchMessages) + '&date=' + date + '&to=' + to;
        sendRequest(endpoint, callback);
      }
    };


    /**
     * Search: Rejections - Search rejected messages
     * HTTP Verb: GET
     *
     * @param {String} Message date submission YYYY-MM-DD
     * @param {String} Optional, a recipient number
     * @param {Function} Callback function
     * @api public
     */
    var searchRejections = function searchRejections(date, to, callback) {
      if (!date) {
        sendErrorResponse(callback, new Error(_ERROR_MESSAGES.invalidDate));
      } else {
        var endpoint = getPath(_ENDPOINT.searchRejections) + '&date=' + date;
        if (typeof to == 'function') {
          callback = to;
        } else if (to) {
          endpoint += '&to=' + to;
        }
        sendRequest(endpoint, callback);
      }
    };

    /**
     * Check SMS required parameter and send out message
     * HTTP Verb: POST
     *
     * @api private
     */
    var sendMessage = function sendMessage(data, callback) {
      if (!data.from) {
        sendErrorResponse(callback, new Error(_ERROR_MESSAGES.invalidSender));
      } else if (!data.to) {
        sendErrorResponse(callback, new Error(_ERROR_MESSAGES.invalidRecipient));
      } else {
        var endpoint = getPath(_ENDPOINT.sms) + '&' + querystring.stringify(data);
        log('Sending message from ' + data.from + ' to ' + data.to + ' with message ' + data.text);
        sendRequest(endpoint, 'POST', function (err, apiResponse) {
          if (!err && apiResponse.status && apiResponse.messages[0].status > 0) {
            sendErrorResponse(callback, new Error(apiResponse.messages[0]['error-text']), apiResponse);
          } else {
            if (callback) {
              callback(err, apiResponse);
            }
          }
        });
      }
    };

    /**
     * Send HTTP/HTTPS request to nexmo
     *
     * @api private
     */
    var sendRequest = function sendRequest(path, method, callback) {
      if (!_initialized) {
        throw _ERROR_MESSAGES.initializeRequired;
      }

      if (typeof method == 'function') {
        callback = method;
        method = 'GET';
      }

      var options = {
        host: _BASE_URL,
        port: 80,
        path: path,
        method: method,
        headers: _HEADERS
      };

      log(options);

      var request;

      if (_useHttps) {
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
    };

    /**
     * Get api endpoint path
     *
     * @api private
     */
    var getPath = function getPath(action) {
      var credentials = {
        api_key: _apiKey,
        api_secret: _apiSecret
      };
      return action + '?' + querystring.stringify(credentials);
    };

    /**
     * Send back or throw out error response
     *
     * @api private
     */
    var sendErrorResponse = function sendErrorResponse(callback, err, returnData) {
      // Throw the error in case if there is no callback passed
      if (callback) {
        callback(err, returnData);
      } else {
        throw err;
      }
    };

    /**
     * Logging messages
     *
     * @api private
     */
    var log = function log(message) {
      if (message instanceof Error) {
        console.log(message.stack);
      }

      if (_debugMode) {
        if (typeof message == 'object') {
          console.dir(message);
        } else {
          console.log(message);
        }
      }
    };

    return {
      VERSION: _VERSION,
      init: initialize,
      sendTextMessage: sendTextMessage,
      sendBinaryMessage: sendBinaryMessage,
      sendWapPushMessage: sendWapPushMessage,
      getBalance: getBalance,
      getPricing: getPricing,
      updateSecret: updateSecret,
      updateMoCallBackUrl: updateMoCallBackUrl,
      updateDrCallBackUrl: updateDrCallBackUrl,
      getTopUp: getTopUp,
      getNumbers: getNumbers,
      searchNumbers: searchNumbers,
      buyNumber: buyNumber,
      cancelNumber: cancelNumber,
      updateNumberCallback: updateNumberCallback,
      searchMessage: searchMessage,
      searchMessageByIds: searchMessageByIds,
      searchMessagesByRecipient: searchMessagesByRecipient,
      searchRejections: searchRejections
    };
  };

  /**
   * Module exports.
   */
  module.exports = Nexmo;
})();
