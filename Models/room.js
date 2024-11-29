const mongoose = require("mongoose");

// const roomSchema = new mongoose.Schema(
//   {
//     room: { type: String, required: true, unique: true },
//     members: { type: [mongoose.Schema.Types.ObjectId], default: [] }
//   },
//   { timestamp: true }
// );
// module.exports = mongoose.model("Room", roomSchema);

const roomSchema = new mongoose.Schema(
  {
    room: String,
    members: [
      {
        type: mongoose.Schema.ObjectId,
        unique: true,
        ref: "User",
      },
    ],
  },
  { timestamp: true }
);
module.exports = mongoose.model("Room", roomSchema);