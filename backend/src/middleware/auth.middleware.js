import Pet from '../models/pet.model.js';

// Check if user is logged in
export const isLoggedIn = (req, res, next) => {

    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        return res.redirect('/login');
    }

    next();
};


// Check if logged-in user owns the listing
export const isOwner = async (req, res, next) => {

    try {

        const pet = await Pet.findById(req.params.id);

        if (!pet) {
            return res.status(404).send('Pet listing not found');
        }

        if (!pet.owner.equals(req.user._id)) {
            return res.status(403).send('You are not authorized to perform this action');
        }

        next();

    } catch (error) {

        console.error(error);
        next(error);

    }

};
