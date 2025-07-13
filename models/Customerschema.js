const mongoose = require("mongoose");
const Table = require("./Tableschema.js");
const Menu = require("./Menuschema.js");

const CustomerSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  phone: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true 
  },
  isGuest: { 
    type: Boolean, 
    default: true 
  },
  verified: {               // ✅ Optional: Mark if OTP was verified
    type: Boolean,
    default: false
  },
  table: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Table', 
    required: true 
  },
  cafe: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Cafe', 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("Customer", CustomerSchema);
