import mongoose from 'mongoose';
import Pet from '../models/pet.model.js';

export const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        return res.redirect('/user/login');
    }

    next();
};

export const isOwner = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).send('Invalid listing ID');
        }

        const pet = await Pet.findById(id);

        if (!pet) {
            return res.status(404).send('Pet not found');
        }

        if (!pet.owner.equals(req.user._id)) {
            return res.status(403).send('Unauthorized');
        }

        res.locals.pet = pet;
        next();
    } catch (error) {
        next(error);
    }
};
