const mongoose = require("mongoose");

const MenuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  price: {
    type: Number,
    min: 0,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String
  }],
  category: {
    type: String,
    required: true
  },
  subCategory: {
    type: String
  },
  customizations: {
    type: [
      {
        label: {
          type: String,
          required: true
        },
        options: [
          {
            name: {
              type: String,
              required: true
            },
            priceModifier: {
              type: Number,
              required: true,
              default: 0
            }
          }
        ]
      }
    ],
    default: undefined // supports optional customizations
  }
});

module.exports = mongoose.model("MenuItem", MenuItemSchema);
