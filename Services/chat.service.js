const Chat = require("../Models/chat")

const chatService = {}

chatService.saveChat = async(message, user) => {
    const newMessage = new Chat({
        chat: message,
        user: {
            // user._id는 MongoDB가 자동으로 생성하는 고유한 ObjectId
            id: user._id,
            name: user.name,
        }
    });
    await newMessage.save();
    return newMessage;
}

module.exports = chatService;