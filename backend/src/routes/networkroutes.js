// backend/src/routes/networkroutes.js
const express = require('express');
const router = express.Router();
const networkController = require('../controllers/networkcontroller');
const { authMiddleware } = require('../middleware/authmiddleware');

// All routes require authentication and admin/technician role
router.use(authMiddleware);
router.use((req, res, next) => {
  if (!['admin', 'technician'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
});

// POP routes
router.get('/pops', networkController.getPOPs);
router.post('/pops', networkController.createPOP);
router.put('/pops/:id', networkController.updatePOP);
router.delete('/pops/:id', networkController.deletePOP);

// AP routes
router.get('/aps', networkController.getAPs);
router.post('/aps', networkController.createAP);
router.put('/aps/:id', networkController.updateAP);
router.delete('/aps/:id', networkController.deleteAP);

// Station routes
router.get('/stations', networkController.getStations);
router.post('/stations', networkController.createStation);
router.put('/stations/:id', networkController.updateStation);
router.delete('/stations/:id', networkController.deleteStation);

// Backbone routes
router.get('/backbones', networkController.getBackbones);
router.post('/backbones', networkController.createBackbone);
router.put('/backbones/:id', networkController.updateBackbone);
router.delete('/backbones/:id', networkController.deleteBackbone);

module.exports = router;