const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const app = express();
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true,
}));

// WebSocket preflight 요청을 위한 OPTIONS 핸들러 추가
// app.options('*', cors());

// body parser 미들웨어
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO__URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("Connected to MongoDB"));

//  임의로 룸을 만들어주기
const Room = require("./Models/room");
app.use(express.json());
app.get("/", async (req, res) => {
  // 중복되지 않도록 기존 방을 먼저 확인하고, 중복된 경우에는 삽입하지 않음
  const existingRooms = await Room.find({ room: { $in: ["JS 단톡방", "react 단톡방", "NodeJS 단톡방"] } });
  
  if (existingRooms.length > 0) {
    return res.send("Rooms already exist");
  }

  // Room 데이터 삽입
  Room.insertMany([
    {
      room: "JS 단톡방",
      members: [], // 빈 배열 대신 기본 멤버를 추가
    },
    {
      room: "react 단톡방",
      members: [],
    },
    {
      room: "NodeJS 단톡방",
      members: [],
    },
  ])
    .then(() => res.send("Rooms inserted successfully"))
    .catch((error) => res.status(500).send(error));
});

module.exports = app;