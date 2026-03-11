// backend/src/controllers/networkcontroller.js
const POP = require('../models/pop');
const AP = require('../models/ap');
const Station = require('../models/station');
const Backbone = require('../models/backbone');
const { exec } = require('child_process');

const checkDeviceStatus = (address) => {
  return new Promise((resolve) => {
    exec(`ping -n 1 ${address}`, (error) => {
      resolve(!error);
    });
  });
};

// POP CRUD
exports.getPOPs = async (req, res) => {
  try {
    const pops = await POP.find().populate('aps').populate('backbones');

    // Check real-time status by pinging
    const statusPromises = pops.map(async (pop) => {
      const isUp = await checkDeviceStatus(pop.address);
      pop.status = isUp ? 'active' : 'down';
      if (isUp) pop.lastSeen = new Date();
      await pop.save();
      return pop;
    });

    await Promise.all(statusPromises);

    res.set('Cache-Control', 'no-cache');
    res.json({ pops });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createPOP = async (req, res) => {
  try {
    const pop = new POP(req.body);
    await pop.save();
    res.status(201).json({ pop });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updatePOP = async (req, res) => {
  try {
    const pop = await POP.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!pop) return res.status(404).json({ error: 'POP not found' });
    res.json({ pop });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deletePOP = async (req, res) => {
  try {
    const pop = await POP.findByIdAndDelete(req.params.id);
    if (!pop) return res.status(404).json({ error: 'POP not found' });
    res.json({ message: 'POP deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// AP CRUD
exports.getAPs = async (req, res) => {
  try {
    const aps = await AP.find().populate('pop').populate('stations');

    // Check real-time status by pinging
    const statusPromises = aps.map(async (ap) => {
      const isUp = await checkDeviceStatus(ap.address);
      ap.status = isUp ? 'active' : 'down';
      if (isUp) ap.lastSeen = new Date();
      await ap.save();
      return ap;
    });

    await Promise.all(statusPromises);

    res.set('Cache-Control', 'no-cache');
    res.json({ aps });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createAP = async (req, res) => {
  try {
    const ap = new AP(req.body);
    await ap.save();
    // Add to POP's aps
    await POP.findByIdAndUpdate(ap.pop, { $push: { aps: ap._id } });
    res.status(201).json({ ap });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateAP = async (req, res) => {
  try {
    const ap = await AP.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ap) return res.status(404).json({ error: 'AP not found' });
    res.json({ ap });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteAP = async (req, res) => {
  try {
    const ap = await AP.findByIdAndDelete(req.params.id);
    if (!ap) return res.status(404).json({ error: 'AP not found' });
    // Remove from POP's aps
    await POP.findByIdAndUpdate(ap.pop, { $pull: { aps: ap._id } });
    res.json({ message: 'AP deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Station CRUD
exports.getStations = async (req, res) => {
  try {
    const stations = await Station.find().populate('ap');

    // Check real-time status by pinging if address is provided
    const statusPromises = stations.map(async (station) => {
      if (station.address) {
        const isUp = await checkDeviceStatus(station.address);
        station.status = isUp ? 'active' : 'down';
        if (isUp) station.lastSeen = new Date();
        await station.save();
      }
      return station;
    });

    await Promise.all(statusPromises);

    res.set('Cache-Control', 'no-cache');
    res.json({ stations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createStation = async (req, res) => {
  try {
    const station = new Station(req.body);
    await station.save();
    // Add to AP's stations
    await AP.findByIdAndUpdate(station.ap, { $push: { stations: station._id } });
    res.status(201).json({ station });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateStation = async (req, res) => {
  try {
    const station = await Station.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!station) return res.status(404).json({ error: 'Station not found' });
    res.json({ station });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteStation = async (req, res) => {
  try {
    const station = await Station.findByIdAndDelete(req.params.id);
    if (!station) return res.status(404).json({ error: 'Station not found' });
    // Remove from AP's stations
    await AP.findByIdAndUpdate(station.ap, { $pull: { stations: station._id } });
    res.json({ message: 'Station deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Backbone CRUD
exports.getBackbones = async (req, res) => {
  try {
    const backbones = await Backbone.find().populate('pops');
    res.set('Cache-Control', 'no-cache');
    res.json({ backbones });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createBackbone = async (req, res) => {
  try {
    const backbone = new Backbone(req.body);
    await backbone.save();
    // Add to POPs' backbones
    for (const popId of backbone.pops) {
      await POP.findByIdAndUpdate(popId, { $push: { backbones: backbone._id } });
    }
    res.status(201).json({ backbone });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateBackbone = async (req, res) => {
  try {
    const backbone = await Backbone.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!backbone) return res.status(404).json({ error: 'Backbone not found' });
    res.json({ backbone });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteBackbone = async (req, res) => {
  try {
    const backbone = await Backbone.findByIdAndDelete(req.params.id);
    if (!backbone) return res.status(404).json({ error: 'Backbone not found' });
    // Remove from POPs' backbones
    for (const popId of backbone.pops) {
      await POP.findByIdAndUpdate(popId, { $pull: { backbones: backbone._id } });
    }
    res.json({ message: 'Backbone deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};