const userController = require("../Controllers/user.controller");
const chatController = require("../Controllers/chat.controller");
const authController = require("../Controllers/auth.controller");

module.exports = (io) => {
    io.on("connection", async(socket) => {
        console.log("client is connected ", socket.id);

        socket.on("login", async(email, authCode , cb) => {
            console.log("client login request", email, authCode);
            // 유저정보 저장
            try{
                const keyExists = await userController.checkAuthCode(email, authCode);
                console.log("keyExists ", keyExists);
                if(!keyExists.success){
                    cb({ok:false, error:keyExists.message});
                } else {
                    const user = await userController.saveUser(email, socket.id);
                    const welcomeMessage = {
                        chat: `${user.name} is joined to this room`,
                        user: {id: null, name: "system"},
                    }
                    console.log("client login ", welcomeMessage);
                    io.emit("message", welcomeMessage);
                    cb({ok:true, data:user});
                }
            }catch(error){
                cb({ok:false, error:error.message});
            }
        });
        
        socket.on("sendMessage", async(message, cb) => {
            try{
                // 유저 찾기 socket.id
                const user = await userController.checkUser(socket.id);
                console.log("client sendMessage ");
                // 메세지 저장
                const newMessage = await chatController.saveChat(message, user);
                io.emit("message", newMessage);
                console.log("client sendMessage ", newMessage);
                cb({ok:true});
            }catch(error){
                cb({ok:false, error:error.message});
            }
        });

        socket.on("logout", async(cb) => {
            try {
                const user = await userController.logoutUser(socket.id);
                const logoutMessage = {
                    chat: `${user.name} left the room`,
                    user: {id: null, name: "system"},
                }
                io.emit("message", logoutMessage);
                cb({ok: true});
                socket.disconnect(true);
            } catch(error) {
                console.error("Logout error:", error);
                cb({ok: false, error: error.message});
            }
        });

        // disconnect 이벤트 핸들러 수정
        socket.on("disconnect", async() => {
            try {
                // 유저 찾기 (findOne 사용)
                const user = await userController.checkUser(socket.id);
                
                if (user) {
                    // 유저가 존재하는 경우에만 처리
                    user.online = false;
                    user.token = null;
                    await user.save();
                }
            } catch(error) {
                // 유저를 찾지 못한 경우 무시
                console.log("Disconnect: User not found for socket", socket.id);
            }
            console.log("client is disconnected ", socket.id);
        });

        // 이메일 인증 요청
        socket.on("requestEmailAuth", async(email, cb) => {
            try {
                if (email) {
                    const authCode = Math.floor(100000 + Math.random() * 900000).toString();
                    console.log("requestEmailAuth ", email + " " + authCode);
                    // 6자리 인증 코드 생성

                    // 이메일 발송
                    await authController.sendAuthEmail(email, authCode);
                    cb({ok: true});
                }
            } catch(error) {
                console.log("requestEmailAuth ", error);
            }
        });
    });
};