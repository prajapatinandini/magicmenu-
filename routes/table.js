const express = require('express');
const router = express.Router();
const Table = require('../models/Tableschema');
const Cafe = require('../models/Cafeschema');
const QRCode = require('qrcode');
const QRModel = require('../models/QRschema');
const authMiddleware = require('../middleware/ownerMiddle');

// Create a table & generate QR code
router.post('/cafes/:cafeId/tables', authMiddleware,async (req, res) => {
  try {
    const { cafeId } = req.params;
    const { tableNumber } = req.body;

    const cafe = await Cafe.findById(cafeId);
    if (!cafe) return res.status(404).json({ error: 'Cafe not found' });

    const scanUrl = `${req.protocol}://${req.get('host')}/qr/scan/${tableNumber}`;

    const qrImage = await QRCode.toDataURL(scanUrl);

    const table = new Table({
      cafe: cafeId,
      tableNumber,
      qrUrl: scanUrl,
      qrImage
    });
    await table.save();

    const qrDoc = new QRModel({
      table: table._id,
      url: scanUrl
    });
    await qrDoc.save();

    return res.status(201).json({ message: 'Table created', table });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// List all tables for a cafe
router.get('/cafes/:cafeId/tables',authMiddleware, async (req, res) => {
  try {
    const { cafeId } = req.params;
    const tables = await Table.find({ cafe: cafeId }).populate('cafe');
    return res.status(200).json({ tables });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch tables', details: err.message });
  }
});

// Get QR scan URL
router.get('/tables/:tableId/qr', async (req, res) => {
  try {
    const { tableId } = req.params;
    const table = await Table.findById(tableId);
    if (!table) return res.status(404).json({ error: 'Table not found' });

    return res.status(200).json({ qrUrl: table.qrUrl, qrImage: table.qrImage });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch QR', details: err.message });
  }
});

//  Redirect when QR code is scanned
router.get('/qr/scan/:tableId', async (req, res) => {
  try {
    const { tableId } = req.params;
    const table = await Table.findOne({ tableNumber: tableId });

    if (!table) return res.status(404).send('Table not found');

  
    return res.redirect(`/order/${table._id}`);
  } catch (err) {
    return res.status(500).send('Something went wrong');
  }
});

module.exports = router;
