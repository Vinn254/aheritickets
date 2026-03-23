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
      .populate('invoice', 'invoiceNumber')
      .populate('approvedBy', 'name')
      .populate('procurementReview.reviewedBy', 'name')
      .populate('financeReview.financeApprovedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get procurement requests (pending_procurement status)
const getProcurementRequests = async (req, res) => {
  try {
    const requests = await InstallationRequest.find({ status: 'pending_procurement' })
      .populate('customer', 'name email phone location')
      .populate('technician', 'name email phone')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get finance requests (pending_finance status)
const getFinanceRequests = async (req, res) => {
  try {
    const requests = await InstallationRequest.find({ status: 'pending_finance' })
      .populate('customer', 'name email phone location')
      .populate('technician', 'name email phone')
      .populate('approvedBy', 'name')
      .populate('procurementReview.reviewedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get admin's installation requests with all statuses for tracking
const getAdminInstallationRequests = async (req, res) => {
  try {
    const requests = await InstallationRequest.find()
      .populate('customer', 'name email phone location')
      .populate('technician', 'name email phone')
      .populate('approvedBy', 'name')
      .populate('procurementReview.reviewedBy', 'name')
      .populate('financeReview.financeApprovedBy', 'name')
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

    // Handle case where package is sent as an object instead of string
    const packageString = typeof packageName === 'object' ? packageName.name : packageName;

    if (!installationType || !packageString) {
      return res.status(400).json({ error: 'Installation type and package are required' });
    }

    const request = new InstallationRequest({
      customer: req.user.id,
      installationType,
      package: packageString,
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
      requirements,
      tools,
      technicianId,
      packagePrice,
      installationFee,
      includeRouter,
      routerPrice,
      totalUpfront
    } = req.body;

    // Handle case where package is sent as an object instead of string
    const packageString = typeof packageName === 'object' ? packageName.name : packageName;

    if (!customerId || !installationType || !packageString) {
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
      package: packageString,
      packagePrice: packagePrice || 0,
      installationFee: installationFee || 0,
      includeRouter: includeRouter || false,
      routerPrice: routerPrice || 0,
      totalUpfront: totalUpfront || 0,
      location,
      description,
      requirements,
      tools,
      technician: technicianId || null,
      status: technicianId ? 'pending_technician' : 'opened',
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

// Admin sends to procurement (write requirements and tools first)
const sendToProcurement = async (req, res) => {
  try {
    const { requirements, tools } = req.body;
    const request = await InstallationRequest.findById(req.params.id);
    
    if (!request) return res.status(404).json({ error: 'Request not found' });

    // Update requirements and tools
    request.requirements = requirements || request.requirements;
    request.tools = tools || request.tools;
    request.status = 'pending_procurement';
    
    await request.save();
    await request.populate('customer', 'name email phone location');
    await request.populate('technician', 'name email phone');
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Procurement person reviews and writes required items
const procurementReview = async (req, res) => {
  try {
    const { requiredItems, status, reviewNotes } = req.body;
    const request = await InstallationRequest.findById(req.params.id);
    
    if (!request) return res.status(404).json({ error: 'Request not found' });

    if (request.status !== 'pending_procurement') {
      return res.status(400).json({ error: 'Request is not pending procurement review' });
    }

    request.procurementReview = {
      requiredItems: requiredItems || '',
      reviewedBy: req.user.id,
      reviewedAt: new Date(),
      reviewNotes: reviewNotes || '',
      status: status || 'approved'
    };

    // Update status based on procurement decision
    if (status === 'approved') {
      request.status = 'procurement_approved';
    } else if (status === 'rejected') {
      request.status = 'rejected_procurement';
    }
    
    await request.save();
    await request.populate('customer', 'name email phone location');
    await request.populate('procurementReview.reviewedBy', 'name');
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin sends to finance after procurement approval
const sendToFinance = async (req, res) => {
  try {
    const request = await InstallationRequest.findById(req.params.id);
    
    if (!request) return res.status(404).json({ error: 'Request not found' });

    if (request.status !== 'procurement_approved') {
      return res.status(400).json({ error: 'Request must be approved by procurement first' });
    }

    request.status = 'pending_finance';
    
    await request.save();
    await request.populate('customer', 'name email phone location');
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Finance person reviews and approves
const financeReview = async (req, res) => {
  try {
    const { approvedAmount, budgetCode, status, financeNotes } = req.body;
    const request = await InstallationRequest.findById(req.params.id);
    
    if (!request) return res.status(404).json({ error: 'Request not found' });

    if (request.status !== 'pending_finance') {
      return res.status(400).json({ error: 'Request is not pending finance review' });
    }

    request.financeReview = {
      approvedAmount: approvedAmount || 0,
      budgetCode: budgetCode || '',
      financeApprovedBy: req.user.id,
      financeApprovedAt: new Date(),
      financeNotes: financeNotes || '',
      status: status || 'approved'
    };

    // Update status based on finance decision
    if (status === 'approved') {
      request.status = 'finance_approved';
    } else if (status === 'rejected') {
      request.status = 'rejected_finance';
    }
    
    await request.save();
    await request.populate('customer', 'name email phone location');
    await request.populate('financeReview.financeApprovedBy', 'name');
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }

const getInstallationRequest = async (req, res) => {
  try {
    const request = await InstallationRequest.findById(req.params.id)
      .populate('customer', 'name email phone location')
      .populate('technician', 'name email phone')
      .populate('quotation', 'quotationNumber total status')
      .populate('invoice', 'invoiceNumber total status')
      .populate('approvedBy', 'name');
    
    if (!request) return res.status(404).json({ error: 'Request not found' });
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Assign technician to installation (admin) - now requires finance approval first
const assignTechnician = async (req, res) => {
  try {
    const { technicianId } = req.body;
    const request = await InstallationRequest.findById(req.params.id);
    
    if (!request) return res.status(404).json({ error: 'Request not found' });

    // Check if finance has approved (unless bypassing workflow)
    if (request.status !== 'finance_approved' && request.status !== 'pending_technician') {
      return res.status(400).json({ error: 'Request must be approved by finance first' });
    }

    // Verify technician exists
    const technician = await User.findById(technicianId);
    if (!technician || technician.role !== 'technician') {
      return res.status(404).json({ error: 'Technician not found or invalid' });
    }

    request.technician = technicianId;
    // Change status to pending for technician to start
    if (request.status === 'finance_approved') {
      request.status = 'pending_technician';
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

    // Can close if status is completed OR pending (admin force closes)
    if (request.status !== 'completed' && request.status !== 'pending') {
      return res.status(400).json({ error: 'Installation must be in progress (pending) or completed to close' });
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
  getProcurementRequests,
  getFinanceRequests,
  getAdminInstallationRequests,
  getTechnicianInstallations,
  getTechnicians,
  getMyRequests,
  createInstallationRequest,
  createInstallation,
  sendToProcurement,
  procurementReview,
  sendToFinance,
  financeReview,
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
