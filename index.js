// index.js

// Required external modules

const express = require("express");
const path = require("path");

const expressSession = require("express-session");
const passport = require("passport");
const Auth0Strategy = require("passport-auth0");

require("dotenv").config();

const authRouter = require("./auth");

// App Variables

const app = express();
const port = process.env.PORT || "8000";

// Session Configuration

const session = {
    secret: process.env.SESSION_SECRET,
    cookie: {},
    resave: false,
    saveUninitialized: false
};

if (app.get("env") === "production") {
    // Serve secure cookies
    session.cookie.secure = true;
}

// PassPort Configuration

const strategy = new Auth0Strategy(
    {
        domain: "dev-27175hih.us.auth0.com",
        clientID: "0w5LJWUILtqLnGKOXSJA1OugwazbDvny",
        clientSecret: "940e0206f1417f33f1cc64e33f717f55df6ce89b2feb3a8d640986a295f5c191",
        callbackURL: "http://localhost:3000/callback/"
    },
    function(accessToken, refreshToken, extraParams, profile, done) {
        // Access tokens are used to authorize
        // users to an API
        //  accessToken is the token to call the Auth0 API
        // extraParams.id_token has the JSON Web Token
        // profile has all the information from the user
        return done(null, profile);
    }
);

// App Configuration

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));

app.use(expressSession(session));

passport.use(strategy);
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Create custom middleware with Express

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
});

// Routes Definitions

const secured = (req, res, next) => {
    if (req.user) {
        return next();
    }
    req.session.returnTo = req.originalUrl;
    res.redirect("/login");
}

// Defines routes

app.get("/", authRouter);

app.get("/user", secured, (req, res, next) => {
    const { _raw, _json, ...userProfile } = req.user;
    res.render("user", {
        title: "Profile",
        userProfile: userProfile
    });
});

// Server Activation

app.listen(port, () => {
    console.log(`Listening to server on port: ${port}`);
});