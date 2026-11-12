import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

const passportLocalMongoosePlugin =
    passportLocalMongoose.default || passportLocalMongoose;

const userSchema = new mongoose.Schema(
    {
        displayName: {
            type: String,
            required: true,
            trim: true,
            minlength: 3
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        phone: {
            type: String,
            required: true,
            trim: true
        },

        profileImage: {
            type: String,
            default: ''
        },

        address: {
            type: String,
            required: true,
            trim: true
        },

        role: {
            type: String,
            enum: ['adopter', 'owner', 'admin'],
            default: 'adopter'
        }
    },
    {
        timestamps: true
    }
);

userSchema.plugin(passportLocalMongoosePlugin, {
    usernameField: 'email'
});

const User = mongoose.model('User', userSchema);

export default User;