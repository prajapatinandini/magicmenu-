const mongoose = require("mongoose");
const Table = require("./Tableschema.js");
const Menu = require("./Menuschema.js");
const User = require("./Userschema.js");

const CafeSchema = new mongoose.Schema({
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  address: { 
    type: String, 
    required: true 
  },
  logoUrl: { 
    type: String
  },
  tables: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Table' 
  }],
  menu: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Menu' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("Cafe", CafeSchema);




