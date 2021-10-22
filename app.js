const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
require("dotenv").config();

const pusher = require('./pusher');

const app = express();  //Create new instance

mongoose
    .connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("Database connection Success!");
    })
    .catch((err) => {
        console.error("Mongo Connection Error", err);
    });


const PORT = process.env.PORT || 5000; //Declare the port number
app.use(express.json()); //allows us to access request body as req.body
app.use(morgan("dev"));  //enable incoming request logging in dev mode

pusher.init()

app.get("/ping", (req, res) => {
    return res.send({
        status: "Healthy",
    });
});


app.get("/get_score/:address", (req, res) => {
    msgAttributes = {}
    pusher.sendMessage(msgAttributes, req.params.address, (success) => {
        return res.send({
            'successful': success,
        });
    })
});


app.listen(PORT, () => {
    console.log("Server started listening on port : ", PORT);
});