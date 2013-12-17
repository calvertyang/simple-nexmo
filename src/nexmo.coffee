#
# The MIT License (MIT)
#
# Copyright © 2013 Calvert Yang
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
#

#
# Module dependencies.
#
http = require 'http'
https = require 'https'
querystring = require 'querystring'

do ->
  _VERSION = '1.0.4'

  Nexmo = ->
    #
    # @constant
    #
    _HEADERS =
      'Content-Type': 'application/x-www-form-urlencoded'
      'accept':'application/json'

    _BASE_URL = 'rest.nexmo.com'

    _ENDPOINT =
      # Messaging SMS API
      sms: '/sms/json'
      # Messaging USSD API
      ussd: '/ussd/json'
      # Voice API
      tts: '/tts/json'
      # Developer API
      accountGetBalance: '/account/get-balance'
      accountPricing: '/account/get-pricing/outbound'
      accountSettings: '/account/settings'
      accountTopUp: '/account/top-up'
      accountNumbers: '/account/numbers'
      numberSearch: '/number/search'
      numberBuy: '/number/buy'
      numberCancel: '/number/cancel'
      numberUpdate: '/number/update'
      searchMessage: '/search/message'
      searchMessages: '/search/messages'
      searchRejections: '/search/rejections'

    _ERROR_MESSAGES =
      initializeRequired: 'nexmo not initialized, call nexmo.initialize(api_key, api_secret) first before calling any nexmo API'
      keyAndSecretRequired: 'Key and secret cannot be empty'
      invalidTextMessage: 'Invalid text message'
      invalidBody: 'Invalid body value in binary message'
      invalidUdh: 'Invalid udh value in binary message'
      invalidTitle: 'Invalid title in WAP push message'
      invalidUrl: 'Invalid url in WAP push message'
      invalidSender: 'Invalid from address'
      invalidRecipient: 'Invalid to address'
      invalidCountryCode: 'Invalid country code'
      invalidMsisdn: 'Invalid MSISDN passed'
      invalidMessageId: 'Invalid message id(s)'
      tooManyMessageId: 'Too many message id'
      invalidDate: 'Invalid date value'
      invalidNewSecret: 'Invalid new secret'
      invalidCallbackUrl: 'Invalid callback url'
      invalidTransactionId: 'Invalid transaction id'

    #
    # Settings
    #
    # @private
    #
    _apiKey = ''
    _apiSecret = ''
    _useHttps = false
    _debugMode = false
    _initialized = false

    #
    # Initialize settings, protocol and debug are optional.
    #
    # @param {String} Api key
    # @param {String} Api secret
    # @param {String} Optional, protocol `http` or `https`
    # @param {Boolean} Optional, show debug messages
    # @api public
    #
    initialize = (key, secret, protocol, debug) ->
      throw _ERROR_MESSAGES.keyAndSecretRequired if !key || !secret

      _apiKey = key
      _apiSecret = secret
      _useHttps = if protocol is 'https' then true else false
      _debugMode = debug
      _initialized = true
      return

    #
    # Messaging SMS - Send a Plain text message
    #
    # @param {String} Sender address may be alphanumeric.
    # @param {String} Mobile number in international format, and one recipient per request.
    # @param {String} Body of the text message
    # @param {Function} Callback function
    # @api public
    #
    sendTextMessage = (sender, recipient, message, callback) ->
      if !message
        sendErrorResponse callback, new Error _ERROR_MESSAGES.invalidTextMessage
        return
      else
        options =
          from: sender
          to: recipient
          type: 'unicode'
          text: message

        sendMessage options, callback
        return

    #
    # Messaging SMS - Send a Binary data message
    #
    # @param {String} Sender address may be alphanumeric.
    # @param {String} Mobile number in international format, and one recipient per request.
    # @param {String} Hex encoded binary data.
    # @param {String} Hex encoded udh.
    # @param {Function} Callback function
    # @api public
    #
    sendBinaryMessage = (sender, recipient, body, udh, callback) ->
      if !body
        sendErrorResponse callback, new Error _ERROR_MESSAGES.invalidBody
        return
      else if !udh
        sendErrorResponse callback, new Error _ERROR_MESSAGES.invalidUdh
        return
      else
        options =
          from: sender
          to: recipient
          type: 'binary'
          body: body
          udh: udh

        sendMessage options, callback
        return

    #
    # Messaging SMS - Send a WAP push message
    #
    # @param {String} Sender address may be alphanumeric.
    # @param {String} Mobile number in international format, and one recipient per request.
    # @param {String} Title of WAP Push.
    # @param {String} WAP Push URL.
    # @param {String} Optional, set how long WAP Push is available in milliseconds.
    # @param {Function} Callback function
    # @api public
    #
    sendWapPushMessage = (sender, recipient, title, url, validity, callback) ->
      if !title
        sendErrorResponse callback, new Error _ERROR_MESSAGES.invalidTitle
        return
      else if !url
        sendErrorResponse callback, new Error _ERROR_MESSAGES.invalidUrl
        return
      else
        if typeof validity == 'function'
          callback = validity
          validity = 172800000

        options =
          from: sender
          to: recipient
          type: 'wappush'
          title: title
          url: encodeURIComponent url
          validity: validity

        sendMessage options, callback
        return

    #
    # Account: Pricing - Retrieve current account balance
    # HTTP Verb: GET
    #
    # @param {Function} Callback function
    # @api public
    #
    getBalance = (callback) ->
      endpoint = getPath _ENDPOINT.accountGetBalance
      sendRequest endpoint, callback
      return

    #
    # Account: Pricing - Retrieve our outbound pricing for a given country
    # HTTP Verb: GET
    #
    # @param {String} A 2 letter country code.
    # @param {Function} Callback function
    # @api public
    #
    getPricing = (countryCode ,callback) ->
      if !countryCode || countryCode.length != 2
        sendErrorResponse callback, new Error _ERROR_MESSAGES.invalidCountryCode
        return
      else
        endpoint = getPath(_ENDPOINT.accountPricing) + '&country=' + countryCode
        sendRequest endpoint, callback
        return

    #
    # Account: Settings - Update API secret
    # HTTP Verb: POST
    #
    # @param {String} New API secret
    # @param {Function} Callback function
    # @api public
    #
    updateSecret = (newSecret, callback) ->
      if !newSecret || newSecret.length > 8
        sendError callback, new Error _ERROR_MESSAGES.invalidNewSecret
        return
      else
        endpoint = getPath(_ENDPOINT.accountSettings) + '&newSecret=' + encodeURIComponent newSecret
        sendRequest endpoint, 'POST', callback
        return

    #
    # Account: Settings - Update inbound call back URL
    # HTTP Verb: POST
    #
    # @param {String} Inbound call back URL.
    # @param {Function} Callback function
    # @api public
    #
    updateMoCallBackUrl = (newUrl, callback) ->
      if !newUrl
        sendError callback, new Error _ERROR_MESSAGES.invalidCallbackUrl
        return
      else
        endpoint = getPath(_ENDPOINT.accountSettings) + '&moCallBackUrl=' + encodeURIComponent newUrl
        sendRequest endpoint, 'POST', callback
        return

    #
    # Account: Settings - Update DLR call back URL
    # HTTP Verb: POST
    #
    # @param {String} DLR call back URL.
    # @param {Function} Callback function
    # @api public
    #
    updateDrCallBackUrl = (newUrl, callback) ->
      if !newUrl
        sendError callback, new Error _ERROR_MESSAGES.invalidCallbackUrl
        return
      else
        endpoint = getPath(_ENDPOINT.accountSettings) + '&drCallBackUrl=' + encodeURIComponent newUrl
        sendRequest endpoint, 'POST', callback
        return

    #
    # Account: Top Up - Top-up your account, only if you have turn-on the 'auto-reload' feature.
    # HTTP Verb: GET
    #
    # @param {String} The transaction id associated with your **first** 'auto reload' top-up.
    # @param {Function} Callback function
    # @api public
    #
    getTopUp = (transactionId, callback) ->
      if !transactionId
        sendError callback, new Error _ERROR_MESSAGES.invalidTransactionId
        return
      else
        endpoint = getPath(_ENDPOINT.accountTopUp) + '&trx=' + transactionId
        sendRequest endpoint, 'POST', callback
        return

    #
    # Account: Numbers - Get all inbound numbers associated with Nexmo account
    # HTTP Verb: GET
    #
    # @param {Function} Callback function
    # @api public
    #
    getNumbers = (callback) ->
      endpoint = getPath _ENDPOINT.accountNumbers
      sendRequest endpoint, callback
      return

    #
    # Number: Search - Get available inbound numbers for a given country
    # HTTP Verb: GET
    #
    # @param {String} Country code.
    # @param {String} Optional, a matching pattern.
    # @param {Integer} Optional, page index (> 0, default 1).
    # @param {Integer} Optional, page size (max 100, default 10).
    # @param {Function} Callback function
    # @api public
    #
    searchNumbers = (countryCode, pattern, index, size, callback) ->
      if !countryCode || countryCode.length != 2
        sendErrorResponse callback, new Error _ERROR_MESSAGES.invalidCountryCode
        return
      else
        endpoint = getPath(_ENDPOINT.numberSearch) + '&country=' + countryCode
        if typeof pattern == 'function'
          callback = pattern
        else
          endpoint += '&pattern=' + pattern
          if typeof index == 'function'
            callback = index
          else
            endpoint += '&index=' + index
            if typeof size == 'function'
              callback = size
            else
              endpoint += '&size=' + size

        sendRequest endpoint, callback
        return

    #
    # Number: Buy - Purchase a given inbound number
    # HTTP Verb: POST
    #
    # @param {String} Country code.
    # @param {String} An available inbound number
    # @param {Function} Callback function
    # @api public
    #
    buyNumber = (countryCode, msisdn, callback) ->
      if !countryCode || countryCode.length != 2
        sendErrorResponse callback, new Error _ERROR_MESSAGES.invalidCountryCode
        return
      else if !msisdn || msisdn.length < 10 # check if MSISDN validation is correct for international numbers
        sendErrorResponse callback, new Error _ERROR_MESSAGES.invalidMsisdn
        return
      else
        endpoint = getPath(_ENDPOINT.numberBuy) + '&country=' + countryCode + '&msisdn=' + msisdn
        sendRequest endpoint, 'POST', callback
        return

    #
    # Number: Cancel - Cancel a given inbound number subscription
    # HTTP Verb: POST
    #
    # @param {String} Country code.
    # @param {String} One of your inbound numbers
    # @param {Function} Callback function
    # @api public
    #
    cancelNumber = (countryCode, msisdn, callback) ->
      if !countryCode || countryCode.length != 2
        sendErrorResponse callback, new Error _ERROR_MESSAGES.invalidCountryCode
        return
      else if !msisdn || msisdn.length < 10
        sendErrorResponse callback, new Error _ERROR_MESSAGES.invalidMsisdn
        return
      else
        endpoint = getPath(_ENDPOINT.numberCancel) + '&country=' + countryCode + '&msisdn=' + msisdn
        sendRequest endpoint, 'POST', callback
        return

    #
    # Number: Update - Update your number callback.
    # HTTP Verb: POST
    #
    # @param {String} Country code.
    # @param {String} One of your inbound numbers
    # @param {String} Optional, number call back URL
    # @param {String} Optional, the associated system type for SMPP client only
    # @param {Function} Callback function
    # @api public
    #
    updateNumberCallback = (countryCode, msisdn, newUrl, sysType, callback) ->
      throw 'Not yet implemented!'
      return

    #
    # Search: Message - Search a previously sent message for a given message id
    # HTTP Verb: GET
    #
    # @param {String} Your message id received at submission time
    # @param {Function} Callback function
    # @api public
    #
    searchMessage = (messageId, callback) ->
      if !messageId
        sendErrorResponse callback, new Error _ERROR_MESSAGES.invalidMessageId
        return
      else
        endpoint = getPath(_ENDPOINT.searchMessage) + '&id=' + messageId
        sendRequest endpoint, callback
        return

    #
    # Search: Message - Search sent messages by message ids
    # HTTP Verb: GET
    #
    # @param {Array} A list of message ids, up to 10
    # @param {Function} Callback function
    # @api public
    #
    searchMessageByIds = (messageIds, callback) ->
      if !messageIds || messageIds.length == 0
        sendErrorResponse callback, new Error _ERROR_MESSAGES.invalidMessageId
        return
      else
        if messageIds.length > 10
          sendErrorResponse callback, new Error _ERROR_MESSAGES.tooManyMessageId
          return
        else
          endpoint = getPath(_ENDPOINT.searchMessages) + '&'
          idLength = messageIds.length
          for id, idx in messageIds
            endpoint += 'ids=' + id

            if idx < idLength - 1
              endpoint += '&'

          sendRequest endpoint, callback
          return

    #
    # Search: Message - Search sent messages by recipient and date
    # HTTP Verb: GET
    #
    # @param {String} Message date submission YYYY-MM-DD
    # @param {String} A recipient number
    # @param {Function} Callback function
    # @api public
    #
    searchMessagesByRecipient = (date, to, callback) ->
      if !date
        sendErrorResponse callback, new Error _ERROR_MESSAGES.invalidDate
        return
      else if !to
        sendErrorResponse callback, new Error _ERROR_MESSAGES.invalidRecipient
        return
      else
        endpoint = getPath(_ENDPOINT.searchMessages) + '&date=' + date + '&to=' + to
        sendRequest endpoint, callback
        return

    #
    # Search: Rejections - Search rejected messages
    # HTTP Verb: GET
    #
    # @param {String} Message date submission YYYY-MM-DD
    # @param {String} Optional, a recipient number
    # @param {Function} Callback function
    # @api public
    #
    searchRejections = (date, to, callback) ->
      if !date
        sendErrorResponse callback, new Error _ERROR_MESSAGES.invalidDate
        return
      else
        endpoint = getPath(_ENDPOINT.searchRejections) + '&date=' + date
        if typeof to == 'function'
          callback = to
        else if to
          endpoint += '&to=' + to

        sendRequest endpoint, callback
        return

    #
    # Check SMS required parameter and send out message
    # HTTP Verb: POST
    #
    # @api private
    #
    sendMessage = (data, callback) ->
      if !data.from
        sendErrorResponse callback, new Error _ERROR_MESSAGES.invalidSender
        return
      else if !data.to
        sendErrorResponse callback, new Error _ERROR_MESSAGES.invalidRecipient
        return
      else
        endpoint = getPath(_ENDPOINT.sms) + '&' + querystring.stringify(data)
        log 'Sending message from ' + data.from + ' to ' + data.to + ' with message ' + data.text
        sendRequest endpoint, 'POST', (err, apiResponse) ->
          if !err && apiResponse.status && apiResponse.messages[0].status > 0
            sendErrorResponse callback, new Error apiResponse.messages[0]['error-text'], apiResponse
            return
          else
            if callback
              callback err, apiResponse
              return
        return

    #
    # Send HTTP/HTTPS request to nexmo
    #
    # @api private
    #
    sendRequest = (path, method, callback) ->
      if  !_initialized
        throw _ERROR_MESSAGES.initializeRequired

      if typeof method == 'function'
        callback = method
        method = 'GET'

      options =
        host: _BASE_URL
        port: 80
        path: path
        method: method
        headers: _HEADERS

      log options

      if _useHttps
        options.port = 443
        request = https.request options
      else
        request = http.request options

      request.end()

      buffer = ''
      request.on 'response', (response) ->
        response.setEncoding 'utf8'

        response.on 'data', (chunk) ->
          buffer += chunk
          return

        response.on 'end', () ->
          log 'response ended'
          if callback
            err = null
            try
              responseData = JSON.parse buffer
            catch parserError
              # ignore parser error for now and send raw response to client
              log parserError
              log 'could not convert API response to JSON, above error is ignored and raw API response is returned to client'
              err = parserError

            callback err, responseData
            return

        response.on 'close', (e) ->
          log 'problem with API request detailed stacktrace below '
          log e
          callback e
          return

        return

      request.on 'error', (e) ->
        log 'problem with API request detailed stacktrace below '
        log e
        callback e
        return

      return

    #
    # Get api endpoint path
    #
    # @api private
    #
    getPath = (action) ->
      credentials =
        api_key: _apiKey
        api_secret: _apiSecret

      return action + '?' + querystring.stringify credentials

    #
    # Send back or throw out error response
    #
    # @api private
    #
    sendErrorResponse = (callback, err, returnData) ->
      # Throw the error in case if there is no callback passed
      if callback
        callback err, returnData
        return
      else
        throw err

    #
    # Logging messages
    #
    # @api private
    #
    log = (message) ->
      if message instanceof Error
        console.log message.stack

      if _debugMode
        if typeof message == 'object'
          console.dir message
          return
        else
          console.log message
          return

    return (
      VERSION: _VERSION
      init: initialize
      sendTextMessage: sendTextMessage
      sendBinaryMessage: sendBinaryMessage
      sendWapPushMessage: sendWapPushMessage
      getBalance: getBalance
      getPricing: getPricing
      updateSecret: updateSecret
      updateMoCallBackUrl: updateMoCallBackUrl
      updateDrCallBackUrl: updateDrCallBackUrl
      getTopUp: getTopUp
      getNumbers: getNumbers
      searchNumbers: searchNumbers
      buyNumber: buyNumber
      cancelNumber: cancelNumber
      updateNumberCallback: updateNumberCallback
      searchMessage: searchMessage
      searchMessageByIds: searchMessageByIds
      searchMessagesByRecipient: searchMessagesByRecipient
      searchRejections: searchRejections
    )

  #
  # Module exports.
  #
  module.exports = Nexmo
