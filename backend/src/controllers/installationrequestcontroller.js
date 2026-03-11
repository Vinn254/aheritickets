// src/controllers/installationRequestController.js
const InstallationRequest = require('../models/installationrequest');
const Quotation = require('../models/quotation');
const User = require('../models/user');

// Get all installation requests
const getInstallationRequests = async (req, res) => {
  try {
    const requests = await InstallationRequest.find()
      .populate('customer', 'name email phone location')
      .populate('technician', 'name email phone')
      .populate('quotation', 'quotationNumber')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get technician's assigned installations
const getTechnicianInstallations = async (req, res) => {
  try {
    const requests = await InstallationRequest.find({ technician: req.user.id })
      .populate('customer', 'name email phone location')
      .populate('technician', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all technicians (for admin to assign)
const getTechnicians = async (req, res) => {
  try {
    const technicians = await User.find({ role: 'technician', isActive: true })
      .select('name email phone specialization');
    res.json(technicians);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get customer's own requests
const getMyRequests = async (req, res) => {
  try {
    const requests = await InstallationRequest.find({ customer: req.user.id })
      .populate('technician', 'name email phone')
      .populate('quotation', 'quotationNumber total status')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create installation request (customer)
const createInstallationRequest = async (req, res) => {
  try {
    const { installationType, package: packageName, location, description } = req.body;

    if (!installationType || !packageName) {
      return res.status(400).json({ error: 'Installation type and package are required' });
    }

    const request = new InstallationRequest({
      customer: req.user.id,
      installationType,
      package: packageName,
      location,
      description,
      status: 'opened' // New status when created
    });

    await request.save();
    await request.populate('customer', 'name email phone location');
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin creates installation and assigns to technician
const createInstallation = async (req, res) => {
  try {
    const { 
      customerId, 
      installationType, 
      package: packageName, 
      location, 
      description, 
      technicianId,
      packagePrice,
      installationFee,
      includeRouter,
      routerPrice,
      totalUpfront
    } = req.body;

    if (!customerId || !installationType || !packageName) {
      return res.status(400).json({ error: 'Customer, installation type and package are required' });
    }

    // Verify customer exists
    const customer = await User.findById(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Verify technician exists if provided
    if (technicianId) {
      const technician = await User.findById(technicianId);
      if (!technician || technician.role !== 'technician') {
        return res.status(404).json({ error: 'Technician not found or invalid' });
      }
    }

    const request = new InstallationRequest({
      customer: customerId,
      installationType,
      package: packageName,
      packagePrice: packagePrice || 0,
      installationFee: installationFee || 0,
      includeRouter: includeRouter || false,
      routerPrice: routerPrice || 0,
      totalUpfront: totalUpfront || 0,
      location,
      description,
      technician: technicianId || null,
      status: technicianId ? 'pending' : 'opened', // If assigned, start as pending
      approvedBy: req.user.id
    });

    await request.save();
    await request.populate('customer', 'name email phone location');
    await request.populate('technician', 'name email phone');
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single request
const getInstallationRequest = async (req, res) => {
  try {
    const request = await InstallationRequest.findById(req.params.id)
      .populate('customer', 'name email phone location')
      .populate('technician', 'name email phone')
      .populate('quotation', 'quotationNumber total status')
      .populate('approvedBy', 'name');
    
    if (!request) return res.status(404).json({ error: 'Request not found' });
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Assign technician to installation (admin)
const assignTechnician = async (req, res) => {
  try {
    const { technicianId } = req.body;
    const request = await InstallationRequest.findById(req.params.id);
    
    if (!request) return res.status(404).json({ error: 'Request not found' });

    // Verify technician exists
    const technician = await User.findById(technicianId);
    if (!technician || technician.role !== 'technician') {
      return res.status(404).json({ error: 'Technician not found or invalid' });
    }

    request.technician = technicianId;
    // If installation was opened, change to pending when technician is assigned
    if (request.status === 'opened') {
      request.status = 'pending';
    }
    await request.save();
    
    await request.populate('customer', 'name email phone location');
    await request.populate('technician', 'name email phone');
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Technician marks installation as in progress (pending status already set when assigned)
const startInstallation = async (req, res) => {
  try {
    const request = await InstallationRequest.findById(req.params.id);
    
    if (!request) return res.status(404).json({ error: 'Request not found' });

    // Verify the technician is assigned to this installation
    if (request.technician?.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You are not assigned to this installation' });
    }

    // Can only start if status is opened (technician assigned after creation)
    if (request.status !== 'opened') {
      return res.status(400).json({ error: 'Installation is not in opened status' });
    }

    request.status = 'pending';
    await request.save();
    
    await request.populate('customer', 'name email phone location');
    await request.populate('technician', 'name email phone');
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Technician marks installation as completed (with confirmation)
const completeInstallation = async (req, res) => {
  try {
    const { technicianNotes } = req.body;
    const request = await InstallationRequest.findById(req.params.id);
    
    if (!request) return res.status(404).json({ error: 'Request not found' });

    // Verify the technician is assigned to this installation
    if (request.technician?.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You are not assigned to this installation' });
    }

    // Can only complete if status is pending (in progress)
    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Installation must be in progress (pending) to complete' });
    }

    request.status = 'completed';
    request.technicianNotes = technicianNotes || '';
    request.completionDate = new Date();
    await request.save();
    
    await request.populate('customer', 'name email phone location');
    await request.populate('technician', 'name email phone');
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin closes installation after technician completion (with confirmation)
const closeInstallation = async (req, res) => {
  try {
    const { adminConfirmationNotes } = req.body;
    const request = await InstallationRequest.findById(req.params.id);
    
    if (!request) return res.status(404).json({ error: 'Request not found' });

    // Can only close if status is completed
    if (request.status !== 'completed') {
      return res.status(400).json({ error: 'Installation must be completed by technician before closing' });
    }

    request.status = 'closed';
    request.adminConfirmationNotes = adminConfirmationNotes || '';
    request.closedDate = new Date();
    await request.save();
    
    await request.populate('customer', 'name email phone location');
    await request.populate('technician', 'name email phone');
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Approve request (backward compatibility)
const approveRequest = async (req, res) => {
  try {
    const { approvalNotes } = req.body;
    const request = await InstallationRequest.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'pending',
        approvedBy: req.user.id,
        approvalNotes
      },
      { new: true }
    )
      .populate('customer', 'name email phone location')
      .populate('approvedBy', 'name');
    
    if (!request) return res.status(404).json({ error: 'Request not found' });
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Reject request (backward compatibility)
const rejectRequest = async (req, res) => {
  try {
    const { approvalNotes } = req.body;
    const request = await InstallationRequest.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'closed',
        approvedBy: req.user.id,
        approvalNotes
      },
      { new: true }
    )
      .populate('customer', 'name email phone location')
      .populate('approvedBy', 'name');
    
    if (!request) return res.status(404).json({ error: 'Request not found' });
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create quotation from request
const createQuotationFromRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { total, otherServices = [], notes } = req.body;

    const request = await InstallationRequest.findById(requestId);
    if (!request) return res.status(404).json({ error: 'Installation request not found' });

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const quotation = new Quotation({
      customer: request.customer,
      installationType: request.installationType,
      package: request.package,
      total: total || 0,
      otherServices,
      startDate,
      endDate,
      createdBy: req.user.id,
      notes: notes || request.description,
      status: 'sent',
      sentAt: new Date()
    });

    await quotation.save();
    await quotation.populate('customer', 'name email phone');

    // Update request status to opened (ready for installation)
    await InstallationRequest.findByIdAndUpdate(
      requestId,
      { 
        quotation: quotation._id,
        approvedBy: req.user.id
      }
    );

    res.status(201).json(quotation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete request
const deleteRequest = async (req, res) => {
  try {
    const request = await InstallationRequest.findByIdAndDelete(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    res.json({ message: 'Request deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getInstallationRequests,
  getTechnicianInstallations,
  getTechnicians,
  getMyRequests,
  createInstallationRequest,
  createInstallation,
  getInstallationRequest,
  assignTechnician,
  startInstallation,
  completeInstallation,
  closeInstallation,
  approveRequest,
  rejectRequest,
  createQuotationFromRequest,
  deleteRequest
};
