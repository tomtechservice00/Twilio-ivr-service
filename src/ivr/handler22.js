/* eslint-disable max-len */
const VoiceResponse = require('twilio').twiml.VoiceResponse;

exports.welcome = function welcome() {
  const voiceResponse = new VoiceResponse();

  const gather = voiceResponse.gather({
    action: '/ivr/choose',
    numDigits: '1',
    method: 'POST',
    timeout: 30,
  });

  gather.say(
    'Hello and thank you for calling forrealpsychics.com. Your number one source for trusted psychics readings you must be 18 years or older and have a major credit card ready. All new members are charged .99 cents per min. ' +
      'Please press 1 for new customer. ' +
      'Press 2 for existing customer'
  );

  return voiceResponse.toString();
};

exports.choose = function choose(digit) {
  const optionActions = {
    '1': newCustomer,
    '2': existingCustomer,
  };
  return optionActions[digit] ? optionActions[digit]() : redirectWelcome();
};

exports.menu = function menu(digit) {
    // const optionActions = {
    //   '1': giveExtractionPointInstructions,
    //   '2': listPlanets,
    // };

    const optionActions = {
      '1': listAdvisors,
      // '2': listPlanets,
    };

  return optionActions[digit] ? optionActions[digit]() : redirectWelcome();
};

/**
 * Returns Twiml
 * @return {String}
 */
function newCustomer() {
  const voiceResponse = new VoiceResponse();

  const gather = voiceResponse.gather({
    action: '/ivr/menu',
    numDigits: '1',
    method: 'POST',
    timeout: 30,
  });

  gather.say(
    'Hello and thank you for calling forrealpsychics.com. Your number one source for trusted psychics readings you must be 18 years or older and have a major credit card ready. All new members are charged .99 cents per min. ' +
      'Please press 1 for new customer. ' +
      'Press 2 for existing customer',
    {loop: 3}
  );

  return voiceResponse.toString();
}

/**
 * Returns Twiml
 * @return {String}
 */
function existingCustomer() {
    const voiceResponse = new VoiceResponse();

    const gather = voiceResponse.gather({
      action: '/ivr/menu',
      numDigits: '1',
      method: 'POST',
      timeout: 30,
    });
    gather.say(
      'Hello and thank you for calling forrealpsychics.com. Your number one source for trusted psychics readings you must be 18 years or older and have a major credit card ready. All new members are charged .99 cents per min. ' +
        'Please press 1 for new customer. ' +
        'Press 2 for existing customer',
      {loop: 3}
    );
  
return voiceResponse.toString();
  }

/**
 * Returns Twiml
 * @return {String}
 */
function existingCustomer() {
    const twiml = new VoiceResponse();
    twiml.say(
      'Thank you for calling us. you are existing customer',
      {voice: 'alice', language: 'en-GB'}
    );
    twiml.hangup();
    return twiml.toString();
  }

exports.planets = function planets(digit) {
  const optionActions = {
    2: '+12024173378',
    3: '+12027336386',
    4: '+12027336637',
  };

  if (optionActions[digit]) {
    const twiml = new VoiceResponse();
    twiml.dial(optionActions[digit]);
    return twiml.toString();
  }

  return redirectWelcome();
};

exports.advisors = function advisors(digit) {
  const optionActions = {
    1: '+12024173378',
    2: '+12027336386',
  };

  if (optionActions[digit]) {
    const twiml = new VoiceResponse();
    twiml.dial(optionActions[digit]);
    return twiml.toString();
  }

  return redirectWelcome();
};

/**
 * Returns Twiml
 * @return {String}
 */
function giveExtractionPointInstructions() {
  const twiml = new VoiceResponse();

  twiml.say(
    'To get to your extraction point, get on your bike and go down ' +
      'the street. Then Left down an alley. Avoid the police cars. Turn left ' +
      'into an unfinished housing development. Fly over the roadblock. Go ' +
      'passed the moon. Soon after you will see your mother ship.',
    {voice: 'alice', language: 'en-GB'}
  );

  twiml.say(
    'Thank you for calling the ET Phone Home Service - the ' +
      'adventurous alien\'s first choice in intergalactic travel'
  );

  twiml.hangup();

  return twiml.toString();
}

/**
 * Returns a TwiML to interact with the client
 * @return {String}
 */
function listPlanets() {
  const twiml = new VoiceResponse();

  const gather = twiml.gather({
    action: '/ivr/planets',
    numDigits: '1',
    method: 'POST',
    timeout: 30,
  });

  gather.say(
    'To call the planet Broh doe As O G, press 2. To call the planet DuhGo ' +
      'bah, press 3. To call an oober asteroid to your location, press 4. To ' +
      'go back to the main menu, press the star key ',
    {voice: 'alice', language: 'en-GB', loop: 3}
  );

  return twiml.toString();
}

/**
 * Returns a TwiML to interact with the client
 * @return {String}
 */
 function listAdvisors() {
  const twiml = new VoiceResponse();

  const gather = twiml.gather({
    action: '/ivr/advisors',
    numDigits: '1',
    method: 'POST',
    timeout: 30,
  });

  gather.say(
    'Thank you. Please press 1 to connect with TEST1 advisor, press2 to connect with TEST2 advisor. To ' +
      'go back to the main menu, press the star key ',
    {voice: 'alice', language: 'en-GB', loop: 3}
  );

  return twiml.toString();
}

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
