import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

const passportLocalMongoosePlugin =
    passportLocalMongoose.default || passportLocalMongoose;
const userSchema = new mongoose.Schema({

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    phone: {
        type: String,
        required: true
    },

    profileImage: {
        type: String,
        default: ''
    },

    address: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: ['adopter', 'owner', 'admin'],
        default: 'adopter'
    }

}, { timestamps: true });

// Passport Local Mongoose plugin
userSchema.plugin(passportLocalMongoosePlugin, {
    usernameField: 'email'
});

const User = mongoose.model('User', userSchema);

export default User;
