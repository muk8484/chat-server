const userController = require("../Controllers/user.controller");
const chatController = require("../Controllers/chat.controller");
const roomController = require("../Controllers/room.controller");

module.exports = (io) => {
    io.on("connection", async(socket) => {
        console.log("client is connected ", socket.id);


        socket.on("login", async(userName, cb) => {
            console.log("client login ", userName);
            // 유저정보 저장
            try{
                const user = await userController.saveUser(userName, socket.id);
                const welcomeMessage = {
                    chat: `${user.name} is joined to this room`,
                    user: {id: null, name: "system"},
                }
                console.log("client login ", welcomeMessage);
                io.emit("message", welcomeMessage);
                cb({ok:true, data:user});
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

        // socket.on("joinRoom", async (rid, cb) => {
        //     try {
        //       const user = await checkUser(socket.id); // 일단 유저정보들고오기
        //       await roomController.joinRoom(rid, user); // 1~2작업
        //       socket.join(user.room.toString());//3 작업
        //       const welcomeMessage = {
        //         chat: `${user.name} is joined to this room`,
        //         user: { id: null, name: "system" },
        //       };
        //       io.to(user.room.toString()).emit("message", welcomeMessage);// 4 작업
        //       io.emit("rooms", await roomController.getAllRooms());// 5 작업
        //       cb({ ok: true });
        //     } catch (error) {
        //       cb({ ok: false, error: error.message });
        //     }
        //   });

        // socket.emit("rooms", await roomController.getAllRooms());

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
                    
                    // 시스템 메시지 전송
                    // const disconnectMessage = {
                    //     chat: `${user.name} has disconnected`,
                    //     user: {id: null, name: "system"},
                    // }
                    // io.emit("message", disconnectMessage);
                }
            } catch(error) {
                // 유저를 찾지 못한 경우 무시
                console.log("Disconnect: User not found for socket", socket.id);
            }
            console.log("client is disconnected ", socket.id);
        });
    });
};