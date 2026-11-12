import express from 'express';
import Pet from '../models/pet.model.js';
import { isLoggedIn } from '../middleware/auth.middleware.js';

const router = express.Router();

// VIEW ALL LISTINGS
router.get('/', async (req, res) => {

    try {

        const { search, species } = req.query;

        let filter = {};

        filter.adoptionStatus = 'Available';

        if (species) {
            filter.species = species;
        }

        if (search) {

            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { breed: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } }
            ];

        }

        const listings = await Pet.find(filter)
            .populate('owner', 'username');

        res.render('listings.ejs', {
            listings,
            search,
            species
        });

    } catch (error) {

        console.error(error);
        res.status(500).send('Something went wrong');

    }

});

// NEW LISTING FORM
router.get('/new', isLoggedIn, (req, res) => {

    res.render('listings/new.ejs');

});

// CREATE LISTING
router.post('/', isLoggedIn, async (req, res) => {

    try {

        const newPet = new Pet(req.body);

        newPet.owner = req.user._id;

        await newPet.save();

        res.redirect('/listings');

    } catch (error) {

        console.error(error);
        res.status(500).send('Could not create listing');

    }

});

// VIEW SINGLE LISTING
router.get('/:id', async (req, res) => {

    try {

        const listing = await Pet.findById(req.params.id)
            .populate('owner', 'username email phone');

        if (!listing) {
            return res.status(404).send('Listing not found');
        }

        res.render('listings/show.ejs', { listing });

    } catch (error) {

        console.error(error);
        res.status(500).send('Something went wrong');

    }

});

// EDIT LISTING FORM
router.get('/:id/edit', isLoggedIn, async (req, res) => {

    try {

        const listing = await Pet.findById(req.params.id);

        if (!listing) {
            return res.status(404).send('Listing not found');
        }

        if (!listing.owner.equals(req.user._id)) {
            return res.status(403).send('Unauthorized');
        }

        res.render('listings/edit.ejs', { listing });

    } catch (error) {

        console.error(error);
        res.status(500).send('Something went wrong');

    }

});

// UPDATE LISTING
router.put('/:id', isLoggedIn, async (req, res) => {

    try {

        const listing = await Pet.findById(req.params.id);

        if (!listing) {
            return res.status(404).send('Listing not found');
        }

        if (!listing.owner.equals(req.user._id)) {
            return res.status(403).send('Unauthorized');
        }

        await Pet.findByIdAndUpdate(req.params.id, req.body, {
            runValidators: true
        });

        res.redirect(`/listings/${req.params.id}`);

    } catch (error) {

        console.error(error);
        res.status(500).send('Could not update listing');

    }

});

// DELETE LISTING
router.delete('/:id', isLoggedIn, async (req, res) => {

    try {

        const listing = await Pet.findById(req.params.id);

        if (!listing) {
            return res.status(404).send('Listing not found');
        }

        if (!listing.owner.equals(req.user._id)) {
            return res.status(403).send('Unauthorized');
        }

        await Pet.findByIdAndDelete(req.params.id);

        res.redirect('/listings');

    } catch (error) {

        console.error(error);
        res.status(500).send('Could not delete listing');

    }

});

export default router;