/**
 * Returns Twiml
 * @return {String}
 */

const VoiceResponse = require('twilio').twiml.VoiceResponse;

exports.paymentHook = function paymentHook(req) {
  console.log('payment hook', req.body);
  const twiml = new VoiceResponse();
  const {Result} = req.body;
  if (Result === 'success') {
    const gather = twiml.gather({
      action: '/ivr/menu',
      numDigits: '1',
      method: 'POST',
      timeout: 30,
    });

    gather.say(
      'Thank you for your payment. Please press 1 to chose from a list of advisors.'
    );
  } else {
    twiml.say('Your card information is invalid. Please try again.');
    twiml.redirect('/ivr/schedule');
  }
  return twiml.toString();
};

const validator = require('validator');
const ApiContracts = require('authorizenet').APIContracts;
const ApiControllers = require('authorizenet').APIControllers;

const SDKConstants = require('authorizenet').Constants;

const AUTHORISE_LOGIN_ID = '7P4A59bx7';
const AUTHORISE_TRANSACTION_KEY = '3k9Uh2utQ24vLb8E';

/**
 */
function validateForm(req) {
  console.log('validateForm processing', JSON.stringify(req.body));
  const {cardnumber, cvv, expiry_month, expiry_year, amount} = req.body;

  const errors = [];

  if (!validator.isCreditCard(cardnumber)) {
    errors.push({
      param: 'cardnumber',
      msg: 'Invalid credit card number.',
    });
  }

  if (!/^\d{3}$/.test(cvv)) {
    errors.push({
      param: 'cvv',
      msg: 'Invalid CVV code.',
    });
  }

  if (!/^\d{2}$/.test(expiry_month)) {
    errors.push({
      param: 'expiry_month',
      msg: 'Invalid expiration expiry_month.',
    });
  }

  if (!/^\d{4}$/.test(expiry_year)) {
    errors.push({
      param: 'expiry_year',
      msg: 'Invalid expiration expiry_year.',
    });
  }

  if (!validator.isDecimal(amount)) {
    errors.push({
      param: 'amount',
      msg: 'Invalid amount.',
    });
  }

  console.log('errors', JSON.stringify(errors));
  return errors;
}

exports.payment = function(req, res) {
  console.log('payment processing', req.body);
  console.log('payment params', req);
  const validationErrors = validateForm(req);
  console.log('payment processing', req.body);
  console.log('payment params', req);
  if (validationErrors.length > 0) {
    res.json({errors: validationErrors});
    return;
  }

  const {cardnumber: cc, cvv, expiry_month, expiry_year, amount} = req.body;

  const merchantAuthenticationType =
    new ApiContracts.MerchantAuthenticationType();
  merchantAuthenticationType.setName(AUTHORISE_LOGIN_ID);
  merchantAuthenticationType.setTransactionKey(AUTHORISE_TRANSACTION_KEY);

  const creditCard = new ApiContracts.CreditCardType();
  creditCard.setCardNumber(cc);
  creditCard.setExpirationDate(`${expiry_month}/${expiry_year}`);
  creditCard.setCardCode(cvv);

  const paymentType = new ApiContracts.PaymentType();
  paymentType.setCreditCard(creditCard);

  const transactionSetting = new ApiContracts.SettingType();
  transactionSetting.setSettingName('recurringBilling');
  transactionSetting.setSettingValue('false');

  const transactionSettingList = [];
  transactionSettingList.push(transactionSetting);

  const transactionSettings = new ApiContracts.ArrayOfSetting();
  transactionSettings.setSetting(transactionSettingList);

  const transactionRequestType = new ApiContracts.TransactionRequestType();
  transactionRequestType.setTransactionType(
    ApiContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION
  );
  transactionRequestType.setPayment(paymentType);
  transactionRequestType.setAmount(amount);
  transactionRequestType.setTransactionSettings(transactionSettings);

  const createRequest = new ApiContracts.CreateTransactionRequest();
  createRequest.setMerchantAuthentication(merchantAuthenticationType);
  createRequest.setTransactionRequest(transactionRequestType);

  const ctrl = new ApiControllers.CreateTransactionController(
    createRequest.getJSON()
  );

  ctrl.execute(() => {
    const apiResponse = ctrl.getResponse();
    const response = new ApiContracts.CreateTransactionResponse(apiResponse);

    if (response !== null) {
      if (
        response.getMessages().getResultCode() ===
        ApiContracts.MessageTypeEnum.OK
      ) {
        if (response.getTransactionResponse().getMessages() !== null) {
          res.json({success: 'Transaction was successful.'});
        } else {
          if (response.getTransactionResponse().getErrors() !== null) {
            let code = response
              .getTransactionResponse()
              .getErrors()
              .getError()[0]
              .getErrorCode();
            let text = response
              .getTransactionResponse()
              .getErrors()
              .getError()[0]
              .getErrorText();
            res.json({
              error: `${code}: ${text}`,
            });
          } else {
            res.json({error: 'Transaction failed.'});
          }
        }
      } else {
        if (
          response.getTransactionResponse() !== null &&
          response.getTransactionResponse().getErrors() !== null
        ) {
          let code = response
            .getTransactionResponse()
            .getErrors()
            .getError()[0]
            .getErrorCode();
          let text = response
            .getTransactionResponse()
            .getErrors()
            .getError()[0]
            .getErrorText();
          res.json({
            error: `${code}: ${text}`,
          });
        } else {
          let code = response.getMessages().getMessage()[0].getCode();
          let text = response.getMessages().getMessage()[0].getText();
          res.json({
            error: `${code}: ${text}`,
          });
        }
      }
    } else {
      res.json({error: 'No response.'});
    }
  });
};
