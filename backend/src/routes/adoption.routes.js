import express from 'express';
import mongoose from 'mongoose';

import Pet from '../models/pet.model.js';
import AdoptionApplication from '../models/application.model.js';
import { isLoggedIn } from '../middleware/auth.middleware.js';

const router = express.Router();

const httpError = (status, message) =>
    Object.assign(new Error(message), { status });

const isObjectId = (value) => mongoose.isValidObjectId(value);

// ADOPTION FORM

router.get('/new/:petId', isLoggedIn, async (req, res, next) => {
    try {
        if (!isObjectId(req.params.petId)) {
            return res.status(400).send('Invalid pet ID');
        }

        const pet = await Pet.findById(req.params.petId);

        if (!pet) {
            return res.status(404).send('Pet not found');
        }

        if (pet.owner.equals(req.user._id)) {
            return res.status(403).send('You cannot adopt your own pet');
        }

        if (pet.adoptionStatus !== 'Available') {
            return res.status(400).send('This pet is not available for adoption');
        }

        res.render('adoptions/new.ejs', { pet });
    } catch (error) {
        next(error);
    }
});

// SUBMIT APPLICATION

router.post('/:petId', isLoggedIn, async (req, res, next) => {
    try {
        if (!isObjectId(req.params.petId)) {
            return res.status(400).send('Invalid pet ID');
        }

        const reason = typeof req.body.reason === 'string' ? req.body.reason.trim() : '';
        const experience = typeof req.body.experience === 'string' ? req.body.experience.trim() : '';
        const livingSituation = req.body.livingSituation;

        const allowedLivingSituations = [
            'Apartment',
            'Independent House',
            'Farmhouse',
            'Other'
        ];

        if (!reason || reason.length > 1000) {
            return res.status(400).send('Reason must contain between 1 and 1000 characters');
        }

        if (!experience || experience.length > 2000) {
            return res.status(400).send('Experience must contain between 1 and 2000 characters');
        }

        if (!allowedLivingSituations.includes(livingSituation)) {
            return res.status(400).send('Select a valid living situation');
        }

        const pet = await Pet.findById(req.params.petId);

        if (!pet) {
            return res.status(404).send('Pet not found');
        }

        if (pet.owner.equals(req.user._id)) {
            return res.status(403).send('You cannot adopt your own pet');
        }

        if (pet.adoptionStatus !== 'Available') {
            return res.status(409).send('Pet is not available');
        }

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
            return res.status(409).send('You have already applied for this pet');
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

        res.render('adoptions/applications.ejs', { applications });
    } catch (error) {
        next(error);
    }
});

// RECEIVED APPLICATIONS

router.get('/received', isLoggedIn, async (req, res, next) => {
    try {
        const pets = await Pet.find({ owner: req.user._id }).select('_id');
        const petIds = pets.map((pet) => pet._id);

        const applications = await AdoptionApplication.find({
            pet: { $in: petIds }
        })
            .populate('pet')
            .populate('applicant', 'displayName email phone')
            .sort({ createdAt: -1 });

        res.render('adoptions/received.ejs', { applications });
    } catch (error) {
        next(error);
    }
});

// APPROVE APPLICATION
// The pet status and all application status changes commit together.

router.put('/:id/approve', isLoggedIn, async (req, res, next) => {
    if (!isObjectId(req.params.id)) {
        return res.status(400).send('Invalid application ID');
    }

    const session = await mongoose.startSession();

    try {
        await session.withTransaction(async () => {
            const application = await AdoptionApplication
                .findById(req.params.id)
                .session(session);

            if (!application) {
                throw httpError(404, 'Application not found');
            }

            if (application.status !== 'Pending') {
                throw httpError(409, 'Application has already been processed');
            }

            const pet = await Pet.findById(application.pet).session(session);

            if (!pet) {
                throw httpError(404, 'Pet not found');
            }

            if (!pet.owner.equals(req.user._id)) {
                throw httpError(403, 'You are not authorized to approve this application');
            }

            const updatedPet = await Pet.findOneAndUpdate(
                {
                    _id: pet._id,
                    owner: req.user._id,
                    adoptionStatus: 'Available'
                },
                { $set: { adoptionStatus: 'Adopted' } },
                { new: true, session }
            );

            if (!updatedPet) {
                throw httpError(409, 'This pet is no longer available');
            }

            const approved = await AdoptionApplication.updateOne(
                { _id: application._id, status: 'Pending' },
                { $set: { status: 'Approved' } },
                { session }
            );

            if (approved.modifiedCount !== 1) {
                throw httpError(409, 'Application was already processed');
            }

            await AdoptionApplication.updateMany(
                {
                    pet: pet._id,
                    _id: { $ne: application._id },
                    status: 'Pending'
                },
                { $set: { status: 'Rejected' } },
                { session }
            );
        });

        res.redirect('/adoptions/received');
    } catch (error) {
        next(error);
    } finally {
        await session.endSession();
    }
});

// REJECT APPLICATION

router.put('/:id/reject', isLoggedIn, async (req, res, next) => {
    try {
        if (!isObjectId(req.params.id)) {
            return res.status(400).send('Invalid application ID');
        }

        const application = await AdoptionApplication.findById(req.params.id);

        if (!application) {
            return res.status(404).send('Application not found');
        }

        const pet = await Pet.findById(application.pet);

        if (!pet) {
            return res.status(404).send('Pet not found');
        }

        if (!pet.owner.equals(req.user._id)) {
            return res.status(403).send('You are not authorized to reject this application');
        }

        const result = await AdoptionApplication.updateOne(
            { _id: application._id, status: 'Pending' },
            { $set: { status: 'Rejected' } }
        );

        if (result.modifiedCount !== 1) {
            return res.status(409).send('Application has already been processed');
        }

        res.redirect('/adoptions/received');
    } catch (error) {
        next(error);
    }
});

export default router;
