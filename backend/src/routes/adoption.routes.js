// import express from 'express';

// import Pet from '../models/pet.model.js';
// import AdoptionApplication from '../models/adoptionApplication.model.js';

// import { isLoggedIn } from '../middleware/auth.middleware.js';

// const router = express.Router();

// // ADOPTION APPLICATION FORM
// router.get('/new/:petId', isLoggedIn, async (req, res) => {

//     const pet = await Pet.findById(req.params.petId);

//     if (!pet) {
//         return res.status(404).send('Pet not found');
//     }

//     if (pet.owner.equals(req.user._id)) {
//         return res.status(403).send('You cannot adopt your own listing');
//     }

//     if (pet.adoptionStatus !== 'Available') {
//         return res.status(400).send('Pet is not available');
//     }

//     res.render('adoptions/new.ejs', { pet });

// });

// // SUBMIT APPLICATION
// router.post('/:petId', isLoggedIn, async (req, res) => {

//     try {

//         const pet = await Pet.findById(req.params.petId);

//         if (!pet) {
//             return res.status(404).send('Pet not found');
//         }

//         if (pet.owner.equals(req.user._id)) {
//             return res.status(403).send('You cannot adopt your own listing');
//         }

//         if (pet.adoptionStatus !== 'Available') {
//             return res.status(400).send('Pet is not available');
//         }

//         const application = new AdoptionApplication({
//             pet: pet._id,
//             applicant: req.user._id,
//             reason: req.body.reason,
//             livingSituation: req.body.livingSituation,
//             experience: req.body.experience
//         });

//         await application.save();

//         res.redirect('/adoptions/my-applications');

//     } catch (error) {

//         if (error.code === 11000) {
//             return res.status(400).send('You have already applied for this pet');
//         }

//         console.error(error);
//         res.status(500).send('Application failed');

//     }

// });

// // MY APPLICATIONS
// router.get('/my-applications', isLoggedIn, async (req, res) => {

//     const applications = await AdoptionApplication.find({
//         applicant: req.user._id
//     }).populate('pet');

//     res.render('adoptions/applications.ejs', { applications });

// });

// // APPLICATIONS RECEIVED BY PET OWNER
// router.get('/received', isLoggedIn, async (req, res) => {

//     const pets = await Pet.find({
//         owner: req.user._id
//     }).select('_id');

//     const petIds = pets.map(pet => pet._id);

//     const applications = await AdoptionApplication.find({
//         pet: { $in: petIds }
//     })
//         .populate('pet')
//         .populate('applicant', 'username email phone');

//     res.render('adoptions/received.ejs', { applications });

// });

// // APPROVE APPLICATION
// router.put('/:id/approve', isLoggedIn, async (req, res) => {

//     try {

//         const application = await AdoptionApplication.findById(req.params.id)
//             .populate('pet');

//         if (!application) {
//             return res.status(404).send('Application not found');
//         }

//         if (!application.pet.owner.equals(req.user._id)) {
//             return res.status(403).send('Unauthorized');
//         }

//         if (application.status !== 'Pending' ||
//             application.pet.adoptionStatus !== 'Available') {
//             return res.status(400).send('Application cannot be approved');
//         }

//         application.status = 'Approved';
//         application.pet.adoptionStatus = 'Adopted';

//         await application.save();
//         await application.pet.save();

//         await AdoptionApplication.updateMany(
//             {
//                 pet: application.pet._id,
//                 _id: { $ne: application._id },
//                 status: 'Pending'
//             },
//             {
//                 $set: { status: 'Rejected' }
//             }
//         );

//         res.redirect('/adoptions/received');

//     } catch (error) {

//         console.error(error);
//         res.status(500).send('Could not approve application');

//     }

// });

// // REJECT APPLICATION
// router.put('/:id/reject', isLoggedIn, async (req, res) => {

//     try {

//         const application = await AdoptionApplication.findById(req.params.id)
//             .populate('pet');

//         if (!application) {
//             return res.status(404).send('Application not found');
//         }

//         if (!application.pet.owner.equals(req.user._id)) {
//             return res.status(403).send('Unauthorized');
//         }

//         if (application.status !== 'Pending') {
//             return res.status(400).send('Application is already processed');
//         }

//         application.status = 'Rejected';

//         await application.save();

//         res.redirect('/adoptions/received');

//     } catch (error) {

//         console.error(error);
//         res.status(500).send('Could not reject application');

//     }

// });

// export default router;