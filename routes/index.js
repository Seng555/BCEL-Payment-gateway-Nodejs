const express = require('express');
const router = express.Router();
const OnePay = require('./class/onepay')
const PubNub = require('pubnub');
require('dotenv').config();


/* GET home page. */
router.get('/', async function(req, res, next) {
    const $uuid = Math.floor(Math.random() * 1000000000); // transaction id ((please define as unique key))
    const $tid = "T2_pro"; // terminal ID (in case have many terminals, POS devices or etc...)

    // Bank provide these data
    const $mcid = process.env.mcid; // merchant id
    const $mcc = process.env.mcc; // merchant category code
    const $shopcode = process.env.shopcode; // shop code
    const $ccy = process.env.shopcode; // currency LAK
    const $country = process.env.country;
    const $province = process.env.province;

    const mcid = $mcid; // merchant id
    const shopcode = $shopcode; // shop code
    const uuid = $uuid; // transaction id (please define as unique key)

    const onepay = new OnePay.OnePay(mcid); // create new OnePay instance
    //console.log(onepay)
          onepay.debug = true; // enable OnPay debug(Please looking on console log)
         /* generate new QR code via onepay.js */
         const expiretime = 15; // expire time must be minutes
         onepay.getCode({
          transactionid: uuid, // please define as unique key
          invoiceid: '123', // a invoice ID can pay many times OR have many transaction ID
          terminalid: $tid, // terminal ID (in case have many terminals, POS devices or etc...)
          amount: 1, // invoice amount
          description: 'Test', // must define as English text
          expiretime: expiretime, 
      }, async function (code) {
         //respornd(null, mcid, uuid, $tid);
         subs(onepay, uuid, $tid);
         res.render('index', { title: 'Express', uuid:$uuid, code:code, expiretime:(expiretime*60000)+Date.now()});
         /*setTimeout(async function(){
             let infos_to = JSON.stringify({message:"No"});
             await io.emit('paymentConfirm', infos_to);
             console.log("Socket done")
            },3000)*/
         
      })
});

async function subs(onepay, uuid, $tid){
        /* define subscribe parameter(s) */
        const uuids = uuid;
        const subParams = {
          uuid: uuids, // please specified uuid if would like to receive callback data only the transaction (for front-end subscribe)
          shopcode: null, // please specified shopcode if would link to receive all callback for the merchant ID (for back-end subscribe)
          tid: $tid // please specified tid(terminal ID) and shopcode if would link to receive all callback for the merchant ID and specific terminal (for terminal subscribe)
        };
        /* subscribe to receiving OnePay callback */
        onepay.subscribe(subParams, async function (res) {
          //console.log("res")
          let infos_to = JSON.stringify({message:1, res:res});
          await io.emit('paymentConfirm', infos_to);
        });
}

module.exports = router;
