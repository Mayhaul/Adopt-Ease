import express from 'express';
import mongoose from 'mongoose';

import Pet from '../models/pet.model.js';
import AdoptionApplication from '../models/application.model.js';

import {
    isLoggedIn,
    isOwner
} from '../middleware/auth.middleware.js';

const router = express.Router();

// ALLOWED PET FIELDS

const getPetData = (body) => {
    const {
        name,
        species,
        breed,
        age,
        gender,
        description,
        location,
        healthStatus,
        vaccinationStatus,
        image
    } = body;

    return {
        name,
        species,
        breed,
        age,
        gender,
        description,
        location,
        healthStatus,
        vaccinationStatus: vaccinationStatus === 'true',

        images:
            typeof image === 'string' && image.trim()
                ? [image.trim()]
                : []
    };
};

// ESCAPE REGEX SPECIAL CHARACTERS

const escapeRegex = (text) => {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// ALL AVAILABLE LISTINGS

router.get('/', async (req, res, next) => {
    try {
        const search =
            typeof req.query.search === 'string'
                ? req.query.search.trim().slice(0, 100)
                : '';

        const species =
            typeof req.query.species === 'string'
                ? req.query.species
                : '';

        const filter = {
            adoptionStatus: 'Available'
        };

        const validSpecies = [
            'Dog',
            'Cat',
            'Bird',
            'Rabbit',
            'Other'
        ];

        if (species && validSpecies.includes(species)) {
            filter.species = species;
        }

        if (search) {
            const safeSearch = escapeRegex(search);

            filter.$or = [
                {
                    name: {
                        $regex: safeSearch,
                        $options: 'i'
                    }
                },
                {
                    breed: {
                        $regex: safeSearch,
                        $options: 'i'
                    }
                },
                {
                    location: {
                        $regex: safeSearch,
                        $options: 'i'
                    }
                }
            ];
        }

        const listings = await Pet.find(filter)
            .sort({ createdAt: -1 });

        res.render('listings.ejs', {
            listings,
            search,
            species
        });
    } catch (error) {
        next(error);
    }
});

// MY LISTINGS

router.get('/my-listings', isLoggedIn, async (req, res, next) => {
    try {
        const listings = await Pet.find({
            owner: req.user._id
        }).sort({ createdAt: -1 });

        res.render('listings/my-listings.ejs', {
            listings
        });
    } catch (error) {
        next(error);
    }
});

// NEW LISTING FORM

router.get('/new', isLoggedIn, (req, res) => {
    res.render('listings/new.ejs');
});

// CREATE LISTING

router.post('/', isLoggedIn, async (req, res, next) => {
    try {
        const petData = getPetData(req.body);

        const pet = new Pet({
            ...petData,
            owner: req.user._id
        });

        await pet.save();

        res.redirect(`/listings/${pet._id}`);
    } catch (error) {
        next(error);
    }
});

// VIEW SINGLE LISTING

router.get('/:id', async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).send('Invalid listing ID');
        }

        const listing = await Pet.findById(req.params.id)
            .populate('owner', 'displayName email phone');

        if (!listing) {
            return res.status(404).send('Listing not found');
        }

        res.render('listings/show.ejs', {
            listing
        });
    } catch (error) {
        next(error);
    }
});

// EDIT FORM

router.get(
    '/:id/edit',
    isLoggedIn,
    isOwner,
    (req, res) => {
        res.render('listings/edit.ejs', {
            listing: res.locals.pet
        });
    }
);

// UPDATE LISTING

router.put(
    '/:id',
    isLoggedIn,
    isOwner,
    async (req, res, next) => {
        try {
            const petData = getPetData(req.body);

            await Pet.findByIdAndUpdate(
                req.params.id,
                { $set: petData },
                {
                    runValidators: true,
                    new: true
                }
            );

            res.redirect(`/listings/${req.params.id}`);
        } catch (error) {
            next(error);
        }
    }
);

// DELETE LISTING

router.delete(
    '/:id',
    isLoggedIn,
    isOwner,
    async (req, res, next) => {
        try {
            await AdoptionApplication.deleteMany({
                pet: req.params.id
            });

            await Pet.findByIdAndDelete(req.params.id);

            res.redirect('/listings/my-listings');
        } catch (error) {
            next(error);
        }
    }
);

export default router;