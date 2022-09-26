const Router = require('express').Router;
const {
  welcome,
  menu,
  choose,
  advisors,
  music,
  paymentHook,
  payment,
  getMinutes,
  schedule,
  endOption,
  dialEnd,
} = require('./handler/index');

const router = new Router();

// POST: /ivr/welcome
router.post('/welcome', (req, res) => {
  return welcome(req, res);
});

// POST: /ivr/choose
router.post('/choose', (req, res) => {
  const digit = req.body.Digits;
  return res.send(choose(digit));
});

// POST: /ivr/menu
router.post('/menu', (req, res) => {
  const digit = req.body.Digits;
  return res.send(menu(digit));
});

// POST: /ivr/music
router.post('/music', (req, res) => {
  // const digit = req.body.Digits;
  return res.send(music());
});

// POST: /ivr/advisors
router.post('/advisors', (req, res) => {
    return advisors(req, res);
});

// POST: /ivr/get-minutes
router.post('/get-minutes', (req, res) => {
  const digit = req.body.Digits;
  res.send(getMinutes(digit));
});

// POST: /ivr/schedule
router.post('/schedule', (req, res) => {
  return schedule(req, res);
});

// POST: /ivr/dial-end
router.post('/dial-end', (req, res) => {
  const digit = req.body;
  console.log('dialend body >>', digit);
  const duration = req.body.DialCallDuration;
  /** 
   * 
   * 
   * dialend body [Object: null prototype] {
  AccountSid: 'ACb052699bb0957d07f66b2a2971e7ca48',
  ApiVersion: '2010-04-01',
  CallSid: 'CA325ac02e67c8f088222f007c05ea432a',
  CallStatus: 'in-progress',
  Called: '+18006857912',
  CalledCity: '',
  CalledCountry: 'US',
  CalledState: '',
  CalledZip: '',
  Caller: '+18136404796',
  CallerCity: '',
  CallerCountry: 'US',
  CallerState: 'FL',
  CallerZip: '',
  DialBridged: 'true',
  DialCallDuration: '10',
  DialCallSid: 'CA37cd5919739ab5ce4101c38245dbb89e',
  DialCallStatus: 'completed',
  Direction: 'inbound',
  From: '+18136404796',
  FromCity: '',
  FromCountry: 'US',
  FromState: 'FL',
  FromZip: '',
  To: '+18006857912',
  ToCity: '',
  ToCountry: 'US',
  ToState: '',
  ToZip: ''
}
  */
  return res.send(dialEnd(duration));
});

// POST: /ivr/payment-hook
router.post('/payment-hook', (req, res) => {
  // const digit = req.body.Digits;
  res.send(paymentHook(req));
});

// POST: /ivr/payment
router.post('/payment', payment);

// POST: /ivr/end-option
router.post('/end-option', (req, res) => {
  const digit = req.body.Digits;
  res.send(endOption(digit));
});

module.exports = router;
