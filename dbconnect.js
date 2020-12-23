const mongoose = require("mongoose");

const url = "mongodb://localhost:27017/chat";

const connect = mongoose.connect(url, { useNewUrlParser: true });

module.exports = connect;
