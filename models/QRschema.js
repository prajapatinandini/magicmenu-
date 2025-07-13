const mongoose = require("mongoose");
const Table = require("./Tableschema.js");

const QRSchema = new mongoose.Schema({
  table: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Table', 
    required: true 
  },
  url: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("Qrcode", QRSchema);
