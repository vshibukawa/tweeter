"use strict";

// Defines helper functions for saving and getting tweets, using the database `db`
module.exports = function makeDataHelpers(db) {
  return {

    // Saves a tweet to `db`
    saveTweet: function(newTweet, callback) {
      db.collection("tweets").insertOne(newTweet, (err, res) => {
        if (err) {
          return callback(err);
        }
        callback(null, res.ops[0]);
      });
    },

    // Get all tweets in `db`, sorted by newest first
    getTweets: function(callback) {
      db.collection("tweets").find().toArray((err, tweets) => {
        if (err) {
          return callback(err);
        }
        const sortNewestFirst = (a, b) => b.created_at - a.created_at;
        callback(null, tweets.sort(sortNewestFirst));
      });
    },

    // Save user
    saveUser: function(newUser, callback)  {
      db.collection("users").insertOne(newUser, (err, res) => {
        if (err) {
          return callback(err);
        }
        callback(null, res.ops[0]);
      });
    },

    // Get user
    getUser: function(query, callback){
      db.collection("users").findOne(query, (err, user) => {
        if (err) {
          return callback(err);
        }
        callback(null, user);
      });
    },

    // Get users
    getUsers: function(callback){
      db.collection("users").find().toArray((err, users) => {
        if (err) {
          return callback(err);
        }
        callback(null, users);
      });
    }
  };
}
