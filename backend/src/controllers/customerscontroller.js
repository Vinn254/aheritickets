// src/controllers/customersController.js
const Customer = require('../models/customer');

// List all customers (admin and technician only)
exports.listCustomers = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search = '', status = '' } = req.query;
    const filter = {};

    // Search by customerName, email, or contact
    if (search) {
      filter.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { contact: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by package status
    if (status && ['active', 'dormant', 'deactive'].includes(status)) {
      filter.packageStatus = status;
    }

    const customers = await Customer.find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10))
      .sort({ createdAt: -1 });

    const total = await Customer.countDocuments(filter);

    res.json({ customers, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// Get single customer by ID
exports.getCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    next(err);
  }
};

// Create customer (admin and technician)
exports.createCustomer = async (req, res, next) => {
  try {
    const { customerName, contact, email, connectionType, packageStatus, location } = req.body;

    if (!customerName || !contact || !email) {
      return res.status(400).json({ message: 'Missing required fields: customerName, contact, email' });
    }

    const customer = new Customer({
      customerName,
      contact,
      email,
      connectionType: connectionType || 'wireless',
      packageStatus: packageStatus || 'active',
      location: location || '',
      createdBy: req.user._id,
      updatedBy: req.user._id
    });

    await customer.save();
    res.status(201).json(customer);
  } catch (err) {
    next(err);
  }
};

// Update customer (admin and technician)
exports.updateCustomer = async (req, res, next) => {
  try {
    const { customerName, contact, email, connectionType, packageStatus, location } = req.body;
    const updates = {};

    if (customerName) updates.customerName = customerName;
    if (contact) updates.contact = contact;
    if (email) updates.email = email;
    if (connectionType && ['fiber', 'wireless'].includes(connectionType)) updates.connectionType = connectionType;
    if (packageStatus && ['active', 'dormant', 'deactive'].includes(packageStatus)) updates.packageStatus = packageStatus;
    if (location !== undefined) updates.location = location;

    updates.updatedBy = req.user._id;

    const customer = await Customer.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    next(err);
  }
};

// Delete customer (admin only)
exports.deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    next(err);
  }
};
