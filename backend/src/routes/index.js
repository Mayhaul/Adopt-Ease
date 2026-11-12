import express from 'express';
const router = express.Router();
import homeRoutes from './home.routes.js';
import listingRoutes from './listings.routes.js';
import userRoutes from './user.routes.js';




router.use('/', homeRoutes);
router.use('/listings', listingRoutes);
router.use('/user', userRoutes);

export default router;