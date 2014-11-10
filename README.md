## A nodejs wrapper for nexmo API to send SMS

[![NPM version](https://badge.fury.io/js/simple-nexmo.svg)](https://npmjs.org/package/simple-nexmo)
[![Build Status](https://travis-ci.org/CalvertYang/simple-nexmo.svg)](https://travis-ci.org/calvertyang/simple-nexmo)

[![NPM status](https://nodei.co/npm/simple-nexmo.png?downloads=true&stars=true)](https://npmjs.org/package/simple-nexmo)

## Installation

The preferred way to install is use the [npm](http://npmjs.org) package manager for Node.js.

```sh
$ npm install simple-nexmo
```

## Initialize

After you've installed, you can require the package in your node application using `require`:

```js
var Nexmo = require('simple-nexmo');
```

```js
var nexmo = new Nexmo({
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET',
  baseUrl: 'API_BASE_URL',
  useSSL: true,
  debug: false
});
```

`apiKey`、`apiSecret`: **Required.** You can find them in "API Settings" in [Nexmo Dashboard](https://dashboard.nexmo.com/private/dashboard)

`baseUrl`: **Optional.** Set to rest-sandbox.nexmo.com to test in sandbox (Default: rest.nexmo.com)

`useSSL`: **Optional.** Set to true to use HTTP protocol instead HTTPS (Default: true)

`debug` : **Optional.** Set to true to see debug informations (Default: false)

## Supported API

#### SMS API
 * nexmo.[sendSMSMessage](#sendSMSMessage)(`options`, `callback`)

#### Voice API
 * nexmo.[sendTTSMessage](#sendTTSMessage)(`options`, `callback`)

#### Developer API
 * nexmo.[getBalance](#getBalance)(`callback`)
 * nexmo.[getPricing](#getPricing)(`countryCode` ,`callback`)
 * nexmo.[updateSettings](#updateSecret)(`options`, `callback`)
 * nexmo.[getTopUp](#getTopUp)(`transactionId`, `callback`)
 * nexmo.[getNumbers](#getNumbers)(`options`, `callback`)
 * nexmo.[searchNumbers](#searchNumbers)(`options`, `callback`)
 * nexmo.[buyNumber](#buyNumber)(`options`, `callback`)
 * nexmo.[cancelNumber](#cancelNumber)(`options`, `callback`)
 * nexmo.[updateNumber](#updateNumber)(`options`, `callback`)
 * nexmo.[searchMessage](#searchMessage)(`messageId`, `callback`)
 * nexmo.[searchMessageByIds](#searchMessageByIds)(`messageIds`, `callback`)
 * nexmo.[searchMessagesByRecipient](#searchMessagesByRecipient)(`options`, `callback`)
 * nexmo.[searchRejections](#searchRejections)(`options`, `callback`)

## Unsupported API

All other API not listed above is unsupported.

---------------

<a name="sendSMSMessage"></a>
#### SMS - Send a plain text message

```js
nexmo.sendSMSMessage(options, callback)
```

> options.`from`: **Required.** Sender address may be alphanumeric. Ex: `MyCompany20`
>
> options.`to`: **Required.** Mobile number in international format, and one recipient per request. Ex: `886912345678` when sending to Taiwan
>
> options.`type`: **Required.** This can be Text message(text), Binary(binary), WAP Push(wappush), Unicode message(unicode), vcal(vcal) or vcard(vcard).
>
> options.`text`: **Required** when type='text' or type='unicode'. Body of the text message.
>
> options.`status-report-req`: **Optional.** Set to 1 if you want to receive a delivery report (DLR) for this request. Make sure to configure your "Callback URL" in your "API Settings"
>
> options.`client-ref`: **Optional.** Include any reference string for your reference. Useful for your internal reports (40 characters max).
>
> options.`network-code`: **Optional.** Force the recipient network operator MCCMNC, make sure to supply the correct information otherwise the message won't be delivered.
>
> options.`vcard`: **Optional.** vcard text body correctly formatted.
>
> options.`vcal`: **Optional.** vcal text body correctly formatted.
>
> options.`ttl`: **Optional.** Message life span in milliseconds.
>
> options.`message-class`: **Optional.** Set to 0 for [Flash SMS](http://en.wikipedia.org/wiki/Short_Message_Service#Flash_SMS).
>
> options.`body`: **Required** when type='binary'. Hex encoded binary data. Ex: body=0011223344556677
>
> options.`udh`: **Required** when type='binary'. Hex encoded udh. Ex: udh=06050415811581
>
> options.`title`: **Required** when type='wappush'. Title of WAP Push. Ex: title=MySite
>
> options.`url`: **Required** when type='wappush'. WAP Push URL. Ex: url=http%3a%2f%2fwww.mysite.com
>
> options.`validity`: **Optional** when type='wappush'. Set how long WAP Push is available in milliseconds. Ex: validity=86400000 (Default: 48 hours)

<a name="sendTTSMessage"></a>
#### Voice - Send a text to speech message

```js
nexmo.sendTTSMessage(options, callback)
```

> options.`to`: **Required.** Mobile number in international format, and one recipient per request. Ex: `886912345678` when sending to Taiwan
>
> options.`from`: **Optional.** A voice enabled inbound number associated with your account.
>
> options.`text`: **Required.** Body of the text message (with a maximum length of 1000 characters), UTF-8 and URL encoded value.
>
> `lg`: **Optional.** The language used to read the message, en-us "US english" is the default. Please refer [offical docuemnts](https://docs.nexmo.com/) to get supported languages and voices.
>
> options.`voice`: **Optional.** The voice to be used female (default) or male
>
> options.`repeat`: **Optional.** Define how many times you want to repeat the text message (default is 1 , maximum is 10).
>
> options.`machine_detection`: **Optional.** How to behave when an answering machine is detected.
>
> options.`machine_timeout`: **Optional.** Time allocated to analyze if the call has been answered by a machine. (Default: 15000 ms).
>
> options.`callback`: **Optional.** A URL to which Nexmo will send a request when the call ends to notify your application.
>
> options.`callback_method`: **Optional.** The HTTP method for your callback. Must be GET (default) or POST.

<a name="getBalance"></a>
#### Account: Get Balance - Retrieve current account balance

```js
nexmo.getBalance(callback)
```

<a name="getPricing"></a>
#### Account: Pricing - Retrieve our outbound pricing for a given country

```js
nexmo.getPricing(countryCode ,callback)
```

> `countryCode`: **Required.** A 2 letter country code. Ex: `TW`

<a name="updateSettings"></a>
#### Account: Settings - Update API secret

```js
nexmo.updateSettings(options, callback)
```

> options.`newSecret`: **Optional.** New API secret (8 characters max)
>
> options.`moCallBackUrl`: **Optional.** Inbound call back URL. The URL should be active to be taken into account.
>
> options.`drCallBackUrl`: **Optional.** DLR call back URL. The URL should be active to be taken into account.

<a name="getTopUp"></a>
#### Account: Top Up - Top-up your account, only if you have turn-on the 'auto-reload' feature. The top-up amount is the one associated with your 'auto-reload' transaction.

```js
nexmo.getTopUp(transactionId, callback)
```

> `transactionId`: **Required**. The transaction id associated with your **first** 'auto reload' top-up. Ex: 00X123456Y7890123Z

<a name="getNumbers"></a>
#### Account: Numbers - Get all inbound numbers associated with Nexmo account

```js
nexmo.getNumbers(options, callback)
```

> options.`index`: **Optional.** Page index (>0, default 1). Ex: 2
>
> options.`size`: **Optional.** Page size (max 100, default 10). Ex: 25
>
> options.`pattern`: **Optional.** A matching pattern. Ex: 33
>

<a name="searchNumbers"></a>
#### Number: Search - Get available inbound numbers for a given country

```js
nexmo.searchNumbers(options, callback)
```

> options.`countryCode`: **Required.** Country code. Ex: `TW`
>
> options.`pattern`: **Optional.** A matching pattern. Ex: `886`
>
> options.`features`: **Optional.** Available features are SMS and VOICE, use a comma-separated values. Ex: SMS,VOICE
>
> options.`index`: **Optional.** Page index (>0, default 1). Ex: `2`
>
> options.`size`: **Optional.** Page size (max 100, default 10). Ex: `25`

<a name="buyNumber"></a>
#### Number: Buy - Purchase a given inbound number

```js
nexmo.buyNumber(options, callback)
```

> options.`countryCode`: **Required.** Country code. Ex: `TW`
>
> options.`msisdn`: **Required.** An available inbound number Ex: `886277417424`

<a name="cancelNumber"></a>
#### Number: Cancel - Cancel a given inbound number subscription

```js
nexmo.cancelNumber(options, callback)
```

> options.`countryCode`: **Required.** Country code. Ex: `TW`
>
> options.`msisdn`: **Required.** One of your inbound numbers Ex: `886277417424`

<a name="updateNumber"></a>
#### Number: Update - Update your number callback

```js
nexmo.updateNumber(options, callback)
```

> options.`countryCode`: **Required.** Country code. Ex: `TW`
>
> options.`msisdn`: **Required.** One of your inbound numbers Ex: `886277417424`
>
> options.`moHttpUrl`: **Optional.** The URL should be active to be taken into account.
>
> options.`moSmppSysType`: **Optional.** The associated system type for SMPP client only Ex: inbound
>
> options.`voiceCallbackType`: **Optional.** The voice callback type for SIP end point (sip), for a telephone number (tel), for VoiceXML end point (vxml)
>
> options.`voiceCallbackValue`: **Optional.** The voice callback value based on the voiceCallbackType
>
> options.`voiceStatusCallback`: **Optional.** A URL to which Nexmo will send a request when the call ends to notify your application.

<a name="searchMessage"></a>
#### Search: Message - Search a previously sent message for a given message id

> `messageId`: **Required.** Your message id received at submission time Ex: `00A0B0C0`

```js
nexmo.searchMessage(messageId, callback)
```

<a name="searchMessageByIds"></a>
#### Search: Messages - Search sent messages by message ids

> `messageIds`: **Required.** A list of message ids, up to 10 Ex: `['00A0B0C0', '00A0B0C1', '00A0B0C2']`

```js
nexmo.searchMessageByIds(messageIds, callback)
```

<a name="searchMessagesByRecipient"></a>
#### Search: Messages - Search sent messages by recipient and date

```js
nexmo.searchMessagesByRecipient(options, callback)
```

> options.`date`: **Required.** Message date submission YYYY-MM-DD Ex: `2014-11-10`
>
> options.`to`: **Required.** A recipient number Ex: `886912345678`

<a name="searchRejections"></a>
#### Search: Rejections - Search rejected messages

```js
nexmo.searchRejections(options, callback)
```

> options.`date`: **Required.** Message date submission YYYY-MM-DD Ex: `2014-11-10`
>
> options.`to`: **Optional.** A recipient number Ex: `886912345678`

---

#### Callback

Callback from all API calls returns 2 parameters: error and a json object.

An example callback function:

```js
function callback (err, response) {
  if (err) {
    console.log(err);
  } else {
    console.dir(response);
  }
}
```

Refer [offical docuemnts](https://docs.nexmo.com/) to get the schema for the returned message response object.

## The MIT License (MIT)

> Copyright © 2014 Calvert Yang
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

![Analytics](https://ga-beacon.appspot.com/UA-44933497-3/CalvertYang/simple-nexmo?pixel)
