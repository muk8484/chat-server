const {createServer} = require("http");
const {Server} = require("socket.io");
const app = require("./app");
require("dotenv").config();

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors:{
        origin: "*",  // 모든 도메인에서 접근 허용
        methods: ["GET", "POST", "OPTIONS"],
        credentials: true,
    },
});

require("./utils/io")(io);
// 0.0.0.0으로 설정하여 모든 IP에서 접근 가능하도록 함
httpServer.listen(process.env.APP_SERVER__PORT, "0.0.0.0", () => {
    console.log("Server listening on port ", process.env.APP_SERVER__PORT);
});
// httpServer.listen(process.env.PORT, () => {
//     console.log("Server listening on port ", process.env.PORT);
// });


