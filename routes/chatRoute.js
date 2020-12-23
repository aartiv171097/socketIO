const express = require("express");
const connectdb = require("./../dbconnect");
const Chats = require("./../models/chat");

const router = express.Router();

router.route("/findAll").get((req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  res.statusCode = 200;

  connectdb.then(db => {
    Chats.find({}).then(chat => {
      res.json(chat);
    });
  });
});
router.route("/findWithUnreadCount").get((req, res, next) => {
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
  
    connectdb.then(db => {
      let unreadCount = Chats.find({isRead:true}).limit(10).count();
        res.json(unreadCount);
    });
  });
  
module.exports = router;
