import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import ejsMate from 'ejs-mate';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import methodOverride from 'method-override';

import User from './models/user.model.js';
import routes from './routes/index.js';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// VIEW ENGINE

app.engine('ejs', ejsMate);

app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));

// MIDDLEWARE

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use(methodOverride('_method'));

// SESSION CONFIGURATION

if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is required');
}

if (
    process.env.NODE_ENV === 'production' &&
    !process.env.SESSION_SECRET
) {
    throw new Error('SESSION_SECRET is required in production');
}

if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

const sessionOptions = {
    name: 'adoptease.sid',

    secret:
        process.env.SESSION_SECRET ||
        'development-only-secret-change-this',

    resave: false,

    saveUninitialized: false,

    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        collectionName: 'sessions',
        ttl: 7 * 24 * 60 * 60
    }),

    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000
    }
};

app.use(session(sessionOptions));

// PASSPORT

app.use(passport.initialize());

app.use(passport.session());

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());

passport.deserializeUser(User.deserializeUser());

// GLOBAL EJS VARIABLES

app.use((req, res, next) => {
    res.locals.currentUser = req.user || null;

    res.locals.title = 'Adopt-Ease';

    next();
});

// ROUTES

app.use('/', routes);

// 404 HANDLER

app.use((req, res) => {
    res.status(404).render('error.ejs', {
        status: 404,
        message: 'Page not found'
    });
});

// GLOBAL ERROR HANDLER

app.use((err, req, res, next) => {
    console.error(err);

    if (res.headersSent) {
        return next(err);
    }

    const status =
        err.status ||
        (err.name === 'ValidationError' ||
        err.name === 'CastError'
            ? 400
            : 500);

    res.status(status).render('error.ejs', {
        status,
        message:
            process.env.NODE_ENV === 'production'
                ? 'Something went wrong'
                : err.message
    });
});

export { app };