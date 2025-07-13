const mongoose = require("mongoose");
const Cafe = require("./Cafeschema.js");

const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    unique: true, 
    required: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  phone: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['owner', 'admin'], 
    default: 'owner' 
  },
  cafes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Cafe' 
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("Owner", UserSchema);
