'use strict';

var Nexmo = require('../lib/nexmo');
var api_key = 'SD_7894';
var api_secret = 'PS_19371';

var nexmo = new Nexmo({
  apiKey: api_key,
  apiSecret: api_secret,
  baseUrl: 'rest-sandbox.nexmo.com'
});

// parameters
var to = '886987654321';
var today = new Date();
var messageDate = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

// callback data
var messageIds = [];
var country = '';
var msisdn = '';

describe('SMS', function() {
  describe('wrong message', function() {
    it('should return an error if doesn\'t specific message type', function(done) {
      var opts = {
        from: 'Test',
        to: to,
        text: 'This is test message.'
      };

      nexmo.sendSMSMessage(opts, function(err, res) {
        err.toString().should.match(/^Error/);
        done();
      });
    });
  });

  describe('text message', function() {
    it('status should be 0 when the message was successfully accepted for delivery by Nexmo', function(done) {
      var opts = {
        from: 'Test',
        to: to,
        type: 'text',
        text: 'This is test message.'
      };

      nexmo.sendSMSMessage(opts, function(err, res) {
        if (err) {
          return done(err);
        }

        res.messages[0].status.should.equal('0');
        messageIds.push(res.messages[0]['message-id']);
        done();
      });
    });
  });

  describe('binary message', function() {
    it('status should be 0 when the message was successfully accepted for delivery by Nexmo', function(done) {
      var opts = {
        from: 'Test',
        to: to,
        type: 'binary',
        body: '0011223344556677',
        udh: '06050415811581'
      };

      nexmo.sendSMSMessage(opts, function(err, res) {
        if (err) {
          return done(err);
        }

        res.messages[0].status.should.equal('0');
        done();
      });
    });
  });

  describe('wap message', function() {
    it('status should be 0 when the message was successfully accepted for delivery by Nexmo', function(done) {
      var opts = {
        from: 'Test',
        to: to,
        type: 'wappush',
        title: 'My site',
        url: 'http://www.mysite.com'
      };

      nexmo.sendSMSMessage(opts, function(err, res) {
        if (err) {
          return done(err);
        }

        res.messages[0].status.should.equal('0');
        done();
      });
    });
  });

  describe('unicode message', function() {
    it('status should be 0 when the message was successfully accepted for delivery by Nexmo', function(done) {
      var opts = {
        from: 'Test',
        to: to,
        type: 'unicode',
        text: '這是測試訊息。'
      };

      nexmo.sendSMSMessage(opts, function(err, res) {
        if (err) {
          return done(err);
        }

        res.messages[0].status.should.equal('0');
        messageIds.push(res.messages[0]['message-id']);
        done();
      });
    });
  });

  describe('vcal message', function() {
    it('status should be 0 when the message was successfully accepted for delivery by Nexmo', function(done) {
      var opts = {
        from: 'Test',
        to: to,
        type: 'vcal',
        vcal: 'BEGIN%3AVCALENDAR%0AVERSION%3A2.0%0APRODID%3A-%2F%2Fhacksw%2Fhandcal%2F%2FNONSGML+v1.0%2F%2FEN%0ABEGIN%3AVEVENT%0AUID%3Auid1%40example.com%0ADTSTAMP%3A19970714T170000Z%0AORGANIZER%3BCN%3DJohn+Doe%3AMAILTO%3Ajohn.doe%40example.com%0ADTSTART%3A19970714T170000Z%0ADTEND%3A19970715T035959Z%0ASUMMARY%3ABastille+Day+Party%0AEND%3AVEVENT%0AEND%3AVCALENDAR'
      };

      nexmo.sendSMSMessage(opts, function(err, res) {
        if (err) {
          return done(err);
        }

        res.messages[0].status.should.equal('0');
        done();
      });
    });
  });

  describe('vcard message', function() {
    it('status should be 0 when the message was successfully accepted for delivery by Nexmo', function(done) {
      var opts = {
        from: 'Test',
        to: to,
        type: 'vcard',
        vcard: 'BEGIN%3aVCARD%0d%0aVERSION%3a2.1%0d%0aFN%3aFull+Name%0d%0aTEL%3a%2b12345678%0d%0aEMAIL%3ainfo%40acme.com%0d%0aURL%3awww.acme.com%0d%0aEND%3aVCARD'
      };

      nexmo.sendSMSMessage(opts, function(err, res) {
        if (err) {
          return done(err);
        }

        res.messages[0].status.should.equal('0');
        done();
      });
    });
  });
});

