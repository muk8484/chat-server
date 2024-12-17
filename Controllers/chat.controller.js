const chatService = require('../Services/chat.service');

const chatController = {}

chatController.saveChat = async(message, user) => {
    try {
        const newMessage = await chatService.saveChat(message, user);
        return newMessage;
    } catch (error) {
        console.error('Controller_saveChat - 채팅 저장 실패:', error);
        throw error;
    }
}

module.exports = chatController;