const mongoose = require("mongoose");
const Cafe = require("./Cafeschema.js");
const Customer = require("./Customerschema.js");

const TableSchema = new mongoose.Schema({
  cafe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cafe",
    required: true
  },
  tableNumber: {
    type: Number,
    required: true
  },
  qrUrl: {
    type: String,
    required: true
  },
  qrImage: {
    type: String // Store image path or base64
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});



module.exports = mongoose.model("Table", TableSchema);
