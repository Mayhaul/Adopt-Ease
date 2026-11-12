import express from 'express';
import passport from 'passport';

import User from '../models/user.model.js';
import { isLoggedIn } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/register', (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/user/profile');
    }

    res.render('users/register.ejs');
});

router.post('/register', async (req, res, next) => {
    try {
        const { username, email, password, phone, address } = req.body;

        const displayName = typeof username === 'string' ? username.trim() : '';
        const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
        const normalizedPhone = typeof phone === 'string' ? phone.trim() : '';
        const normalizedAddress = typeof address === 'string' ? address.trim() : '';

        if (!displayName || !normalizedEmail || !password || !normalizedPhone || !normalizedAddress) {
            return res.status(400).send('All fields are required');
        }

        if (displayName.length < 3) {
            return res.status(400).send('Name must contain at least 3 characters');
        }

        if (password.length < 8) {
            return res.status(400).send('Password must contain at least 8 characters');
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return res.status(400).send('Enter a valid email address');
        }

        if (!/^[+\d()\s-]{7,20}$/.test(normalizedPhone)) {
            return res.status(400).send('Enter a valid phone number');
        }

        const newUser = new User({
            displayName,
            email: normalizedEmail,
            phone: normalizedPhone,
            address: normalizedAddress
        });

        const registeredUser = await User.register(newUser, password);

        req.login(registeredUser, (error) => {
            if (error) return next(error);
            res.redirect('/user/profile');
        });
    } catch (error) {
        if (error.name === 'UserExistsError' || error.code === 11000) {
            return res.status(409).send('An account with this email already exists');
        }
        next(error);
    }
});

router.get('/login', (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/user/profile');
    }

    res.render('users/login.ejs');
});

router.post(
    '/login',
    passport.authenticate('local', {
        failureRedirect: '/user/login'
    }),
    (req, res) => {
        const redirectUrl = req.session.returnTo || '/user/profile';
        delete req.session.returnTo;
        res.redirect(redirectUrl);
    }
);

router.get('/profile', isLoggedIn, (req, res) => {
    res.render('users/profile.ejs', { user: req.user });
});

router.post('/logout', isLoggedIn, (req, res, next) => {
    req.logout((error) => {
        if (error) return next(error);

        req.session.destroy((destroyError) => {
            if (destroyError) return next(destroyError);
            res.clearCookie('adoptease.sid');
            res.redirect('/');
        });
    });
});

export default router;
