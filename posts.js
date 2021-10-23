const express = require('express');

const router = express.Router();
const Web3 = require('web3');
require("dotenv").config();
const pusher = require('./pusher');

pusher.init()

router.get("/ping", (req, res) => {
    return res.send({
        status: "Healthy",
    });
});

router.get("/get_score/:address", (req, res) => {
    msgAttributes = {}
    pusher.sendMessage(msgAttributes, req.params.address, (success) => {
        return res.send({
            success
        });
    })
});

function between(min, max) {  
    return Math.floor(
      Math.random() * (max - min) + min
    )
}

router.get("/sign/:address", (req, res) => {
    const web3 = new Web3(process.env.RINKEBY_URL)
    const nonce = between(0, Number.MAX_SAFE_INTEGER)
    const score = between(0, Number.MAX_SAFE_INTEGER)
    let hashMessage = web3.utils.soliditySha3(req.params.address, score, nonce)
    let signature = web3.eth.accounts.sign(hashMessage, process.env.PRIVATE_KEY)
    return res.send({messageHash: signature.messageHash, signature: signature.signature, nonce, score})
    
});


module.exports = router;