const express = require('express');

const router = express.Router();
const Web3 = require('web3');
require("dotenv").config();
const pusher = require('./pusher');
const firebaseApp = require('firebase/app');
const firebaseDatabase = require("firebase/database");
const { MongoClient } = require('mongodb');
const {shortenAddress} = require('./helpers/address');
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

pusher.init()

router.get("/ping", (req, res) => {
    return res.send({
        status: "Healthy",
    });
});

router.get("/get_score/:address", (req, res) => {
    const address = req.params.address && req.params.address.toLowerCase();
    if(!address)
        return
    msgAttributes = {}
    pusher.sendMessage(msgAttributes, address, (success) => {
        return res.send({
            success
        });
    })
});

router.get("/get_percentile/:address", async (req, res) => {
    try{
        const address = req.params.address && req.params.address.toLowerCase();
        if(!address)
            return
        let addressDoc = await historicalRecordsCol.findOne({"address": address});
        if (addressDoc){
            //this assumes we don't have repeadted documents with the same address
            let totalScores = await historicalRecordsCol.count();
            const numOfLargerScores = await historicalRecordsCol.countDocuments({
                "score": {"$gt": addressDoc.score}
            });
            const percentile = Math.round(((1-numOfLargerScores/totalScores)*100));
            return res.send({
                'percentile': percentile,
                'totalScores': totalScores,
                'numOfLargerScores': numOfLargerScores,
                'score': addressDoc.score
            });
        }
        console.error('Error computing percentile')
        return res.send({'percentile': 0});
    } catch(e) {
        console.log(e)
    }
});

router.get("/rank", async (req, res) => {
    try{
        let rank = await historicalRecordsCol.find().sort({"score": -1}).limit(10).toArray();
        rank = rank.map((address) => {
            address.address = shortenAddress(address.address)
            return address;
        })
        return res.send(rank);
    } catch(e) {
        console.log(e)
    }
});

function between(min, max) {  
    return Math.floor(
      Math.random() * (max - min) + min
    )
}

router.get("/sign/:address", async (req, res) => {
    const web3 = new Web3(process.env.RINKEBY_URL);
    const nonce = between(0, Number.MAX_SAFE_INTEGER);
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