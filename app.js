const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const app = express();
const { DatabaseSettings } = require('./common/settings');
const Redis = require("ioredis");

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true,
}));

// 설정 초기화
const dbSettings = new DatabaseSettings({
  env: process.env.NODE_ENV || 'dev',
  mongo: {
      url: process.env.MONGO__URL,
      db: process.env.MONGO__DB
  },
  redis: {
      host: process.env.REDIS__HOST || 'host.docker.internal', // Docker 호스트 주소
      port: process.env.REDIS__PORT,
      db: process.env.REDIS__DB
  }
});

// Redis 연결에 사용
// const redisClient = redis.createClient({
//     host: process.env.REDIS__HOST,
//     port: process.env.REDIS__PORT,
//     db: process.env.REDIS__DB
// });
// // Redis 연결 테스트
// redisClient.on('connect', () => {
//     console.log('Redis connected');
// });

// redisClient.on('error', (err) => {
//   console.error('Redis connection error:', err);
// });

// REDIS__HOST="localhost"
// REDIS__PORT=6379
// REDIS__BASE_KEY="emojiChat"
// REDIS__LOCK_EXPIRE_TIME=60

const redisClient = new Redis({
  host: process.env.REDIS__HOST,
  port: process.env.REDIS__PORT,
  db: process.env.REDIS__DB || 0,
  base_key: process.env.REDIS__BASE_KEY,
});

redisClient.set("testKey", "Hello, Redis!")
  .then(() => redisClient.get("testKey"))
  .then((result) => {
    console.log("Value:", result);
    // redis.disconnect();
  })
  .catch((err) => console.error("Redis Error:", err));


// WebSocket preflight 요청을 위한 OPTIONS 핸들러 추가
// app.options('*', cors());

// body parser 미들웨어
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// mongoose.connect(process.env.MONGO__URL, {
//   useNewUrlParser: true, 
//   useUnifiedTopology: true,
// }).then(() => console.log("Connected to MongoDB"));
// .catch((error) => console.log("Error connecting to MongoDB", error));

mongoose.connect(process.env.MONGO__URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
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