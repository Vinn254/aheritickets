// backend/src/controllers/inventorycontroller.js
const Inventory = require('../models/inventory');

// Create inventory item (Admin/Technician only)
exports.createInventory = async (req, res, next) => {
  try {
    const { deviceType, brand, model, serialNumber, category, location, notes } = req.body;
    if (!deviceType || !brand || !serialNumber || !category) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!['admin', 'technician'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const inventory = new Inventory({
      deviceType,
      brand,
      model,
      serialNumber,
      category,
      location,
      notes
    });

    await inventory.save();
    res.status(201).json({ inventory });
  } catch (err) {
    next(err);
  }
};

// Get all inventory items with filters (Admin/Technician only)
exports.getInventory = async (req, res, next) => {
  try {
    if (!['admin', 'technician'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { deviceType, category, brand, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (deviceType) filter.deviceType = deviceType;
    if (category) filter.category = category;
    if (brand) filter.brand = new RegExp(brand, 'i');

    const inventory = await Inventory.find(filter)
      .populate('deviceId')
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10));

    const total = await Inventory.countDocuments(filter);

    res.json({ inventory, total, page: parseInt(page, 10) });
  } catch (err) {
    next(err);
  }
};

// Get inventory counts by category and device type
exports.getInventoryCounts = async (req, res, next) => {
  try {
    if (!['admin', 'technician'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const counts = await Inventory.aggregate([
      {
        $group: {
          _id: { deviceType: '$deviceType', category: '$category' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.deviceType',
          categories: {
            $push: {
              category: '$_id.category',
              count: '$count'
            }
          },
          total: { $sum: '$count' }
        }
      }
    ]);

    res.json({ counts });
  } catch (err) {
    next(err);
  }
};

// Get single inventory item by id
exports.getInventoryById = async (req, res, next) => {
  try {
    if (!['admin', 'technician'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { id } = req.params;
    const inventory = await Inventory.findById(id).populate('deviceId');
    if (!inventory) return res.status(404).json({ message: 'Inventory item not found' });

    res.json({ inventory });
  } catch (err) {
    next(err);
  }
};

// Update inventory item (Admin/Technician only)
exports.updateInventory = async (req, res, next) => {
  try {
    if (!['admin', 'technician'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { id } = req.params;
    const { deviceType, brand, model, serialNumber, category, location, notes, deviceId } = req.body;

    const inventory = await Inventory.findById(id);
    if (!inventory) return res.status(404).json({ message: 'Inventory item not found' });

    if (deviceType) inventory.deviceType = deviceType;
    if (brand) inventory.brand = brand;
    if (model !== undefined) inventory.model = model;
    if (serialNumber) inventory.serialNumber = serialNumber;
    if (category) inventory.category = category;
    if (location !== undefined) inventory.location = location;
    if (notes !== undefined) inventory.notes = notes;
    if (deviceId !== undefined) inventory.deviceId = deviceId;

    await inventory.save();
    const updated = await Inventory.findById(id).populate('deviceId');
    res.json({ inventory: updated });
  } catch (err) {
    next(err);
  }
};

// Delete inventory item (Admin only)
exports.deleteInventory = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can delete inventory items' });
    }

    const { id } = req.params;
    const inventory = await Inventory.findById(id);
    if (!inventory) return res.status(404).json({ message: 'Inventory item not found' });

    await Inventory.findByIdAndDelete(id);
    res.json({ message: 'Inventory item deleted successfully' });
  } catch (err) {
    next(err);
  }
};