// backend/src/models/inventory.js
const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema(
  {
    deviceType: {
      type: String,
      enum: ['AP', 'Backbone', 'POP', 'Station'],
      required: true
    },
    brand: { type: String, required: true, trim: true },
    model: { type: String, trim: true, default: '' },
    serialNumber: { type: String, required: true, unique: true, trim: true },
    category: {
      type: String,
      enum: ['deployed', 'in stock', 'spoiled'],
      required: true
    },
    location: { type: String, trim: true, default: '' }, // For deployed devices
    notes: { type: String, trim: true, default: '' },
    deviceId: { type: mongoose.Schema.Types.ObjectId, refPath: 'deviceType', default: null }, // Reference to the actual device if deployed
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inventory', InventorySchema);