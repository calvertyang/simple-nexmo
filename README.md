## A nodejs wrapper for nexmo API to send SMS [![NPM version](https://badge.fury.io/js/simple-nexmo.png)](http://badge.fury.io/js/simple-nexmo)

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
var nexmo = new Nexmo();
```

`API_KEY`、`API_SECRET`: **Required.** You will find them in "API Settings" in [Nexmo Dashboard](https://dashboard.nexmo.com/private/dashboard)

`API_PROTOCOL`: **Optional.** http or https

`DEBUG_MODE` : **Optional.** Set to true to see debug informations

```js
nexmo.init(API_KEY, API_SECRET, API_PROTOCOL, DEBUG_MODE);
```

## Supported API

#### Messaging SMS API
 * nexmo.[sendTextMessage](#sendTextMessage)(`from`, `to`, `message`, `callback`)
 * nexmo.[sendBinaryMessage](#sendBinaryMessage)(`from`, `to`, `body`, `udh`, `callback`)
 * nexmo.[sendWapPushMessage](#sendWapPushMessage)(`from`, `to`, `title`, `url`, `validity`, `callback`)
 
#### Developer API
 * nexmo.[getBalance](#getBalance)(`callback`)
 * nexmo.[getPricing](#getPricing)(`countryCode` ,`callback`)
 * nexmo.[updateSecret](#updateSecret)(`newSecret`, `callback`)
 * nexmo.[updateMoCallBackUrl](#updateMoCallBackUrl)(`newUrl`, `callback`)
 * nexmo.[updateDrCallBackUrl](#updateDrCallBackUrl)(`newUrl`, `callback`)
 * nexmo.[getNumbers](#getNumbers)(`callback`)
 * nexmo.[searchNumbers](#searchNumbers)(`countryCode`, `pattern`, `index`, `size`, `callback`)
 * nexmo.[buyNumber](#buyNumber)(`countryCode`, `msisdn`, `callback`)
 * nexmo.[cancelNumber](#cancelNumber)(`countryCode`, `msisdn`, `callback`)
 * nexmo.[searchMessage](#searchMessage)(`messageId`, `callback`)
 * nexmo.[searchMessageByIds](#searchMessageByIds)(`messageIds`, `callback`)
 * nexmo.[searchMessagesByRecipient](#searchMessagesByRecipient)(`date`, `to`, `callback`)
 * nexmo.[searchRejections](#searchRejections)(`date`, `to`, `callback`)

## Unsupported API

The following API will supported in the future.

#### Developer API
 * nexmo.getTopUp(`transactionId`, `callback`)
 * nexmo.updateNumberCallback(`countryCode`, `msisdn`, `newUrl`, `sysType`, `callback`)

---------------

<a name="sendTextMessage"></a>
#### Messaging SMS - Send a Plain text message

> `from`: **Required.** Sender address may be alphanumeric. Ex: `MyCompany20`
> 
> `to`: **Required.** Mobile number in international format, and one recipient per request. Ex: `886912345678`
> 
> `message`: **Required.** Text message. Ex: `Hello World!`

```js
nexmo.sendTextMessage(from, to, message, callback)
```

<a name="sendBinaryMessage"></a>
#### Messaging SMS - Send a Binary data message

> `from`: **Required.** Sender address may be alphanumeric. Ex: `MyCompany20`
> 
> `to`: **Required.** Mobile number in international format, and one recipient per request. Ex: `886912345678`
> 
> `body`: **Required.** Hex encoded binary data. Ex: `0011223344556677`
> 
> `udh`: **Required.** Hex encoded udh. Ex: `06050415811581`

```js
nexmo.sendBinaryMessage(from, to, body, udh, callback)
```

<a name="sendWapPushMessage"></a>
#### Messaging SMS - Send a WAP push message

> `from`: **Required.** Sender address may be alphanumeric. Ex: `MyCompany20`
> 
> `to`: **Required.** Mobile number in international format, and one recipient per request. Ex: `886912345678`
> 
> `title`: **Required.** Title of WAP Push. Ex: `MySite`
> 
> `url`: **Required.** WAP Push URL. Ex: `http://www.mysite.com`
> 
> `validity`: **Optional.** Set how long WAP Push is available in milliseconds. Ex: `86400000` (Default: 48 hours.)

