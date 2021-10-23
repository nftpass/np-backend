const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const postsRoute = require('./posts')
const cors = require('cors')

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

app.use(function (req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept'
    );
    next();
  });


  app.use('/', [cors(corsOptionsDelegate)], postsRoute)

  /////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////
  // allow cross-origin resource sharing
  var corsOptionsDelegate = function (req, callback) {
    var corsOptions;
    corsOptions = { origin: true, credentials: true }; // disable CORS for this request
    callback(null, corsOptions); // callback expects two parameters: error and options
  };
  const corsOptions = {
    origin: true,
    methods: 'GET,PATCH,POST,DELETE', // 'GET,HEAD,PUT,PATCH,POST,DELETE'
    credentials: true,
    preflightContinue: false,
    maxAge: 600,
  };
  app.options('*', cors(corsOptions));
app.listen(PORT, () => {
    console.log("Server started listening on port : ", PORT);
});