describe('Developer', function() {
  describe('Account: Get Balance', function() {
    it('should retrieve current account balance.', function(done) {
      nexmo.getBalance(function(err, res) {
        if (err) {
          return done(err);
        }

        res.should.have.property('value');
        done();
      });
    });
  });

  describe('Account: Pricing', function() {
    it('should retrieve our outbound pricing for a given country.', function(done) {
      nexmo.getPricing('TW', function(err, res) {
        if (err) {
          return done(err);
        }

        res.should.have.property('name');
        res.should.have.property('country');
        res.should.have.property('prefix');
        done();
      });
    });
  });

  describe('Account: Settings', function() {
    it('should update account settings.', function(done) {
      var opts = {
        newSecret: api_secret,
        moCallBackUrl: '',
        drCallBackUrl: ''
      };

      nexmo.updateSettings(opts, function(err, res) {
        if (err) {
          return done(err);
        }

        res.should.have.property('api-secret');
        res.should.have.property('mo-callback-url');
        res.should.have.property('dr-callback-url');
        res.should.have.property('max-outbound-request');
        res.should.have.property('max-inbound-request');
        done();
      });
    });
  });

  // describe('Account: Numbers', function() {
  //   it('should get all inbound numbers associated with Nexmo account.', function(done) {
  //     nexmo.getNumbers(function(err, res) {
  //       if (err) {
  //         return done(err);
  //       }

  //       res.should.have.property('count');
  //       done();
  //     });
  //   });
  // });

  // describe('Number: Search', function() {
  //   it('should get available inbound numbers for a given country.', function(done) {
  //     var opts = {
  //       country: 'HK'
  //     };

  //     nexmo.searchNumbers(opts, function(err, res) {
  //       if (err) {
  //         return done(err);
  //       }

  //       if (res.hasOwnProperty('numbers')) {
  //         country = res['numbers'][0]['country'];
  //         msisdn = res['numbers'][0]['msisdn'];
  //       }

  //       res.should.have.property('count');
  //       done();
  //     });
  //   });
  // });

  // describe('Number: Buy', function() {
  //   it('should purchase a given inbound number.', function(done) {
  //     var opts = {
  //       country: country,
  //       msisdn: msisdn
  //     };

  //     nexmo.buyNumber(opts, function(err, res) {
  //       if (err) {
  //         return done(err);
  //       }

  //       done();
  //     });
  //   });
  // });

  // describe('Number: Cancel', function() {
  //   it('should cancel a given inbound number subscription.', function(done) {
  //     var opts = {
  //       country: country,
  //       msisdn: msisdn
  //     };

  //     nexmo.cancelNumber(opts, function(err, res) {
  //       if (err) {
  //         return done(err);
  //       }

  //       done();
  //     });
  //   });
  // });

  // describe('Number: Update', function() {
  //   it('should update number callback.', function(done) {
  //     var opts = {
  //       country: country,
  //       msisdn: msisdn
  //     };

  //     nexmo.updateNumber(opts, function(err, res) {
  //       if (err) {
  //         return done(err);
  //       }

  //       done();
  //     });
  //   });
  // });

  // describe('Search: Message', function() {
  //   it('should search a previously sent message for a given message id.', function(done) {
  //     nexmo.searchMessage(messageIds[0], function(err, res) {
  //       if (err) {
  //         return done(err);
  //       }

  //       res.should.have.property('type');
  //       res.should.have.property('message-id');
  //       res.should.have.property('account-id');
  //       res.should.have.property('from');
  //       res.should.have.property('to');
  //       done();
  //     });
  //   });
  // });

  // describe('Search: Messages by ids', function() {
  //   it('should search sent messages.', function(done) {
  //     nexmo.searchMessageByIds(messageIds, function(err, res) {
  //       if (err) {
  //         return done(err);
  //       }

  //       res.should.have.property('count');
  //       done();
  //     });
  //   });
  // });

  // describe('Search: Messages by recipient and date', function() {
  //   it('should search sent messages.', function(done) {
  //     var opts = {
  //       date: messageDate,
  //       to: to
  //     };

  //     nexmo.searchMessagesByRecipient(opts, function(err, res) {
  //       if (err) {
  //         return done(err);
  //       }

  //       res.should.have.property('count');
  //       done();
  //     });
  //   });
  // });

  // describe('Number: Rejections', function() {
  //   it('should search rejected messages.', function(done) {
  //     var opts = {
  //       date: messageDate,
  //       to: to
  //     };

  //     nexmo.searchRejections(opts, function(err, res) {
  //       if (err) {
  //         return done(err);
  //       }

  //       res.should.have.property('count');
  //       done();
  //     });
  //   });
  // });
});