```js
nexmo.sendWapPushMessage(from, to, title, url, validity, callback)
```

<a name="getBalance"></a>
#### Account: Get Balance - Retrieve current account balance

```js
nexmo.getBalance(callback)
```

<a name="getPricing"></a>
#### Account: Pricing - Retrieve our outbound pricing for a given country

> `countryCode`: **Required.** A 2 letter country code. Ex: `CA`

```js
nexmo.getPricing(countryCode ,callback)
```

<a name="updateSecret"></a>
#### Account: Settings - Update API secret

> `newSecret`: **Required.** New API secret (8 characters max)

```js
nexmo.updateSecret(newSecret, callback)
```

<a name="updateMoCallBackUrl"></a>
#### Account: Settings - Update inbound call back URL

> `newUrl`: **Required**. Inbound call back URL. Ex: `http://mycallback.servername`

```js
nexmo.updateMoCallBackUrl(newUrl, callback)
```

<a name="updateDrCallBackUrl"></a>
#### Account: Settings - Update DLR call back URL

> `newUrl`: **Required**. DLR call back URL. Ex: `http://mycallback.servername`

```js
nexmo.updateDrCallBackUrl(newUrl, callback)
```

<a name="getNumbers"></a>
#### Account: Numbers - Get all inbound numbers associated with Nexmo account

```js
nexmo.getNumbers(callback)
```

<a name="searchNumbers"></a>
#### Number: Search - Get available inbound numbers for a given country

> `countryCode`: **Required.** Country code. Ex: `CA`
> 
> `pattern`: **Optional.** A matching pattern. Ex: `888`
> 
> `index`: **Optional.** Page index (>0, default 1). Ex: `2`
> 
> `size`: **Optional.** Page size (max 100, default 10). Ex: `25`

```js
nexmo.searchNumbers(countryCode, pattern, index, size, callback)
```

<a name="buyNumber"></a>
#### Number: Buy - Purchase a given inbound number

> `countryCode`: **Required.** Country code. Ex: ES
> 
> `msisdn`: **Required.** An available inbound number Ex: `34911067000`

```js
nexmo.buyNumber(countryCode, msisdn, callback)
```

<a name="cancelNumber"></a>
#### Number: Cancel - Cancel a given inbound number subscription

> `countryCode`: **Required.** Country code. Ex: ES
> 
> `msisdn`: **Required.** One of your inbound numbers Ex: `34911067000`

```js
nexmo.cancelNumber(countryCode, msisdn, callback)
```

<a name="searchMessage"></a>
#### Search: Message - Search a previously sent message for a given message id

> `messageId`: **Required.** Your message id received at submission time Ex: `00A0B0C0`

```js
nexmo.searchMessage(messageId, callback)
```

<a name="searchMessageByIds"></a>
#### Search: Messages - Search sent messages by message ids

> `messageIds`: **Required.** A list of message ids, up to 10 Ex: `[00A0B0C0', '00A0B0C1', '00A0B0C2' ]`

```js
nexmo.searchMessageByIds(messageIds, callback)
```

<a name="searchMessagesByRecipient"></a>
#### Search: Messages - Search sent messages by recipient and date

> `date`: **Required.** Message date submission YYYY-MM-DD Ex: `2013-11-03`
> 
> `to`: **Required.** A recipient number Ex: `886912345678`

```js
nexmo.searchMessagesByRecipient(date, to, callback)
```

<a name="searchRejections"></a>
#### Search: Rejections - Search rejected messages

> `date`: **Required.** Message date submission YYYY-MM-DD Ex: `2013-11-03`
> 
> `to`: **Optional.** A recipient number Ex: `886912345678`

```js
nexmo.searchRejections(date, to, callback)
```

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

> Copyright © 2013 Calvert Yang
> 
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
> 
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
> 
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
