import express from 'express';
const app = express();
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import 'dotenv/config';
import verifyJWT from "./middleware/verifyJWT.js";
import cookieParser from 'cookie-parser';
const port = process.env.port;

const server = app.listen(port, () => console.log("server listening on port " + port));

app.set("view engine", "pug");
app.set("views", "views");

app.use(express.urlencoded({extended: false}));
app.use(express.static(join(__dirname, "public")));
app.use(cookieParser());


//Routes
import loginRoute from './routes/loginRoutes.js';
import registerRoute from './routes/registerRoutes.js';
import logoutRoute from './routes/logoutRoutes.js';
import refreshRoute from './routes/refreshTokenRoutes.js';
import root from './routes/root.js';


import postsApiRoute from './routes/api/posts.js'; //API Routes

app.use("/login", loginRoute);
app.use("/register", registerRoute);
app.use("/logout", logoutRoute);
app.use("/refresh", refreshRoute);
app.use("/", root);

app.use(verifyJWT);
app.use("/api/posts", postsApiRoute);