import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import { analyzeWasteImage } from './services/aiVisionService.js';
import { calculateWastePrice } from './services/pricingService.js';

const app = express();
const port = Number(process.env.PORT || 5000);
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/eco_mart';
const jwtSecret = process.env.JWT_SECRET || 'eco-mart-development-secret';
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '5mb' }));
const uploadDirectory = path.resolve(process.env.UPLOAD_DIR || 'uploads');
fs.mkdirSync(uploadDirectory, { recursive: true });
app.use('/uploads', express.static(uploadDirectory));
const imageUpload = multer({
  storage: multer.diskStorage({
    destination: uploadDirectory,
    filename: (req, file, callback) => callback(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(file.originalname).toLowerCase()}`)
  }),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, callback) => callback(null, ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.mimetype))
});

const userSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true }, name: String,
  email: { type: String, lowercase: true, index: true, sparse: true }, phone: String,
  password: { type: String, required: true }, role: { type: String, index: true },
  transportId: String, driverId: String, transportCompanyId: String, companyName: String,
  assignedVehicleNumber: String, address: String, state: String, city: String, pincode: String,
  licenseNumber: String, licenseType: String, agreedTerms: Boolean
}, { timestamps: true, strict: false });
const User = mongoose.model('User', userSchema);
const collectionNames = ['products', 'partners', 'fleetVehicles', 'companyDrivers', 'orders', 'environmentalImpact', 'notifications'];
const businessSchema = new mongoose.Schema({
  externalId: { type: String, required: true, index: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  sellerId: String, buyerId: String, transportCompanyId: String, driverId: String,
  targetRole: String, companyId: String
}, { timestamps: true, strict: false });
const businessModels = Object.fromEntries(collectionNames.map((name) => [name, mongoose.model(`EcoMart${name}`, businessSchema, name)]));
const demoUsers = [
  ['user-admin-1', 'Platform Administrator', 'admin@ecomart.in', '+91 98765 00000', 'Admin@123', 'ADMIN'],
  ['user-seller-1', 'Green Earth Recyclers Pvt Ltd', 'seller@ecomart.in', '+91 98765 43210', 'Seller@123', 'SELLER'],
  ['user-buyer-1', 'Anand Polymers India', 'buyer@ecomart.in', '+91 97909 11223', 'Buyer@123', 'BUYER'],
  ['TRM001', 'Santhosh Kumar (GreenRoute Manager)', 'manager@greenroute.in', '+91 98401 11223', 'Manager@123', 'TRANSPORT_MANAGER', 'comp-greenroute', 'GreenRoute Logistics Pvt Ltd'],
  ['TRM002', 'Venkatesh Rao (EcoMove Manager)', 'manager@ecomove.in', '+91 99800 22334', 'Manager@123', 'TRANSPORT_MANAGER', 'comp-ecomove', 'EcoMove Transport Services'],
  ['DRV001', 'Ramesh Kumar (Driver)', 'ramesh@greenroute.in', '+91 98401 99887', 'Driver@123', 'TRANSPORT_DRIVER', 'comp-greenroute', 'GreenRoute Logistics Pvt Ltd'],
  ['DRV002', 'Suresh Babu (Driver)', 'suresh@greenroute.in', '+91 94440 88776', 'Driver@123', 'TRANSPORT_DRIVER', 'comp-greenroute', 'GreenRoute Logistics Pvt Ltd']
];
const publicUser = (user) => { const result = user.toObject ? user.toObject() : { ...user }; delete result.password; return result; };
const makeToken = (user) => jwt.sign({ id: user.id, name: user.name, role: user.role, driverId: user.driverId || null, assignedVehicleNumber: user.assignedVehicleNumber || null, transportCompanyId: user.transportCompanyId || null }, jwtSecret, { expiresIn: '7d' });
const normalizeIdentifier = (value) => String(value || '').trim().toLowerCase();
const roleFilter = (collection, role, authUser) => {
  if (role === 'ADMIN') return {};
  if (collection === 'products' && role === 'BUYER') return {};
  if (collection === 'partners' && ['SELLER', 'BUYER'].includes(role)) return {};
  if (collection === 'environmentalImpact' && role !== 'TRANSPORT_DRIVER') return {};
  if (role === 'SELLER') return { $or: [{ sellerId: authUser.id }, { 'value.sellerId': authUser.id }, { 'value.sellerName': authUser.name }] };
  if (role === 'BUYER') return { $or: [{ buyerId: authUser.id }, { 'value.buyerId': authUser.id }, { 'value.buyerName': authUser.name }] };
  if (role === 'TRANSPORT_MANAGER') return { $or: [{ transportCompanyId: authUser.transportCompanyId }, { companyId: authUser.transportCompanyId }, { 'value.transportCompanyId': authUser.transportCompanyId }] };
  if (role === 'TRANSPORT_DRIVER') return { $or: [{ driverId: authUser.driverId || authUser.id }, { 'value.driverId': authUser.driverId || authUser.id }, { 'value.vehicleNumber': authUser.assignedVehicleNumber }] };
  return { _id: null };
};
const recordMetadata = (value) => ({
  sellerId: value.sellerId, buyerId: value.buyerId, transportCompanyId: value.transportCompanyId,
  driverId: value.driverId, targetRole: value.targetRole, companyId: value.companyId
});
const auth = (req, res, next) => {
  const header = req.headers.authorization || '';
  try { req.auth = jwt.verify(header.startsWith('Bearer ') ? header.slice(7) : '', jwtSecret); next(); }
  catch { res.status(401).json({ success: false, error: 'Authentication required' }); }
};

app.get('/api/health', (req, res) => res.json({ success: true, service: 'eco-mart-backend', database: mongoose.connection.readyState === 1 }));
app.post('/api/ai/calculate-price', auth, (req, res) => {
  try {
    const pricing = calculateWastePrice(req.body.category, req.body.weightKg);
    res.json({ success: true, ...pricing });
  } catch {
    res.status(400).json({ success: false, error: 'Enter a valid category and weight.' });
  }
});
app.post('/api/ai/scan-waste', auth, (req, res, next) => {
  imageUpload.single('image')(req, res, async (uploadError) => {
    if (uploadError) {
      if (uploadError instanceof multer.MulterError && uploadError.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ success: false, error: 'Image must be 10 MB or smaller' });
      return res.status(400).json({ success: false, error: 'Please upload a JPG, PNG, or WebP image' });
    }
    if (!req.file) return res.status(400).json({ success: false, error: 'No image selected' });
    try {
      const analysis = await analyzeWasteImage(req.file.path, req.file.mimetype);
      const pricing = analysis.estimatedWeightKg === null ? { category: analysis.category, pricePerKg: null, estimatedPrice: null } : calculateWastePrice(analysis.category, analysis.estimatedWeightKg);
      res.json({ success: true, scan: { ...analysis, ...pricing, imageUrl: `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`, aiDetected: true } });
    } catch (error) {
      await fs.promises.unlink(req.file.path).catch(() => {});
      if (error.code === 'AI_INVALID_RESPONSE') return res.status(502).json({ success: false, error: error.message });
      if (error.code === 'AI_UNAVAILABLE') return res.status(500).json({ success: false, error: error.message });
      next(error);
    }
  });
});
app.post('/api/auth/register', async (req, res, next) => {
  try {
    const { role, email, phone, password } = req.body;
    if (!role || !password || (!email && !phone)) return res.status(400).json({ success: false, error: 'Role, password and email or phone are required' });
    const exists = await User.findOne({ $or: [{ email: normalizeIdentifier(email) }, { phone }] });
    if (exists) return res.status(409).json({ success: false, error: 'Account already exists' });
    const user = await User.create({ ...req.body, id: req.body.id || `user-${role.toLowerCase()}-${Date.now()}`, password: await bcrypt.hash(password, 12), role: role.toUpperCase() });
    res.status(201).json({ success: true, user: publicUser(user), token: makeToken(user) });
  } catch (error) { next(error); }
});
app.post('/api/auth/login', async (req, res, next) => {
  try {
    const identifier = normalizeIdentifier(req.body.identifier);
    const users = await User.find({});
    const user = users.find((candidate) => [candidate.email, candidate.transportId, candidate.driverId, candidate.id, candidate.phone?.replace(/\D/g, '')].some(value => normalizeIdentifier(value) === identifier));
    if (!user || !(await bcrypt.compare(String(req.body.password || ''), user.password))) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    if (req.body.expectedRole && user.role !== req.body.expectedRole.toUpperCase()) return res.status(403).json({ success: false, error: 'Role mismatch' });
    res.json({ success: true, user: publicUser(user), token: makeToken(user) });
  } catch (error) { next(error); }
});
app.get('/api/users', auth, async (req, res, next) => { try { res.json({ success: true, users: (await User.find({})).map(publicUser) }); } catch (error) { next(error); } });
app.put('/api/users/sync', auth, async (req, res, next) => {
  try {
    const users = Array.isArray(req.body.users) ? req.body.users : [];
    for (const item of users) {
      const update = { ...item };
      if (update.password && !update.password.startsWith('$2')) update.password = await bcrypt.hash(update.password, 12);
      await User.findOneAndUpdate({ id: item.id }, update, { upsert: true, new: true, setDefaultsOnInsert: true });
    }
    res.json({ success: true, count: users.length });
  } catch (error) { next(error); }
});
app.get('/api/data/:collection', auth, async (req, res, next) => {
  try {
    if (!collectionNames.includes(req.params.collection)) return res.status(404).json({ success: false, error: 'Unknown collection' });
    const Model = businessModels[req.params.collection];
    const records = await Model.find(roleFilter(req.params.collection, req.auth.role, req.auth));
    res.json({ success: true, data: req.params.collection === 'environmentalImpact' ? (records[0]?.value || {}) : records.map((record) => record.value) });
  } catch (error) { next(error); }
});
app.put('/api/data/:collection', auth, async (req, res, next) => {
  try {
    if (!collectionNames.includes(req.params.collection)) return res.status(404).json({ success: false, error: 'Unknown collection' });
    const Model = businessModels[req.params.collection];
    const values = req.params.collection === 'environmentalImpact' ? [req.body.data] : (Array.isArray(req.body.data) ? req.body.data : []);
    for (const value of values) {
      const externalId = value.id || `${req.params.collection}-singleton`;
      const metadata = recordMetadata(value);
      const allowed = req.auth.role === 'ADMIN' || Object.values(metadata).some((item) => item && [req.auth.id, req.auth.name, req.auth.transportCompanyId, req.auth.driverId].includes(item)) || [value.sellerName, value.buyerName, value.companyName, value.driverName].some((item) => item && [req.auth.name].includes(item));
      if (req.params.collection === 'partners' || req.params.collection === 'products' || req.auth.role === 'ADMIN' || allowed) {
        await Model.findOneAndUpdate({ externalId }, { externalId, value, ...metadata }, { upsert: true, new: true, setDefaultsOnInsert: true });
      }
    }
    res.json({ success: true, data: req.body.data });
  } catch (error) { next(error); }
});
app.use((error, req, res, next) => { console.error(error); res.status(500).json({ success: false, error: 'Server error' }); });

const start = async () => {
  await mongoose.connect(mongoUri);
  for (const [id, name, email, phone, password, role, transportCompanyId, companyName] of demoUsers) {
    await User.findOneAndUpdate({ id }, { id, name, email, phone, password: (await User.findOne({ id }))?.password || await bcrypt.hash(password, 12), role, transportId: role.startsWith('TRANSPORT') ? id : undefined, driverId: role === 'TRANSPORT_DRIVER' ? id : undefined, transportCompanyId, companyName }, { upsert: true, new: true });
  }
  app.listen(port, () => console.log(`Eco Mart backend listening on http://localhost:${port}`));
};
start().catch((error) => { console.error('Unable to start backend:', error.message); process.exit(1); });