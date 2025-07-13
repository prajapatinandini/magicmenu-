const mongoose = require("mongoose");
const Table = require("./Tableschema.js");
const Cafe = require("./Cafeschema.js");
const Customer = require("./Customerschema.js");
const MenuItem = require("./Menuitem.js");

const OrderSchema = new mongoose.Schema({
  cafe: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Cafe', 
    required: true 
  },
  table: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Table', 
    required: true 
  },
  customer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Customer', 
    required: true 
  },
  items: [
    {
      menuItem: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'MenuItem', 
        required: true 
      },
      quantity: { 
        type: Number, 
        required: true, 
        min: 1 
      },
      customizations: [
        {
          label: { type: String },
          option: { type: String }
        }
      ],
      price: { 
        type: Number, 
        required: true, 
        min: 0 
      }
    }
  ],
  orderStatus: {
    type: String,
    enum: ['pending', 'in_progress', 'served', 'cancelled', 'completed'],
    default: 'pending',
    required: true
  },
  totalAmount: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid'],
    default: 'unpaid',
    required: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("Order", OrderSchema);
