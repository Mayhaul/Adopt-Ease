import mongoose from 'mongoose';

const adoptionApplicationSchema = new mongoose.Schema({

    pet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pet',
        required: true
    },

    applicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    reason: {
        type: String,
        required: true,
        maxlength: 1000
    },

    livingSituation: {
        type: String,
        enum: ['Apartment', 'Independent House', 'Farmhouse', 'Other'],
        required: true
    },

    experience: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    }

}, { timestamps: true });

// Prevent the same user from applying multiple times
// for the same pet.
adoptionApplicationSchema.index(
    { pet: 1, applicant: 1 },
    { unique: true }
);

const AdoptionApplication = mongoose.model(
    'AdoptionApplication',
    adoptionApplicationSchema
);

export default AdoptionApplication;