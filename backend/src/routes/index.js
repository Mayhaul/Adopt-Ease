import express from 'express';

import homeRoutes from './home.routes.js';
import listingRoutes from './listings.routes.js';
import userRoutes from './user.routes.js';
import adoptionRoutes from './adoption.routes.js';

const router = express.Router();

router.use('/', homeRoutes);
router.use('/user', userRoutes);
router.use('/listings', listingRoutes);
router.use('/adoptions', adoptionRoutes);

export default router;
