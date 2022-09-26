/* eslint-disable max-len */
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const { newCustomer, listAdvisors, existingCustomer } = require('./gather');
const { toInteger, isNaN, isNumber, ceil } = require('lodash');
const db = require('../../../db');

exports.choose = function choose(digit) {
    const optionActions = {
        '1': newCustomer,
        '2': existingCustomer,
    };
    return optionActions[digit] ? optionActions[digit]() : redirectWelcome();
};

exports.menu = function menu(digit) {
    const optionActions = {
        '1': listAdvisors,
    };

    return optionActions[digit] ? optionActions[digit]() : redirectWelcome();
};

exports.music = function music() {
    const twiml = new VoiceResponse();
    const musicUrl =
        'http://com.twilio.sounds.music.s3.amazonaws.com/MARKOVICHAMP-Borghestral.mp3';
    twiml.play(musicUrl);
    return twiml.toString();
};

exports.advisors = function advisors(req, res) {

    const optionActions = {
        '1': '+17029294021',
        // '1': '+18042221111',
        '2': '+18042221111',
    };

    let sql = 'select * from users where phone = ?';
    let params = [req.body.From];
    const digit = req.body.Digits;
    db.get(sql, params, (err, row) => {
        if (err) {
            console.log('error');
            console.log(err);
        }
        console.log('row', row);
        if (row) {
            mins = row.min;
            if (optionActions[digit]) {
                const twiml = new VoiceResponse();
                twiml.dial(
                    {
                        action: '/ivr/dial-end',
                        method: 'POST',
                        timeLimit: mins * 60,
                        // timeLimit: 10,
                        ringTone: 'uk',
                    },
                    optionActions[digit]
                );

                res.send(twiml.toString());
            } else {
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
                res.send(twiml.toString());
            }            
        }
    });


};

exports.endOption = function endOption(digit) {
    const optionActions = {
        '1': hangup,
        '2': existingCustomer,
    };
    return optionActions[digit] ? optionActions[digit]() : redirectWelcome();
};

exports.schedule = function schedule(req, res) {
    // const optionActions = {
    //   1: '+18042221111',
    //   2: '+18042221111',
    // };
    const digit = req.body.Digits;
    let mins = toInteger(digit);
    if (isNumber(mins) && !isNaN(mins)) {
        const twiml = new VoiceResponse();

        if (mins != 0) {
            let amount = ceil(mins * 0.99, 2);
            let updateSql = 'UPDATE users set min = COALESCE(?,min) where phone = ?';
            db.run(updateSql, [mins, req.body.From]);
            twiml.say(
                `You are going to schedule a ${mins} mins call. You need to pay ${amount
                } to call our advisors. Please input your card information`,
                {
                    voice: 'alice',
                    language: 'en-GB',
                }
            );

            twiml.pay({
                chargeAmount: amount.toFixed(2),
                paymentConnector: 'Authorize_Connect',
                // action: 'https://handler.twilio.com/twiml/EH5497eb7fd9fbe2e87af27142205caaa8',
                action: 'https://node-cloudsolution00765998.codeanyapp.com/ivr/payment-hook',
            });
            res.send(twiml.toString());
        } else {
            let sql = 'select * from users where phone = ?';
            let params = [req.body.From];
            db.get(sql, params, (err, row) => {
                if (err) {
                    console.log('error');
                    console.log(err);
                }
                console.log('row', row);
                if (row) {
                    mins = row.min;
                    let amount = ceil(mins * 0.99, 2);
                    twiml.say(
                        `You are going to schedule a ${mins} mins call. You need to pay ${amount
                        } to call our advisors. Please input your card information`,
                        {
                            voice: 'alice',
                            language: 'en-GB',
                        }
                    );

                    twiml.pay({
                        chargeAmount: amount.toFixed(2),
                        paymentConnector: 'Authorize_Connect',
                        // action: 'https://handler.twilio.com/twiml/EH5497eb7fd9fbe2e87af27142205caaa8',
                        action: 'https://node-cloudsolution00765998.codeanyapp.com/ivr/payment-hook',
                    });
                    res.send(twiml.toString());
                }
            });
        }
    }
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

/**
 * Returns an xml with the redirect
 * @return {String}
 */
function hangup() {
    const twiml = new VoiceResponse();
    twiml.hangup();
    return twiml.toString();
}
