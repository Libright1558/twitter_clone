const express = require('express');
const app = express();
const middleware = require('./middleware');
const path = require('path');
const session = require('express-session');
require('dotenv').config();
const port = process.env.port;



const server = app.listen(port, () => console.log("server listening on port " + port));

app.set("view engine", "pug");
app.set("views", "views");

app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, "public")));

// Use the session middleware
app.use(session({
    secret: require('crypto').randomBytes(64).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie:{
        httpOnly: true,
        sameSite: 'lax',
    }
}));

//Routes
const loginRoute = require('./routes/loginRoutes');
const registerRoute = require('./routes/registerRoutes');
const logoutRoute = require('./routes/logoutRoutes');

//API Routes
const postsApiRoute = require('./routes/api/posts');

app.use("/login", loginRoute);
app.use("/register", registerRoute);
app.use("/logout", logoutRoute);

app.use("/api/posts", postsApiRoute);

app.get("/", middleware.requireLogin, (req, res, next) => {

    var payload = {
        pageTitle: "Home",
        UserloggedIn: req.session.user,
        UserloggedInJs: JSON.stringify(req.session.user),
    }
    res.status(200).render("home", payload);
})