const express = require('express')
const app = express()                  //import express framework
const server = require('http').Server(app)             //connect with server required http
const io = require('socket.io')(server)               //for socket implementation require socket.io library
const mongoose = require("mongoose");        //moongooose for mongodb connection
const url = "mongodb://localhost:27017/chat";

app.set('views', './views')
app.set('view engine', 'ejs')       //to import ejs for templates engine
app.use(express.static('public')) 
app.use(express.urlencoded({ extended: true }))

const rooms = { }        //to specify no of rooms
server.listen(3000,()=>{
  console.log("server connected")
})

mongoose.connect(url,function(err,db){                 //mongodb connection setup
  if(err){
    throw err;
  }
  console.log("...mongo connected")
  let chats = db.collection('chat')            //fetch collection from database after success connection
  app.get('/', (req, res) => {
    res.render('index', { rooms: rooms })
  })         //using for home page where rooms listing showing

  app.post('/room', (req, res) => {
    //let checkRoomExist = chats.findOne({roomId:req.body.room},{}) 
    if (rooms[req.body.room] != null) {
      console.log("....12334",rooms[req.body.room])
      return res.redirect('/')      //if room already exist then redirect on index page
    }
    rooms[req.body.room] = { users: {} }      //just to specify listing of empty users in rooms in starting. Format of rooms[room] = { users: { J5TahDodJfNwiB_EAAAX: 'yek' } } after users joined rooms
    res.redirect(req.body.room)
    //insert in db with roomName
    chats.update({roomId:req.body.room},{roomId:req.body.room},{upsert:true})
    // Send message that new room was created
    io.emit('room-created', req.body.room)
  })    //using to create room

  app.get('/:room', (req, res) => {
    if (rooms[req.params.room] == null) {
      return res.redirect('/')
    }
    res.render('room', { roomName: req.params.room })
  }) //get room details

  io.on('connection', socket => {
    socket.on('new-user', (room, name) => {
      socket.join(room)       //join particular room
      console.log("......abcd",socket,'asassasas',rooms[room])
      rooms[room].users[socket.id] = name
      socket.to(room).broadcast.emit('user-connected', name)          //send message kind of event that new user connected
      chats.update({roomId:room},{ $push: { members: name } })       //update user name with roomName
    })
    socket.on('send-message', (room, message) => {
      console.log('......sdataaaaaaaaaaaaaaaa',room,message)//receive event from client side
      //broadcase message in same room
      socket.to(room).broadcast.emit('chat-message', { message: message, name: rooms[room].users[socket.id] })
      chats.update({roomId:room,sender:rooms[room].users[socket.id]},{
        $push: { message: message },$set:{
        sender:rooms[room].users[socket.id]}
      },{upsert:true})         //insert per each user with their messages with same roomId
    })
    //receive event in case user got disconnect from client side so can delete user from particular room
    socket.on('disconnect', () => {
      getUserRooms(socket).forEach(room => {
        socket.to(room).broadcast.emit('user-disconnected', rooms[room].users[socket.id])
        delete rooms[room].users[socket.id]
      })
    })
  })
  
  function getUserRooms(socket) {
    return Object.entries(rooms).reduce((names, [name, room]) => {
      if (room.users[socket.id] != null) names.push(name)
      return names
    }, [])      //used for get undeleted rooms with users
  }
})

