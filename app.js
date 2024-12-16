const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const { DatabaseSettings } = require('./common/settings').default;
const { DatabaseConnection } = require('./common/database');
const Redis = require("ioredis");

const app = express();
app.use(cors());

const dbSettings = new DatabaseSettings();

const redisClient = new Redis({
  host: dbSettings.redis.host,
  port: dbSettings.redis.port,
  db: dbSettings.redis.db,
  base_key: dbSettings.redis.base_key,
});
// redis 연결 테스트
redisClient.set("testKey", "Hello, Redis!!")
  .then(() => redisClient.get("testKey"))
  .then((result) => {
    console.log("Value:", result);
  })
  .catch((err) => console.error("Redis Error:", err));

mongoose.connect(dbSettings.mongo.url, {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
  authSource: 'admin',
  user: 'rootuser',
  pass: 'rootpassword'
})
.then(() => console.log('MongoDB 연결 성공'))
.catch(err => console.error('MongoDB 연결 실패:', err));

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

module.exports = {
  app,
  redisClient
};