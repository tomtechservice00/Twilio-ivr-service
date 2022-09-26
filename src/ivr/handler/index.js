const {welcome, getMinutes, dialEnd} = require('./gather');
const {
    choose,
    advisors,
    menu,
    music,
    schedule,
    endOption,
} = require('./general_say');
const {paymentHook, payment} = require('./payment');

module.exports = {
    welcome,
    choose,
    advisors,
    menu,
    music,
    getMinutes,
    schedule,
    payment,
    paymentHook,
    endOption,
    dialEnd,
};
