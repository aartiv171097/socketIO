const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatSchema = new Schema(
  {
    message: {
      type: String
    },
    members:[{type:String}], //for group chat, membersId includes
    sender: {
      type: String
    }, //senderId can be reference of user table
    receiver: {
        type: String
    }, //receiverId can be reference of user table  
    isRead:{
        type:Boolean,     
        default:false
    }   //key to maintain read or unread count
  },
  {
    timestamps: true
  }
);

let Chat = mongoose.model("chat", chatSchema);

module.exports = Chat;
