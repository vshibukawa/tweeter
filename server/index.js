"use strict";

// Basic express setup:

const dotenv = require("dotenv");
const result = dotenv.config();
const PORT = process.env.PORT || 8080;
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cookieSession = require("cookie-session");
const MongoClient = require("mongodb").MongoClient;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(
  cookieSession({
    name: "session",
    keys: ["key1"],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

app.locals.moment = require("moment");

// The in-memory database of tweets. It's a basic object with an array in it.
MongoClient.connect(MONGODB_URI, 
  { useNewUrlParser: true, useUnifiedTopology: true }, 
  (err, client) => {
    if (err) {
      console.error(`Failed to connect: ${MONGODB_URI}`);
      throw err;
    }

    console.log("DB connected");
    const db = client.db('tweeter')

    // The `data-helpers` module provides an interface to the database of tweets.
    // This simple interface layer has a big benefit: we could switch out the
    // actual database it uses and see little to no changes elsewhere in the code
    // (hint hint).
    //
    // Because it exports a function that expects the `db` as a parameter, we can
    // require it and pass the `db` parameter immediately:
    const DataHelpers = require("./lib/data-helpers.js")(db);
    const middlewares = require("./lib/middlewares")(DataHelpers);

    // The `tweets-routes` module works similarly: we pass it the `DataHelpers` object
    // so it can define routes that use it to interact with the data layer.
    const tweetsRoutes = require("./routes/tweets")(DataHelpers, middlewares);
    const usersRoutes = require("./routes/users")(DataHelpers, middlewares);

    // Mount the tweets routes at the "/tweets" path prefix:
    app.use("/tweets", tweetsRoutes);
    app.use("/", usersRoutes);
});

app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});
