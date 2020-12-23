var app = require("express")();
const express = require("express");
var http = require("http").createServer(app);
const bodyParser = require("body-parser");
const io = require('socket.io')(http); //integrating io
const chatRouter = require("./routes/chatRoute");
const mongoose = require("mongoose");

const url = "mongodb://localhost:27017/chat";

console.log('...1233')
app.use(bodyParser.json());
app.use("/chats", chatRouter);
app.use(express.static(__dirname + '/node_modules'));  
app.get('/', function(req, res,next) {  
    res.sendFile(__dirname + '/index.html');
});
mongoose.connect(url,function(err,db){
    if(err){
        throw err;
    }
    console.log("Mongodb connected")
    io.on('connection', function(client) {
        let chats = db.collection('chat')
        console.log('Client connected...');
        client.emit('output','Hi client')  //send event to client side
    client.on('input', data => {
        let name = data.name
        let message = data.message
        chats.insert({message:message,sender:name,isRead:true})
        console.log('hey', data);
    });    //will receive event from client side
});

})
  
http.listen(3000, () => {
    console.log('listening on *:3000');
}); //server connection
  