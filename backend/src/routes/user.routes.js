import express from 'express';
import passport from 'passport';
import User from '../models/user.model.js';

const router = express.Router();

// REGISTER FORM
router.get('/register', (req, res) => {
    res.render('users/register.ejs');
});

// REGISTER USER
router.post('/register', async (req, res, next) => {

    try {

        const { username, email, password, phone, address } = req.body;

        const newUser = new User({
            username,
            email,
            phone,
            address
        });

        const registeredUser = await User.register(newUser, password);

        req.login(registeredUser, (err) => {

            if (err) return next(err);

            res.redirect('/');

        });

    } catch (error) {

        console.error(error);
        res.redirect('/register');

    }

});

// LOGIN FORM
router.get('/login', (req, res) => {
    res.render('users/login.ejs');
});

// LOGIN
router.post('/login',
    passport.authenticate('local', {
        failureRedirect: '/login'
    }),
    (req, res) => {

        const redirectUrl = req.session.returnTo || '/';

        delete req.session.returnTo;

        res.redirect("/");

    }
);

router.get("/logout", (req, res)=>{
    res.redirect('/');
})

// LOGOUT
router.post('/logout', (req, res, next) => {

    req.logout((err) => {

        if (err) return next(err);

        res.redirect('/');

    });

});

export default router;