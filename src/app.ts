import express from 'express';
import 'dotenv/config';
import verifyJWT from './middleware/verifyJWT.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

// Routes
import loginRoute from './routes/loginRoutes.js';
import registerRoute from './routes/registerRoutes.js';
import refreshRoute from './routes/refreshTokenRoutes.js';
import userRoute from './routes/userRoutes.js';

import postsApiRoute from './routes/api/posts.js'; // API Routes

const app = express();
const port = process.env.port;

app.listen(port, () => console.log('server listening on port ' + port));

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const corsOptions = {
    origin: process.env.swagger_host,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use('/login', loginRoute);
app.use('/register', registerRoute);
app.use('/refresh', refreshRoute);


app.use(verifyJWT);
app.use('/user', userRoute);
app.use('/api/posts', postsApiRoute);
