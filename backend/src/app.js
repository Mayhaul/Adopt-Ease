import express from 'express';
const app = express();
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes/index.js';
import ejsMate from 'ejs-mate';
import passport from 'passport';
import LocalStrategy from 'passport-local'
import session from 'express-session'
import User from './models/user.model.js';
import methodOverride from 'method-override';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));


app.use(methodOverride('_method'));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));
// ---------------- MIDDLEWARES ----------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// create session.
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
}))

app.use(passport.initialize());

app.use(passport.session());

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ejs cannot read req body directly but it can read local store vars.
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});

app.use('/',routes);

export  {app};