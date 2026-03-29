// src/controllers/marketingcontroller.js
const MarketingLead = require('../models/marketinglead');
const MarketingPlan = require('../models/marketingplan');

// Marketing Leads CRUD

// List all marketing leads
exports.listLeads = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search = '', status = '' } = req.query;
    const filter = {};

    // Search by name, location, or contact person
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by status
    if (status && ['new', 'contacted', 'interested', 'not_interested', 'converted', 'follow_up'].includes(status)) {
      filter.status = status;
    }

    const leads = await MarketingLead.find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10))
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    const total = await MarketingLead.countDocuments(filter);

    res.json({ leads, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// Get single lead by ID
exports.getLead = async (req, res, next) => {
  try {
    const lead = await MarketingLead.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    next(err);
  }
};

// Create marketing lead
exports.createLead = async (req, res, next) => {
  try {
    const {
      name, plusCode, location, numberOfUnits, serviceProviders,
      outreachFeedback, prospectDetails, contactPerson, feedbackNotes,
      status, dateVisited, assignedPersonnel
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const lead = new MarketingLead({
      name,
      plusCode: plusCode || '',
      location: location || '',
      numberOfUnits: numberOfUnits || 0,
      serviceProviders: serviceProviders || '',
      outreachFeedback: outreachFeedback || '',
      prospectDetails: prospectDetails || '',
      contactPerson: contactPerson || '',
      feedbackNotes: feedbackNotes || '',
      status: status || 'new',
      dateVisited: dateVisited || null,
      assignedPersonnel: assignedPersonnel || '',
      createdBy: req.user._id,
      updatedBy: req.user._id
    });

    await lead.save();
    res.status(201).json(lead);
  } catch (err) {
    next(err);
  }
};

// Update marketing lead
exports.updateLead = async (req, res, next) => {
  try {
    const updates = req.body;
    updates.updatedBy = req.user._id;

    const lead = await MarketingLead.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    next(err);
  }
};

// Delete marketing lead
exports.deleteLead = async (req, res, next) => {
  try {
    const lead = await MarketingLead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json({ message: 'Lead deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Marketing Plans CRUD

// List all marketing plans
exports.listPlans = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const plans = await MarketingPlan.find()
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10))
      .sort({ weekStartDate: -1 })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    const total = await MarketingPlan.countDocuments();

    res.json({ plans, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// Get single plan by ID
exports.getPlan = async (req, res, next) => {
  try {
    const plan = await MarketingPlan.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json(plan);
  } catch (err) {
    next(err);
  }
};

// Create marketing plan
exports.createPlan = async (req, res, next) => {
  try {
    const { weekStartDate, areasPlanned, areasToRevisit, notes } = req.body;

    if (!weekStartDate) {
      return res.status(400).json({ message: 'Week start date is required' });
    }

    const plan = new MarketingPlan({
      weekStartDate,
      areasPlanned: areasPlanned || [],
      areasToRevisit: areasToRevisit || [],
      notes: notes || '',
      createdBy: req.user._id,
      updatedBy: req.user._id
    });

    await plan.save();
    res.status(201).json(plan);
  } catch (err) {
    next(err);
  }
};

// Update marketing plan
exports.updatePlan = async (req, res, next) => {
  try {
    const updates = req.body;
    updates.updatedBy = req.user._id;

    const plan = await MarketingPlan.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json(plan);
  } catch (err) {
    next(err);
  }
};

// Delete marketing plan
exports.deletePlan = async (req, res, next) => {
  try {
    const plan = await MarketingPlan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json({ message: 'Plan deleted successfully' });
  } catch (err) {
    next(err);
  }
};