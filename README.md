## A nodejs wrapper for nexmo API

[![NPM version](https://badge.fury.io/js/simple-nexmo.svg)](https://npmjs.org/package/simple-nexmo)
<!--[![Build Status](https://travis-ci.org/CalvertYang/simple-nexmo.svg)](https://travis-ci.org/calvertyang/simple-nexmo)-->

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

`baseUrl`: **Optional.** Set to rest-sandbox.nexmo.com to test in sandbox (Default: rest.nexmo.com, except TTS message)

`useSSL`: **Optional.** Set to true to use HTTP protocol instead HTTPS (Default: true)

`debug` : **Optional.** Set to true to see debug informations (Default: false)

## Supported API

#### SMS API
 * nexmo.[sendSMSMessage](#sendSMSMessage)(`options`, `callback`)

#### Voice API
 * nexmo.[generateCall](#generateCall)(`options`, `callback`)
 * nexmo.[sendTTSMessage](#sendTTSMessage)(`options`, `callback`)

#### Developer API
 * nexmo.[getBalance](#getBalance)(`callback`)
 * nexmo.[getPricing](#getPricing)(`country` ,`callback`)
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

> options.`from`: **Required.** An alphanumeric string giving your sender address. Ex: `MyCompany20`
>
> options.`to`: **Required.** A single phone number in international format, that is [E.164](https://en.wikipedia.org/wiki/E.164). Ex: `886912345678`
>
> options.`type`: **Required.** Default value is text. Possible values are `text`(plain text SMS), `binary`(binary SMS), `wappush`(WAP Push), `unicode`(plain text SMS in [unicode](https://en.wikipedia.org/wiki/unicode)), `vcal`(calendar event), `vcard`(business card)
>
> options.`text`: **Required** when type='text' or type='unicode'. Body of the text message. UTF-8 and URL encoded value.
>
> options.`status-report-req`: **Optional.** Set to 1 to receive a Delivery Receipt (DLR). Make sure to configure your "Callback URL" in your "API Settings"
>
> options.`client-ref`: **Optional.** A 40 character reference string for your internal reporting.
>
> options.`vcard`: **Optional.** A business card in [vCard](https://en.wikipedia.org/wiki/VCard). You must set the type parameter to vcard.
>
> options.`vcal`: **Optional.** A calendar event in [vCal](https://en.wikipedia.org/wiki/VCal). You must set the type parameter to vcal.
>
> options.`ttl`: **Optional.** The lifespan of this SMS in milliseconds.
>
> options.`callback` : **Optional** The Callback URL the delivery receipt for this call is sent to. This parameter overrides the Callback URL you set in Nexmo Dashboard.
>
> options.`message-class`: **Optional.** Set to 0 for [Flash SMS](https://en.wikipedia.org/wiki/Short_Message_Service#Flash_SMS). Possible values are from 0 to 3 inclusive.
>
> options.`udh`: **Required** when type='binary'. Your custom Hex encoded [User Data Header (UDH)](https://en.wikipedia.org/wiki/User_Data_Header). Ex: `06050415811581`
>
> options.`protocol-id`: **Required** when type='binary'. The value in decimal format for the [higher level protocol](https://en.wikipedia.org/wiki/GSM_03.40#Protocol_Identifier) to use for this SMS.
>
> options.`body`: **Required** when type='binary'. Hex encoded binary data. Ex: `0011223344556677`
>
> options.`title`: **Required** when type='wappush'. The title for a wappush SMS. Ex: `MySite`
>
> options.`url`: **Required** when type='wappush'. The URL your user taps to navigate to your website. Ex: `http://www.mysite.com`
>
> options.`validity`: **Optional** when type='wappush'. The availibility period for a wappush type SMS in milliseconds. (Default: 48 hours) Ex: `86400000`

<a name="generateCall"></a>
#### Voice - Generate voice calls over regular phone numbers

```js
nexmo.generateCall(options, callback)
```

> options.`to`: **Required.** A single phone number in international format, that is [E.164](https://en.wikipedia.org/wiki/E.164). Ex: `886912345678`
>
> options.`answer_url`: **Required** A URL pointing to the VoiceXML file on your HTTP server that controls your Call.
>
> options.`from`: **Optional.** A voice-enabled virtual number associated with your Nexmo account.
>
> options.`machine_detection`: **Optional.** How to behave when an answering machine is detected.
>
> options.`machine_timeout`: **Optional.** The time in milliseconds used to distinguish between human and machine events.
>
> options.`answer_method`: **Optional.** The HTTP method used to send a response to your answer_url.
>
> options.`error_url`: **Optional.** Send the VoiceXML error message to this URL if there's a problem requesting or executing the VoiceXML referenced in the answer_url
>
> options.`error_method`: **Optional.** The HTTP method used to send an error message to your error_url.
>
> options.`status_url`: **Optional.** Nexmo sends the Call Return Parameters to this Callback URL in order to notify your App that the Call has ended.
>
> options.`status_method`: **Optional.** The HTTP method used to send the status message to your status_url. Must be GET (default) or POST.

<a name="sendTTSMessage"></a>
#### Voice - Send a text to speech message

```js
nexmo.sendTTSMessage(options, callback)
```

> options.`to`: **Required.** The single phone number to call for each request. This number must be in international format, that is [E.164](https://en.wikipedia.org/wiki/E.164). Ex: `886912345678`
>
> options.`from`: **Optional.** A voice-enabled virtual number associated with your Nexmo account.
>
> options.`text`: **Required.** A UTF-8 and URL encoded message that is sent to your user. This message can be up to 1500 characters).
>
> `lg`: **Optional.** The [language](https://docs.nexmo.com/api-ref/voice-api/supported-languages) used to synthesize the message. (Default: en-us)
>
> options.`voice`: **Optional.** The gender of the voice used for the TTS. (Default: female)
>
> options.`repeat`: **Optional.** Define how many times you want to repeat the text message. (Default: 1, Maximum: 10)
>
> options.`machine_detection`: **Optional.** How to behave when an answering machine is detected.
>
> options.`machine_timeout`: **Optional.** The time to check if this TTS has been answered by a machine.
>
> options.`callback`: **Optional.** Nexmo sends the Text-To-Speech Return Parameters to this URL to tell your App how the call was executed.
>
> options.`callback_method`: **Optional.** The HTTP method used to send the status message to your callback. Must be GET (default) or POST.

<a name="getBalance"></a>
#### Account: Get Balance - Retrieve current account balance

```js
nexmo.getBalance(callback)
```

<a name="getPricing"></a>
#### Account: Pricing - Retrieve our outbound pricing for a given country

```js
nexmo.getPricing(country ,callback)
```

> `country`: **Required.** A 2 letter country code. Ex: `TW`

<a name="updateSettings"></a>
#### Account: Settings - Update API secret

```js
nexmo.updateSettings(options, callback)
```

> options.`newSecret`: **Optional.** Your new API secret.
>
> options.`moCallBackUrl`: **Optional.** Inbound call back URL. The URL should be active to be taken into account.
>
> options.`drCallBackUrl`: **Optional.** DLR call back URL. The URL should be active to be taken into account.

<a name="getTopUp"></a>
#### Account: Top Up - Top-up your account, only if you have turn-on the 'auto-reload' feature. The top-up amount is the one associated with your 'auto-reload' transaction.

```js
nexmo.getTopUp(transactionId, callback)
```

> `transactionId`: **Required**. The id associated with your **original** 'auto reload' transaction Payment & Billing. Ex: `00X123456Y7890123Z`

<a name="getNumbers"></a>
#### Account: Numbers - Get all inbound numbers associated with Nexmo account

```js
nexmo.getNumbers(options, callback)
```

> options.`index`: **Optional.** Page index (>0, default 1). Ex: `2`
>
> options.`size`: **Optional.** Page size (max 100, default 10). Ex: `25`
>
> options.`pattern`: **Optional.** A matching pattern. Ex: `33`
>
> options.`search_pattern`: **Optional.** Strategy for matching pattern.
>

<a name="searchNumbers"></a>
#### Number: Search - Get available inbound numbers for a given country

```js
nexmo.searchNumbers(options, callback)
```

> options.`country`: **Required.** Country code. Ex: `TW`
>
> options.`pattern`: **Optional.** A matching pattern. Ex: `886`
>
> options.`search_pattern`: **Optional.** Strategy for matching pattern.
>
> options.`features`: **Optional.** Available features are SMS and VOICE, use a comma-separated values. Ex: `SMS`, `VOICE`
>
> options.`index`: **Optional.** Page index (>0, default 1). Ex: `2`
>
> options.`size`: **Optional.** Page size (max 100, default 10). Ex: `25`

<a name="buyNumber"></a>
#### Number: Buy - Purchase a given inbound number

```js
nexmo.buyNumber(options, callback)
```

> options.`country`: **Required.** Country code. Ex: `TW`
>
> options.`msisdn`: **Required.** An available inbound number Ex: `886277417424`

<a name="cancelNumber"></a>
#### Number: Cancel - Cancel a given inbound number subscription

```js
nexmo.cancelNumber(options, callback)
```

> options.`country`: **Required.** Country code. Ex: `TW`
>
> options.`msisdn`: **Required.** One of your inbound numbers Ex: `886277417424`

<a name="updateNumber"></a>
#### Number: Update - Update your number callback

```js
nexmo.updateNumber(options, callback)
```

> options.`country`: **Required.** Country code. Ex: `TW`
>
> options.`msisdn`: **Required.** One of your inbound numbers Ex: `886277417424`
>
> options.`moHttpUrl`: **Optional.** The URL should be active to be taken into account.
>
> options.`moSmppSysType`: **Optional.** The associated system type for SMPP client only Ex: `inbound`
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

> Copyright © 2015 Calvert Yang
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

![Analytics](https://ga-beacon.appspot.com/UA-44933497-3/CalvertYang/simple-nexmo?pixel)
