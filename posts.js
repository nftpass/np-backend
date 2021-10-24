const express = require('express');

const router = express.Router();
const Web3 = require('web3');
require("dotenv").config();
const pusher = require('./pusher');
const firebaseApp = require('firebase/app');
const firebaseDatabase = require("firebase/database");
const { MongoClient } = require('mongodb');

const mongoURI = process.env.MONGO_URL || '';
const dbName = process.env.MONGO_DB_NAME || '';

const firebaseConfig = {
  apiKey: "AIzaSyAEaknNq7Hcxffpma9NezdSTj1e2S4VuPE",
  authDomain: "nftpassxyz.firebaseapp.com",
  databaseURL: "https://nftpassxyz-default-rtdb.firebaseio.com",
  projectId: "nftpassxyz",
  storageBucket: "nftpassxyz.appspot.com",
  messagingSenderId: "557649105169",
  appId: "1:557649105169:web:e750322638098c6ec13cb0",
  measurementId: "G-F6YXEN1NVY"
}

const app = firebaseApp.initializeApp(firebaseConfig);

const database = firebaseDatabase.getDatabase(app);
const client = new MongoClient(mongoURI);
client.connect();

const db = client.db(dbName);
historicalRecordsCol = db.collection('historicalRecords');
console.log(historicalRecordsCol)

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

router.get("/sign/:address", async (req, res) => {
    const web3 = new Web3(process.env.RINKEBY_URL)
    const nonce = between(0, Number.MAX_SAFE_INTEGER)
    try{
        let score = await historicalRecordsCol.findOne({address: req.params.address.toLowerCase()})
        score = score ? score.score : 0
        let hashMessage = web3.utils.soliditySha3(req.params.address, score, nonce)
        let signature = web3.eth.accounts.sign(hashMessage, process.env.PRIVATE_KEY)
        return res.send({messageHash: signature.messageHash, signature: signature.signature, nonce, score})
    } catch(e) {
        console.log(e)
    }
    
});


module.exports = router;