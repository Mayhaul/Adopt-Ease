import express from 'express';
import mongoose from 'mongoose';

import Pet from '../models/pet.model.js';
import AdoptionApplication from '../models/application.model.js';

import { isLoggedIn } from '../middleware/auth.middleware.js';

const router = express.Router();

// ADOPTION FORM

router.get('/new/:petId', isLoggedIn, async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.petId)) {
            return res.status(400).send('Invalid pet ID');
        }

        const pet = await Pet.findById(req.params.petId);

        if (!pet) {
            return res.status(404).send('Pet not found');
        }

        if (pet.owner.equals(req.user._id)) {
            return res.status(403).send(
                'You cannot adopt your own pet'
            );
        }

        if (pet.adoptionStatus !== 'Available') {
            return res.status(400).send(
                'This pet is not available for adoption'
            );
        }

        res.render('adoptions/new.ejs', { pet });
    } catch (error) {
        next(error);
    }
});

// SUBMIT APPLICATION

router.post('/:petId', isLoggedIn, async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.petId)) {
            return res.status(400).send('Invalid pet ID');
        }

        const pet = await Pet.findById(req.params.petId);

        if (!pet) {
            return res.status(404).send('Pet not found');
        }

        if (pet.owner.equals(req.user._id)) {
            return res.status(403).send(
                'You cannot adopt your own pet'
            );
        }

        if (pet.adoptionStatus !== 'Available') {
            return res.status(400).send(
                'Pet is not available'
            );
        }

        const {
            reason,
            livingSituation,
            experience
        } = req.body;

        const application = new AdoptionApplication({
            pet: pet._id,
            applicant: req.user._id,
            reason,
            livingSituation,
            experience
        });

        await application.save();

        res.redirect('/adoptions/my-applications');
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).send(
                'You have already applied for this pet'
            );
        }

        next(error);
    }
});

// MY APPLICATIONS

router.get('/my-applications', isLoggedIn, async (req, res, next) => {
    try {
        const applications = await AdoptionApplication.find({
            applicant: req.user._id
        })
            .populate('pet')
            .sort({ createdAt: -1 });

        res.render('adoptions/applications.ejs', {
            applications
        });
    } catch (error) {
        next(error);
    }
});

// RECEIVED APPLICATIONS

router.get('/received', isLoggedIn, async (req, res, next) => {
    try {
        const pets = await Pet.find({
            owner: req.user._id
        }).select('_id');

        const petIds = pets.map((pet) => pet._id);

        const applications = await AdoptionApplication.find({
            pet: { $in: petIds }
        })
            .populate('pet')
            .populate(
                'applicant',
                'displayName email phone'
            )
            .sort({ createdAt: -1 });

        res.render('adoptions/received.ejs', {
            applications
        });
    } catch (error) {
        next(error);
    }
});

// APPROVE APPLICATION

router.put('/:id/approve', isLoggedIn, async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).send('Invalid application ID');
        }

        const application = await AdoptionApplication.findById(
            req.params.id
        ).populate('pet');

        if (!application || !application.pet) {
            return res.status(404).send(
                'Application or pet not found'
            );
        }

        if (!application.pet.owner.equals(req.user._id)) {
            return res.status(403).send('Unauthorized');
        }

        if (application.status !== 'Pending') {
            return res.status(400).send(
                'Application has already been processed'
            );
        }

        // Atomic status transition prevents competing approvals
        // from both claiming the same available pet.

        const updatedPet = await Pet.findOneAndUpdate(
            {
                _id: application.pet._id,
                adoptionStatus: 'Available'
            },
            {
                $set: {
                    adoptionStatus: 'Adopted'
                }
            },
            {
                new: true
            }
        );

        if (!updatedPet) {
            return res.status(409).send(
                'This pet is no longer available'
            );
        }

        await AdoptionApplication.updateOne(
            {
                _id: application._id,
                status: 'Pending'
            },
            {
                $set: {
                    status: 'Approved'
                }
            }
        );

        await AdoptionApplication.updateMany(
            {
                pet: application.pet._id,
                _id: { $ne: application._id },
                status: 'Pending'
            },
            {
                $set: {
                    status: 'Rejected'
                }
            }
        );

        res.redirect('/adoptions/received');
    } catch (error) {
        next(error);
    }
});

// REJECT APPLICATION

router.put('/:id/reject', isLoggedIn, async (req, res, next) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).send('Invalid application ID');
        }

        const application = await AdoptionApplication.findById(
            req.params.id
        ).populate('pet');

        if (!application || !application.pet) {
            return res.status(404).send(
                'Application or pet not found'
            );
        }

        if (!application.pet.owner.equals(req.user._id)) {
            return res.status(403).send('Unauthorized');
        }

        if (application.status !== 'Pending') {
            return res.status(400).send(
                'Application has already been processed'
            );
        }

        await AdoptionApplication.updateOne(
            {
                _id: application._id,
                status: 'Pending'
            },
            {
                $set: {
                    status: 'Rejected'
                }
            }
        );

        res.redirect('/adoptions/received');
    } catch (error) {
        next(error);
    }
});

export default router;