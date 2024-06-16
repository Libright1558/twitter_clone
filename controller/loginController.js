import express from 'express';
import { findOne } from './databaseController/regist.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import fs from 'fs';
const app = express();

app.use(express.urlencoded({ extended: false }));

const renderLoginPage = (req, res) => {
    res.status(200).render('login');
};

const userLogin = async (req, res) => {
    const payload = req.body;
    try {
        if (!req.body.logUsername || !req.body.logPassword) {
            payload.errorMessage = 'Make sure each field has a valid value.';
            return res.status(400).render('login', payload);
        }

        const user = await findOne(req.body.logUsername);

        if (user[0] === null || user[0] === undefined) {
            payload.errorMessage = 'username or password incorrect.';
            return res.status(400).render('login', payload);
        }

        const result = await bcrypt.compare(req.body.logPassword, user[0].password);

        if (result === true) {
            const privkey = fs.readFileSync(process.env.private_key, 'utf8');

            const accessToken = jwt.sign({ userId: user[0].userId, username: user[0].username }
                , privkey
                , {
                    algorithm: 'RS256',
                    expiresIn: '30s'
                });

            const refreshToken = jwt.sign({ userId: user[0].userId, username: user[0].username }
                , privkey
                , {
                    algorithm: 'RS256',
                    expiresIn: '1d'
                });

            res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: true, maxAge: 24 * 60 * 60 * 1000 });
            res.cookie('access', accessToken, { httpOnly: true, sameSite: true, maxAge: 15 * 60 * 1000 });
            return res.redirect('/');
        }
        payload.errorMessage = 'username or password incorrect.';
        return res.status(200).render('login', payload);
    } catch (e) {
        console.log('userLogin error', e);
        payload.errorMessage = 'userLogin error.';
        return res.status(500).render('login', payload);
    }
};

export default {
    renderLoginPage,
    userLogin
};
