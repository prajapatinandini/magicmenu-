const mongoose = require("mongoose");

const MenuSchema = new mongoose.Schema({
  cafe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cafe',
    required: true
  },
  categories: [
    {
      name: {
        type: String,
        required: true
      },
      description: {
        type: String,
        required: false
      },
      image: {
        type: String,
        required: false
      },
      items: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'MenuItem'
        }
      ],
      subCategories: [
        {
          name: {
            type: String,
            required: true
          },
          description: {
            type: String,
            required: false
          },
          image: {
            type: String,
            required: false
          },
          price: {
            type: Number,
            min: 0,
            required: false
          },
          items: [
            {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'MenuItem'
            }
          ]
        }
      ]
    }
  ],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Menu", MenuSchema);
