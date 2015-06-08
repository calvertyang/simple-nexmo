/**
 * The MIT License (MIT)
 *
 * Copyright © 2014 Calvert Yang
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

'use strict';

/**
 * Module dependencies.
 */
var http = require('http');
var https = require('https');
var querystring = require('querystring');

/**
 * API endpoint
 *
 * @constant {object}
 */
var _ENDPOINT = {
  sms: '/sms/json',
  tts: '/tts/json',
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

/**
 * API error messages
 *
 * @constant {object}
 */
var _ERROR_MESSAGES = {
  initializeRequired: 'nexmo not initialized, call nexmo(apiKey, apiSecret) first before calling any nexmo API',
  keyAndSecretRequired: 'Key and secret cannot be empty',
  invalidMessageType: 'Invalid message type',
  invalidCountry: 'Invalid country',
  invalidMessageId: 'Invalid message id(s)',
  tooManyMessageId: 'Too many message id',
  missingOrWrongParameter: 'Missing or wrong parameter '
};

/**
 * Settings
 *
 * @property {string} key - API Key
 * @property {string} secret - API secret
 * @property {string} baseUrl - API base url
 * @property {boolean} useSSL - use SSL connection
 * @property {boolean} debug - show debug messages
 * @property {boolean} initialized - sdk initialize flag
 * @private
 */
var _api = {
  key: '',
  secret: '',
  baseUrl: 'rest.nexmo.com',
  useSSL: true,
  debug: false,
  initialized: false
};

/**
 * Constructor
 *
 * @param {object} opts - API Settings
 * @param {string} opts.apiKey - API key
 * @param {string} opts.apiSecret - API secret
 * @param {string} opts.baseUrl - Optional. API base url
 * @param {boolean} opts.useSSL - Optional. use SSL connection
 * @param {boolean} opts.debug - Optional. show debug messages
 */
var Nexmo = function(opts) {
  if (typeof opts !== 'object' || !opts.hasOwnProperty('apiKey') || !opts.hasOwnProperty('apiSecret')) {
    throw _ERROR_MESSAGES.keyAndSecretRequired;
  }

  if (!(this instanceof Nexmo)) {
    return new Nexmo(opts);
  }

  this.version = require('../package.json').version;
  _api.key = opts.apiKey;
  _api.secret = opts.apiSecret;
  _api.baseUrl = opts.baseUrl || _api.baseUrl;
  _api.useSSL = opts.useSSL || true;
  _api.debug = opts.debug || false;
  _api.initialized = true;
};

Nexmo.prototype = {
  /**
   * SMS - Send a SMS message
   *
   * @param {object} opts - The parameter for SMS
   * @param {string} opts.from - Sender address may be alphanumeric. Restrictions may apply, depending on the destination.
   * @param {string} opts.to - Mobile number in international format, and one recipient per request.
   * @param {string} opts.type - Optional. This can be omitted for text (default), but is required when sending a Binary (binary), WAP Push (wappush), Unicode message (unicode), vcal (vcal) or vcard (vcard).
   * @param {string} opts.text - Body of the text message, UTF-8 and URL encoded value.
   * @param {string} opts.status-report-req - Optional. Set to 1 if you want to receive a delivery report (DLR) for this request.
   * @param {string} opts.client-ref - Optional. Include any reference string for your reference.
   * @param {string} opts.network-code - Optional. Force the recipient network operator MCCMNC.
   * @param {string} opts.vcard - Optional. vcard text body correctly formatted.
   * @param {string} opts.vcal - Optional. vcal text body correctly formatted.
   * @param {string} opts.ttl - Optional. Message life span in milliseconds.
   * @param {string} opts.message-class - Optional. Set to 0 for Flash SMS.
   * @param {string} opts.body - Hex encoded binary data.
   * @param {string} opts.udh - Hex encoded udh.
   * @param {string} opts.title - Wap push title
   * @param {string} opts.url - Wap push url
   * @param {string} opts.validity - Optional. Set how long WAP Push is available in milliseconds.
   * @param {requestCallback} callback - The callback that handles the response
   */
  sendSMSMessage: function(opts, callback) {
    var data = {};

    if (typeof opts !== 'object') {
      return sendErrorResponse(callback, new Error(_ERROR_MESSAGES.missingOrWrongParameter));
    }

    if (!opts.hasOwnProperty('from') || opts['from'] === '') {
      return sendErrorResponse(callback, new Error(_ERROR_MESSAGES.missingOrWrongParameter + '"from"'));
    }
    data['from'] = opts['from'];

    if (!opts.hasOwnProperty('to') || opts['to'] === '') {
      return sendErrorResponse(callback, new Error(_ERROR_MESSAGES.missingOrWrongParameter + '"to"'));
    }
    data['to'] = opts['to'];

    if (!opts.hasOwnProperty('type') || opts['type'] === '') {
      return sendErrorResponse(callback, new Error(_ERROR_MESSAGES.missingOrWrongParameter + '"type"'));
    }
    data['type'] = opts['type'];

    if (opts['type'] === 'text' || opts['type'] === 'unicode') {
      if (!opts.hasOwnProperty('text') || opts['text'] === '') {
        return sendErrorResponse(callback, new Error(_ERROR_MESSAGES.missingOrWrongParameter + '"text"'));
      }

      data['text'] = opts['text'];
    }

    if (opts.hasOwnProperty('status-report-req') && opts['status-report-req'] !== '') {
      data['status-report-req'] = opts['status-report-req'];
    }

    if (opts.hasOwnProperty('client-ref') && opts['client-ref'] !== '') {
      data['client-ref'] = opts['client-ref'];
    }

    if (opts.hasOwnProperty('network-code') && opts['network-code'] !== '') {
      data['network-code'] = opts['network-code'];
    }

    if (opts['type'] === 'vcard') {
      if (!opts.hasOwnProperty('vcard') || opts['vcard'] === '') {
        return sendErrorResponse(callback, new Error(_ERROR_MESSAGES.missingOrWrongParameter + '"vcard"'));
      }
      data['vcard'] = opts['vcard'];
    }

    if (opts['type'] === 'vcal') {
      if (!opts.hasOwnProperty('vcal') || opts['vcal'] === '') {
        return sendErrorResponse(callback, new Error(_ERROR_MESSAGES.missingOrWrongParameter + '"vcal"'));
      }
      data['vcal'] = opts['vcal'];
    }

    if (opts.hasOwnProperty('ttl') && opts['ttl'] !== '') {
      data['ttl'] = opts['ttl'];
    }

    if (opts.hasOwnProperty('message-class') && opts['message-class'] !== '') {
      data['message-class'] = opts['message-class'];
    }

    if (opts['type'] === 'binary') {
      if (!opts.hasOwnProperty('body') || opts['body'] === '') {
        return sendErrorResponse(callback, new Error(_ERROR_MESSAGES.missingOrWrongParameter + '"body"'));
      }
      data['body'] = opts['body'];

      if (!opts.hasOwnProperty('udh') || opts['udh'] === '') {
        return sendErrorResponse(callback, new Error(_ERROR_MESSAGES.missingOrWrongParameter + '"udh"'));
      }
      data['udh'] = opts['udh'];
    }

    if (opts['type'] === 'wappush') {
      if (!opts.hasOwnProperty('title') || opts['title'] === '') {
        return sendErrorResponse(callback, new Error(_ERROR_MESSAGES.missingOrWrongParameter + '"title"'));
      }
      data['title'] = opts['title'];

      if (!opts.hasOwnProperty('url') || opts['url'] === '') {
        return sendErrorResponse(callback, new Error(_ERROR_MESSAGES.missingOrWrongParameter + '"url"'));
      }
      data['url'] = encodeURIComponent(opts['url']);

      if (opts.hasOwnProperty('validity') && opts['validity'] !== '') {
        data['validity'] = opts['validity'];
      }
    }

    var messageType;

    switch(opts['type']) {
      case 'text':
      case 'binary':
      case 'unicode':
      case 'vcal':
      case 'vcard':
        messageType = opts['type'];
        break;
      case 'wappush':
        messageType = 'wap';
        break;
      default:
        return sendErrorResponse(callback, new Error(_ERROR_MESSAGES.invalidMessageType));
    }

    log('Sending ' + messageType + ' SMS message from ' + opts['from'] + ' to ' + opts['to']);
    
    sendRequest('POST', _ENDPOINT.sms, data, function(err, apiResponse) {
      if (!err && apiResponse.status && apiResponse.messages && apiResponse.messages[0].status > 0) {
        return sendErrorResponse(callback, new Error(apiResponse.messages[0]['error-text'], apiResponse));
      }

      if (callback) {
        callback(err, apiResponse);
      }
    });
  },

  /**
   * Voice - Send a TTS message
   *
   * @param {object} opts - The parameter for TTS
   * @param {string} opts.to - Phone number in international format and one recipient per request.
   * @param {string} opts.from - Optional. A voice enabled inbound number associated with your account.
   * @param {string} opts.text - Body of the text message, UTF-8 and URL encoded value.
   * @param {string} opts.lg - Optional. The language used to read the message
   * @param {string} opts.voice - Optional. The voice to be used female (default) or male
   * @param {string} opts.repeat - Optional. Define how many times you want to repeat the text message (default is 1 , maximum is 10).
   * @param {string} opts.machine_detection - Optional. How to behave when an answering machine is detected.
   * @param {string} opts.machine_timeout - Optional. Time allocated to analyze if the call has been answered by a machine.
   * @param {string} opts.callback - Optional. A URL to which Nexmo will send a request when the call ends to notify your application.
   * @param {string} opts.callback_method -  Optional. The HTTP method for your callback. Must be GET (default) or POST.
   * @param {requestCallback} callback - Optional. The callback that handles the response
   */
  sendTTSMessage: function(opts, callback) {
    var data = {};

    if (typeof opts !== 'object') {
      return sendErrorResponse(callback, new Error(_ERROR_MESSAGES.missingOrWrongParameter));
    }

    if (!opts.hasOwnProperty('to') || opts['to'] === '') {
      return sendErrorResponse(callback, new Error(_ERROR_MESSAGES.missingOrWrongParameter + '"to"'));
    }
    data['to'] = opts['to'];

    if (opts.hasOwnProperty('from') && opts['from'] !== '') {
      data['from'] = opts['from'];
    }

    if (!opts.hasOwnProperty('text') || opts['text'] === '') {
      return sendErrorResponse(callback, new Error(_ERROR_MESSAGES.missingOrWrongParameter + '"text"'));
    }
    data['text'] = opts['text'];

    if (opts.hasOwnProperty('lg') && opts['lg'] !== '') {
      data['lg'] = opts['lg'];
    }

    if (opts.hasOwnProperty('voice') && opts['voice'] !== '') {
      data['voice'] = opts['voice'];
    }

    if (opts.hasOwnProperty('repeat') && opts['repeat'] !== '') {
      data['repeat'] = opts['repeat'];
    }

    if (opts.hasOwnProperty('machine_detection') && opts['machine_detection'] !== '') {
      data['machine_detection'] = opts['machine_detection'];
    }

    if (opts.hasOwnProperty('machine_timeout') && opts['machine_timeout'] !== '') {
      data['machine_timeout'] = opts['machine_timeout'];
    }

    if (opts.hasOwnProperty('callback') && opts['callback'] !== '') {
      data['callback'] = opts['callback'];
    }

    if (opts.hasOwnProperty('callback_method') && opts['callback_method'] !== '') {
      data['callback_method'] = opts['callback_method'];
    }

    if (opts['from']) {
      log('Sending TTS message from ' + opts['from'] + ' to ' + opts['to']);
    } else {
      log('Sending TTS message to ' + opts['to']);
    }
    
    sendRequest('POST', _ENDPOINT.tts, data, function(err, apiResponse) {
      if (!err && apiResponse.status && apiResponse['error-text']) {
        return sendErrorResponse(callback, new Error(apiResponse['error-text'], apiResponse));
      }

      if (callback) {
        callback(err, apiResponse);
      }
    });
  },

  /**
   * Account: Pricing - Retrieve current account balance
   *
   * @param {requestCallback} callback - The callback that handles the response
   * @public
   */
  getBalance: function(callback) {
    sendRequest('GET', _ENDPOINT.accountGetBalance, null, callback);
  },

  /**
   * Account: Pricing - Retrieve our outbound pricing for a given country
   *
   * @param {string} country - A 2 letter country code
   * @param {requestCallback} callback - The callback that handles the response
   * @public
   */
  getPricing: function(country, callback) {
    if (!country || typeof country !== 'string' || country.length !== 2) {
      return sendErrorResponse(callback, new Error(_ERROR_MESSAGES.invalidCountry));
    }

    var data = {
      country: country
    };

    sendRequest('GET', _ENDPOINT.accountPricing, data, callback);
  },

  /**
   * Account: Settings - Update API secret
   *
   * @param {object} opts - The parameter for account settings
   * @param {string} opts.newSecret - Optional. New API secret(8 characters max)
   * @param {string} opts.moCallBackUrl - Optional. Inbound call back URL.
   * @param {string} opts.drCallBackUrl - Optional. DLR call back URL.
   * @param {requestCallback} callback - The callback that handles the response
   * @public
   */
  updateSettings: function(opts, callback) {
    var data = {};

    if (typeof opts === 'function') {
      callback = opts;
    } else {
      if (typeof opts !== 'object') {
        return sendErrorResponse(callback, new Error(_ERROR_MESSAGES.missingOrWrongParameter));
      }

      if (opts.hasOwnProperty('newSecret') && opts['newSecret'] !== '') {
        if (typeof opts['newSecret'] !== 'string' || opts['newSecret'].length > 8) {
          return sendErrorResponse(callback, new Error(_ERROR_MESSAGES.missingOrWrongParameter + '"newSecret"'));
        }
        data['newSecret'] = opts['newSecret'];
      }

      if (opts.hasOwnProperty('moCallBackUrl')) {
        data['moCallBackUrl'] = encodeURIComponent(opts['moCallBackUrl']);
      }

      if (opts.hasOwnProperty('drCallBackUrl')) {
        data['drCallBackUrl'] = encodeURIComponent(opts['drCallBackUrl']);
      }

      if (Object.keys(data).length === 0) {
        return sendErrorResponse(callback, new Error(_ERROR_MESSAGES.missingOrWrongParameter));
      }
    }

    sendRequest('POST', _ENDPOINT.accountSettings, data, callback);
  },

  /**
   * Account: Top Up - Top-up your account, only if you have turn-on the 'auto-reload' feature
   *
   * @param {string} transactionId - The transaction id associated with your **first** 'auto reload' top-up
   * @param {requestCallback} callback - The callback that handles the response
   */
  getTopUp: function(transactionId, callback) {
    if (!transactionId || typeof newSecret !== 'string') {
      return sendErrorResponse(callback, new Error(_ERROR_MESSAGES.invalidTransactionId));
    }

    var data = {
      trx: transactionId
    };

    sendRequest('POST', _ENDPOINT.accountTopUp, data, callback);
  },

  /**
   * Account: Numbers - Get all inbound numbers associated with Nexmo account
   *
   * @param {object} opts - The parameter for get numbers
   * @param {string} opts.index - Optional. Page index (>0, default 1).
   * @param {string} opts.size - Optional. Page size (max 100, default 10).
   * @param {string} opts.pattern - Optional. A matching pattern.
   * @param {requestCallback} callback - The callback that handles the response
   */
  getNumbers: function(opts, callback) {
    var data = {};

    if (typeof opts === 'function') {
      callback = opts;
    } else {
      if (typeof opts !== 'object') {
        return sendErrorResponse(callback, new Error(_ERROR_MESSAGES.missingOrWrongParameter));
      }

      if (opts.hasOwnProperty('index') && opts['index'] !== '') {
        if (isNaN(Number(opts['index'])) || Number(opts['index']) <= 0) {
          return sendErrorResponse(callback, new Error(_ERROR_MESSAGES.missingOrWrongParameter + '"index"'));
        }
        data['index'] = opts['index'];
      }

      if (opts.hasOwnProperty('size') && opts['size'] !== '') {
        if (isNaN(Number(opts['size'])) || Number(opts['size']) <= 0 || Number(opts['size']) > 100) {
          return sendErrorResponse(callback, new Error(_ERROR_MESSAGES.missingOrWrongParameter + '"size"'));
        }
        data['size'] = opts['size'];
      }

      if (opts.hasOwnProperty('pattern') && opts['pattern'] !== '') {
        data['pattern'] = opts['pattern'];
      }

      if (Object.keys(data).length === 0) {
        return sendErrorResponse(callback, new Error(_ERROR_MESSAGES.missingOrWrongParameter));
      }
    }

    sendRequest('GET', _ENDPOINT.accountNumbers, data, callback);
  },

  /**
   * Number: Search - Get available inbound numbers for a given country
   *
   * @param {object} opts - The parameter for search numbers
   * @param {string} opts.country - Country code.
   * @param {string} opts.pattern - Optional. a matching pattern
   * @param {string} opts.features - Optional. Available features are SMS and VOICE, use a comma-separated values.
   * @param {string} opts.index - Optional. page index (> 0, default 1).
   * @param {string} opts.size - Optional. page size (max 100, default 10).
   * @param {requestCallback} callback - The callback that handles the response
   */
  searchNumbers: function(opts, callback) {
    var data = {};

    if (typeof opts !== 'object') {
      return sendErrorResponse(callback, new Error(_ERROR_MESSAGES.missingOrWrongParameter));
    }

    if (!opts.hasOwnProperty('country') || opts['country'] === '') {
      return sendErrorResponse(callback, new Error(_ERROR_MESSAGES.missingOrWrongParameter + '"country"'));
    }
    data['country'] = opts['country'];

    if (opts.hasOwnProperty('pattern') && opts['pattern'] !== '') {
      data['pattern'] = opts['pattern'];
    }

    if (opts.hasOwnProperty('features') && opts['features'] !== '') {
      data['features'] = opts['features'];
    }

    if (opts.hasOwnProperty('index') && opts['index'] !== '') {
      if (isNaN(Number(opts['index'])) || Number(opts['index']) <= 0) {
        return sendErrorResponse(callback, new Error(_ERROR_MESSAGES.missingOrWrongParameter + '"index"'));
      }
      data['index'] = opts['index'];
    }

    if (opts.hasOwnProperty('size') && opts['size'] !== '') {
      if (isNaN(Number(opts['size'])) || Number(opts['size']) <= 0 || Number(opts['size']) > 100) {
        return sendErrorResponse(callback, new Error(_ERROR_MESSAGES.missingOrWrongParameter + '"size"'));
      }
      data['size'] = opts['size'];
    }

    sendRequest('GET', _ENDPOINT.numberSearch, data, callback);
  },

  /**
   * Number: Buy - Purchase a given inbound number
   *
   * @param {object} opts - The parameter for buy number
   * @param {string} opts.country - Country code.
   * @param {string} opts.msisdn - An available inbound number.
   * @param {requestCallback} callback - The callback that handles the response
   */
  buyNumber: function(opts, callback) {
    var data = {};

    if (typeof opts !== 'object') {
      return sendErrorResponse(callback, new Error(_ERROR_MESSAGES.missingOrWrongParameter));
    }

    if (!opts.hasOwnProperty('country') || opts['country'] === '') {
      return sendErrorResponse(callback, new Error(_ERROR_MESSAGES.missingOrWrongParameter + '"country"'));
    }
    data['country'] = opts['country'];

    if (!opts.hasOwnProperty('msisdn') || opts['msisdn'] === '') {
      return sendErrorResponse(callback, new Error(_ERROR_MESSAGES.missingOrWrongParameter + '"msisdn"'));
    }
    data['msisdn'] = opts['msisdn'];

    sendRequest('POST', _ENDPOINT.numberBuy, data, callback);
  },

  /**
   * Number: Cancel - Cancel a given inbound number subscription
   *
   * @param {object} opts - The parameter for buy number
   * @param {string} opts.country - Country code.
   * @param {string} opts.msisdn - One of your inbound numbers.
   * @param {requestCallback} callback - The callback that handles the response
   */
  cancelNumber: function(opts, callback) {
    var data = {};

    if (typeof opts !== 'object') {
      return sendErrorResponse(callback, new Error(_ERROR_MESSAGES.missingOrWrongParameter));
    }

    if (!opts.hasOwnProperty('country') || opts['country'] === '') {
      return sendErrorResponse(callback, new Error(_ERROR_MESSAGES.missingOrWrongParameter + '"country"'));
    }
    data['country'] = opts['country'];

    if (!opts.hasOwnProperty('msisdn') || opts['msisdn'] === '') {
      return sendErrorResponse(callback, new Error(_ERROR_MESSAGES.missingOrWrongParameter + '"msisdn"'));
    }
    data['msisdn'] = opts['msisdn'];

    sendRequest('POST', _ENDPOINT.numberCancel, data, callback);
  },

  /**
   * Number: Update - Update your number callback
   *
   * @param {object} opts - The parameter for buy number
   * @param {string} opts.country - Country code
   * @param {string} opts.msisdn - One of your inbound numbers
   * @param {string} opts.moHttpUrl - Optional. The URL should be active to be taken into account and properly encoded.
   * @param {string} opts.moSmppSysType - Optional. The associated system type for SMPP client only
   * @param {string} opts.voiceCallbackType - Optional. The voice callback type for SIP end point (sip), for a telephone number (tel), for VoiceXML end point (vxml).
   * @param {string} opts.voiceCallbackValue - Optional. The voice callback value based on the voiceCallbackType.
   * @param {string} opts.voiceStatusCallback - Optional. A URL to which Nexmo will send a request when the call ends to notify your application.
   * @param {requestCallback} callback - The callback that handles the response
   */
  updateNumber: function(opts, callback) {
    var data = {};

    if (typeof opts !== 'object') {
      return sendErrorResponse(callback, new Error(_ERROR_MESSAGES.missingOrWrongParameter));
    }

    if (!opts.hasOwnProperty('country') || opts['country'] === '') {
      return sendErrorResponse(callback, new Error(_ERROR_MESSAGES.missingOrWrongParameter + '"country"'));
    }
    data['country'] = opts['country'];

    if (!opts.hasOwnProperty('msisdn') || opts['msisdn'] === '') {
      return sendErrorResponse(callback, new Error(_ERROR_MESSAGES.missingOrWrongParameter + '"msisdn"'));
    }
    data['msisdn'] = opts['msisdn'];

    if (opts.hasOwnProperty('moHttpUrl') && opts['moHttpUrl'] !== '') {
      data['moHttpUrl'] = encodeURIComponent(opts['moHttpUrl']);
    }

    if (opts.hasOwnProperty('moSmppSysType') && opts['moSmppSysType'] !== '') {
      data['moSmppSysType'] = opts['moSmppSysType'];
    }

    if (opts.hasOwnProperty('voiceCallbackType') && opts['voiceCallbackType'] !== '') {
      data['voiceCallbackType'] = opts['voiceCallbackType'];
    }

    if (opts.hasOwnProperty('voiceCallbackValue') && opts['voiceCallbackValue'] !== '') {
      data['voiceCallbackValue'] = opts['voiceCallbackValue'];
    }

    if (opts.hasOwnProperty('voiceStatusCallback') && opts['voiceStatusCallback'] !== '') {
      data['voiceStatusCallback'] = opts['voiceStatusCallback'];
    }

    sendRequest('POST', _ENDPOINT.numberUpdate, data, callback);
  },

  /**
   * Search: Message - Search a previously sent message for a given message id
   *
   * @param {string} messageId - Your message id received at submission time
   * @param {requestCallback} callback - The callback that handles the response
   */
  searchMessage: function(messageId, callback) {
    if (!messageId) {
      sendErrorResponse(callback, new Error(_ERROR_MESSAGES.invalidMessageId));
    } else {
      var data = {
        id: messageId
      };

      sendRequest('GET', _ENDPOINT.searchMessage, data, callback);
    }
  },

  /**
   * Search: Message - Search sent messages by message ids
   *
   * @param {Array} messageIds - A list of message ids, up to 10
   * @param {requestCallback} callback - The callback that handles the response
   */
  searchMessageByIds: function(messageIds, callback) {
    if (!messageIds || messageIds.length === 0) {
      sendErrorResponse(callback, new Error(_ERROR_MESSAGES.invalidMessageId));
    } else {
      if (messageIds.length > 10) {
        sendErrorResponse(callback, new Error(_ERROR_MESSAGES.tooManyMessageId));
      } else {
        var data = { ids: [] };

        for (var idx = 0, len = messageIds.length; idx < len; idx++) {
          data.ids.push(messageIds[idx]);
        }

        sendRequest('GET', _ENDPOINT.searchMessages, data, callback);
      }
    }
  },

  /**
   * Search: Message - Search sent messages by recipient and date
   *
   * @param {string} date - Message date submission YYYY-MM-DD
   * @param {string} to - A recipient number
   * @param {requestCallback} callback - The callback that handles the response
   */
  searchMessagesByRecipient: function(opts, callback) {
    var data = {};

    if (typeof opts !== 'object') {
      return sendErrorResponse(callback, new Error(_ERROR_MESSAGES.missingOrWrongParameter));
    }

    if (!opts.hasOwnProperty('date') || opts['date'] === '') {
      return sendErrorResponse(callback, new Error(_ERROR_MESSAGES.missingOrWrongParameter + '"date"'));
    }
    data['date'] = opts['date'];

    if (!opts.hasOwnProperty('to') || opts['to'] === '') {
      return sendErrorResponse(callback, new Error(_ERROR_MESSAGES.missingOrWrongParameter + '"to"'));
    }
    data['to'] = opts['to'];

    sendRequest('GET', _ENDPOINT.searchMessages, data, callback);
  },

  /**
   * Search: Rejections - Search rejected messages
   *
   * @param {string} date - Message date submission YYYY-MM-DD
   * @param {string} to - Optional. a recipient number
   * @param {requestCallback} callback - The callback that handles the response
   */
  searchRejections: function(opts, callback) {
    var data = {};

    if (typeof opts !== 'object') {
      return sendErrorResponse(callback, new Error(_ERROR_MESSAGES.missingOrWrongParameter));
    }

    if (!opts.hasOwnProperty('date') || opts['date'] === '') {
      return sendErrorResponse(callback, new Error(_ERROR_MESSAGES.missingOrWrongParameter + '"date"'));
    }
    data['date'] = opts['date'];

    if (opts.hasOwnProperty('to') || opts['to'] !== '') {
      data['to'] = opts['to'];
    }

    sendRequest('GET', _ENDPOINT.searchRejections, data, callback);
  }
};

/**
 * Send HTTP/HTTPS request
 *
 * @param {string} method - HTTP method
 * @param {string} path - Request path
 * @param {string} data - Stringify data
 * @param {requestCallback} callback - The callback that handles the response
 * @private
 */
function sendRequest(method, path, data, callback) {
  if (!_api.initialized) {
    throw _ERROR_MESSAGES.initializeRequired;
  }

  var credentials = {
    api_key: _api.key,
    api_secret: _api.secret
  };

  var dataString = querystring.stringify(credentials);

  if (data) {
    dataString += '&' + querystring.stringify(data);
  }

  var header = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'accept': 'application/json'
  };

  // Setting Content-Length header when using POST action
  if (method === 'POST') {
    header['Content-Length'] = dataString.length;
  } else {
    path += '?' + dataString;
  }

  var baseUrl = _api.baseUrl;
  // TTS has different base url
  if (path.indexOf('tts') !== -1) {
    baseUrl = 'api.nexmo.com';
  }

  var options = {
    host: baseUrl,
    port: 443,
    path: path,
    method: method,
    headers: header
  };

  var request;
  if (!_api.useSSL) {
    options.port = 80;
    request = http.request(options);
  } else {
    request = https.request(options);
  }

  log(options);

  if (method === 'POST') {
    request.write(dataString);
  }

  request.end();

  var buffer = '';
  request.on('response', function (response) {
    response.setEncoding('utf8');

    response.on('data', function (chunk) {
      buffer += chunk;
    });

    response.on('end', function () {
      var responseData;

      log('response ended');

      if (callback) {
        var err = null;

        // Number api only return http status
        if (path === _ENDPOINT.numberBuy || path === _ENDPOINT.numberCancel || path === _ENDPOINT.numberUpdate) {
          // Http Status 200 if successful purchase
          // Http Status 401 if wrong credentials
          // Http Status 420 if wrong parameters
          if (response.statusCode === 200) {
            responseData = response.statusCode;
          } else {
            err = response.statusCode;
          }
        } else {
          try {
            responseData = JSON.parse(buffer);
          } catch (_error) {
            var parserError = _error;
            log(parserError);
            log('could not convert API response to JSON, above error is ignored and raw API response is returned to client');
            err = parserError;
          }
        }

        callback(err, responseData);
      }
    });

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
 * Send back or throw out error response
 *
 * @param {requestCallback} callback - The callback that handles the response
 * @param {Object} err - Error object
 * @param {Object} returnData - Response data
 * @private
 */
function sendErrorResponse(callback, err, returnData) {
  if (callback) {
    callback(err, returnData);
  } else {
    throw err;
  }
};

/**
 * Logging messages
 *
 * @param {Object} - Message object
 * @private
 */
function log(message) {
  if (message instanceof Error) {
    console.log(message.stack);
  }

  if (_api.debug) {
    if (typeof message === 'object') {
      console.log(JSON.stringify(message, null, 2));
    } else {
      console.log(message);
    }
  }
}

/**
 * Module exports
 */
module.exports = Nexmo;
