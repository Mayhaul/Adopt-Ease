import express from 'express';
import passport from 'passport';

import User from '../models/user.model.js';
import { isLoggedIn } from '../middleware/auth.middleware.js';

const router = express.Router();

// REGISTER PAGE

router.get('/register', (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/profile');
    }

    res.render('users/register.ejs');
});

// REGISTER USER

router.post('/register', async (req, res, next) => {
    try {
        const {
            username,
            email,
            password,
            phone,
            address
        } = req.body;

        if (!username || !email || !password || !phone || !address) {
            return res.status(400).send('All fields are required');
        }

        if (password.length < 8) {
            return res.status(400).send(
                'Password must contain at least 8 characters'
            );
        }

        const newUser = new User({
            displayName: username.trim(),
            email: email.trim().toLowerCase(),
            phone,
            address
        });

        const registeredUser = await User.register(
            newUser,
            password
        );

        req.login(registeredUser, (error) => {
            if (error) {
                return next(error);
            }

            res.redirect('/profile');
        });
    } catch (error) {
        next(error);
    }
});

// LOGIN PAGE

router.get('/login', (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/profile');
    }

    res.render('users/login.ejs');
});

// LOGIN USER

router.post(
    '/login',

    passport.authenticate('local', {
        failureRedirect: '/login'
    }),

    (req, res) => {
        const redirectUrl = req.session.returnTo || '/profile';

        delete req.session.returnTo;

        res.redirect(redirectUrl);
    }
);

// PROFILE

router.get('/profile', isLoggedIn, (req, res) => {
    res.render('users/profile.ejs', {
        user: req.user
    });
});

// LOGOUT

router.post('/logout', isLoggedIn, (req, res, next) => {
    req.logout((error) => {
        if (error) {
            return next(error);
        }

        req.session.destroy((error) => {
            if (error) {
                return next(error);
            }

            res.clearCookie('adoptease.sid');

            res.redirect('/');
        });
    });
});

export default router;