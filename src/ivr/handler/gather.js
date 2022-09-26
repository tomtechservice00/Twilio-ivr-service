/* eslint-disable max-len */
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const db = require('../../../db');

exports.welcome = function(req, res) {
    const voiceResponse = new VoiceResponse();

    const gather = voiceResponse.gather({
      action: '/ivr/choose',
      numDigits: '1',
      method: 'POST',
      timeout: 30,
    });

    console.log('Connected to the SQLite database.');
    let sql = 'select * from users where phone = ?';
    let params = [req.body.From];
    db.get(sql, params, (err, row) => {
        if (err) {
            console.log('error');
            console.log(err);
        }
        console.log('row', row);
        if(row) {
            gather.say(
                'Hello and thank you for calling forrealpsychics.com. Your number one source for trusted psychics readings. You must be 18 years or older and have a major credit card ready. All new members are charged 0.99 cents per min! Press 2 to start the regular call'
            );
        }else{
            let insert = 'INSERT INTO users (phone, min) VALUES (?,?)';
            db.run(insert, [req.body.From, 5]);

            gather.say(
                'Hello and thank you for calling forrealpsychics.com. Your number one source for trusted psychics readings. You must be 18 years or older and have a major credit card ready. All new members are charged .99 cents per min! ' +
                'Please press 1 to get the free call for the new customer!' +
                'Press 2 to start the regular call!'
            );
        }
        res.send(voiceResponse.toString());
    });
};

/**
 * Returns Twiml
 * @return {String}
 */
exports.newCustomer = function newCustomer() {
  const voiceResponse = new VoiceResponse();

  const gather = voiceResponse.gather({
    action: '/ivr/menu',
    numDigits: '1',
    method: 'POST',
    timeout: 30,
  });

  gather.say(
    'Thank you for calling us. We provide 5 mins free calls for our new customers! Please press 1 to chose from a list of advisors.'
  );

  return voiceResponse.toString();
};

/**
 * Returns Twiml
 * @return {String}
 */
exports.existingCustomer = function existingCustomer() {
  const voiceResponse = new VoiceResponse();

  const gather = voiceResponse.gather({
    action: '/ivr/get-minutes',
    numDigits: '1',
    method: 'POST',
    timeout: 30,
  });

  gather.say('Thank you for calling us. Press 1 to add the payment');

  return voiceResponse.toString();
};

// eslint-disable-next-line valid-jsdoc
/**
 * Returns a TwiML to interact with the client
 * @return {String}
 */
function getInputMinutes() {
  const voiceResponse = new VoiceResponse();

  const gather = voiceResponse.gather({
    action: '/ivr/schedule',
    numDigits: '2',
    method: 'POST',
    timeout: 30,
  });

  gather.say('Please input the number of minutes. 2 digits for the minutes');

  return voiceResponse.toString();
};

exports.getMinutes = function getMinutes(digit) {
  const optionActions = {
    '1': getInputMinutes,
  };
  return optionActions[digit] ? optionActions[digit]() : redirectWelcome();
};

/**
 * Returns a TwiML to interact with the client
 * @return {String}
 */
exports.dialEnd = function dialEnd(duration) {
    const voiceResponse = new VoiceResponse();
    const gather = voiceResponse.gather({
        action: '/ivr/end-option',
        numDigits: '1',
        method: 'POST',
        timeout: 30,
    });
    
    gather.say(`Your time is up! Press 2 to add more funds or press 1 to end the call!`);
    return voiceResponse.toString();
  };

/**
 * Returns a TwiML to interact with the client
 * @return {String}
 */
exports.listAdvisors = function listAdvisors() {
  const twiml = new VoiceResponse();

  const gather = twiml.gather({
    action: '/ivr/advisors',
    numDigits: '1',
    method: 'POST',
    timeout: 30,
  });

  gather.say(
    'Thank you. Please press 1 to connect with Empath Jimmy.',
    {
      voice: 'alice',
      language: 'en-GB',
      //   loop: 3
    }
  );

  return twiml.toString();
};

/**
 * Returns an xml with the redirect
 * @return {String}
 */
 function redirectWelcome() {
  const twiml = new VoiceResponse();

  twiml.say('Returning to the main menu', {
    voice: 'alice',
    language: 'en-GB',
  });

  twiml.redirect('/ivr/welcome');

  return twiml.toString();
}
