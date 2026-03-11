// src/controllers/planController.js
const Plan = require('../models/plan');
const User = require('../models/user');
const Invoice = require('../models/invoice');
const Ticket = require('../models/ticket');
const Customer = require('../models/customer');
const InstallationRequest = require('../models/installationrequest');

// Get all plans (with filtering)
const getPlans = async (req, res) => {
  try {
    const { planType, status, startDate, endDate } = req.query;
    const filter = {};
    
    if (planType) filter.planType = planType;
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    // For technicians, only show plans assigned to them or they created
    if (req.user.role === 'technician') {
      filter.$or = [
        { assignedTo: req.user.id },
        { createdBy: req.user.id }
      ];
    }
    
    const plans = await Plan.find(filter)
      .populate('client', 'name email phone')
      .populate('personnel', 'name email')
      .populate('createdBy', 'name')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single plan
const getPlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id)
      .populate('client', 'name email phone location')
      .populate('personnel', 'name email phone')
      .populate('createdBy', 'name')
      .populate('assignedTo', 'name email')
      .populate('dailyPlans')
      .populate('weeklyPlans');
    
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create plan
const createPlan = async (req, res) => {
  try {
    const { 
      planType, title, description, date, time, location, 
      client, activity, resources, personnel, remarks,
      startDate, endDate, assignedTo 
    } = req.body;
    
    if (!planType || !title) {
      return res.status(400).json({ error: 'Plan type and title are required' });
    }
    
    // Verify client exists if provided
    if (client) {
      const clientExists = await User.findById(client);
      if (!clientExists) {
        return res.status(404).json({ error: 'Client not found' });
      }
    }
    
    // Verify personnel exist
    if (personnel && personnel.length > 0) {
      for (const techId of personnel) {
        const tech = await User.findById(techId);
        if (!tech || tech.role !== 'technician') {
          return res.status(404).json({ error: `Technician not found: ${techId}` });
        }
      }
    }
    
    const plan = new Plan({
      planType,
      title,
      description,
      date: date ? new Date(date) : null,
      time,
      location,
      client,
      activity,
      resources,
      personnel: personnel || [],
      remarks,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      createdBy: req.user.id,
      assignedTo: assignedTo || []
    });
    
    await plan.save();
    await plan.populate('client', 'name email phone');
    await plan.populate('personnel', 'name email');
    await plan.populate('createdBy', 'name');
    
    res.status(201).json(plan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update plan
const updatePlan = async (req, res) => {
  try {
    const { 
      title, description, date, time, location, 
      client, activity, resources, personnel, remarks,
      startDate, endDate, assignedTo, status 
    } = req.body;
    
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    
    // Update fields
    if (title) plan.title = title;
    if (description !== undefined) plan.description = description;
    if (date) plan.date = new Date(date);
    if (time) plan.time = time;
    if (location !== undefined) plan.location = location;
    if (client) plan.client = client;
    if (activity !== undefined) plan.activity = activity;
    if (resources !== undefined) plan.resources = resources;
    if (personnel) plan.personnel = personnel;
    if (remarks !== undefined) plan.remarks = remarks;
    if (startDate) plan.startDate = new Date(startDate);
    if (endDate) plan.endDate = new Date(endDate);
    if (assignedTo) plan.assignedTo = assignedTo;
    if (status) plan.status = status;
    
    await plan.save();
    await plan.populate('client', 'name email phone');
    await plan.populate('personnel', 'name email');
    
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete plan
const deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    res.json({ message: 'Plan deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Reports generation
const getInvoiceReport = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    const filter = {};
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    if (status) filter.status = status;
    
    const invoices = await Invoice.find(filter)
      .populate('customer', 'name email phone')
      .sort({ createdAt: -1 });
    
    // Calculate totals
    const totalAmount = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const paidAmount = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + (inv.total || 0), 0);
    const pendingAmount = invoices
      .filter(inv => inv.status === 'pending' || inv.status === 'sent')
      .reduce((sum, inv) => sum + (inv.total || 0), 0);
    
    res.json({
      invoices,
      summary: {
        totalInvoices: invoices.length,
        totalAmount,
        paidAmount,
        pendingAmount,
        dateRange: { startDate, endDate }
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getCustomerReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = { role: 'customer' };
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    const customers = await User.find(filter)
      .select('name email phone location createdAt customerSegment serviceType')
      .sort({ createdAt: -1 });
    
    // Get customer statistics
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.isActive).length;
    
    // Get segment distribution
    const segments = {};
    customers.forEach(c => {
      const seg = c.customerSegment || 'Unknown';
      segments[seg] = (segments[seg] || 0) + 1;
    });
    
    res.json({
      customers,
      summary: {
        totalCustomers,
        activeCustomers,
        segments,
        dateRange: { startDate, endDate }
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getNetworkReport = async (req, res) => {
  try {
    const POP = require('../models/pop');
    const Station = require('../models/station');
    const AP = require('../models/ap');
    const Backbone = require('../models/backbone');
    
    const [pops, stations, aps, backbones] = await Promise.all([
      POP.find().populate('location'),
      Station.find().populate('pop'),
      AP.find().populate('station'),
      Backbone.find()
    ]);
    
    res.json({
      network: {
        pops: pops.length,
        stations: stations.length,
        accessPoints: aps.length,
        backbones: backbones.length
      },
      details: { pops, stations, aps, backbones }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getInstallationReport = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    const filter = {};
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    if (status) filter.status = status;
    
    const installations = await InstallationRequest.find(filter)
      .populate('customer', 'name email phone')
      .populate('technician', 'name')
      .sort({ createdAt: -1 });
    
    // Calculate statistics
    const statusCounts = {};
    installations.forEach(inst => {
      statusCounts[inst.status] = (statusCounts[inst.status] || 0) + 1;
    });
    
    res.json({
      installations,
      summary: {
        totalInstallations: installations.length,
        statusCounts,
        dateRange: { startDate, endDate }
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getPlans,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan,
  getInvoiceReport,
  getCustomerReport,
  getNetworkReport,
  getInstallationReport
};
