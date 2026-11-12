import mongoose from 'mongoose';

const petSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },

    species: {
        type: String,
        required: true,
        enum: ['Dog', 'Cat', 'Bird', 'Rabbit', 'Other']
    },

    breed: {
        type: String,
        required: true
    },

    age: {
        type: Number,
        required: true,
        min: 0
    },

    gender: {
        type: String,
        enum: ['Male', 'Female', 'Unknown'],
        required: true
    },

    description: {
        type: String,
        required: true,
        maxlength: 2000
    },

    images: [{
        type: String
    }],

    location: {
        type: String,
        required: true
    },

    healthStatus: {
        type: String,
        default: 'Not specified'
    },

    vaccinationStatus: {
        type: Boolean,
        default: false
    },

    adoptionStatus: {
        type: String,
        enum: ['Available', 'Pending', 'Adopted'],
        default: 'Available'
    },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }

}, { timestamps: true });

const Pet = mongoose.model('Pet', petSchema);

export default Pet;