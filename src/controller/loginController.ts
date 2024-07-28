import express from 'express';
import { findOne } from './databaseController/regist.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import fs from 'fs';
import { FindOneType } from '.';
import { Request, Response } from '..';

const app = express();

app.use(express.urlencoded({ extended: false }));

const userLogin = async (req: Request, res: Response) => {
    try {
        if (!req.body.logUsername || !req.body.logPassword) {
            return res.sendStatus(400);
        }

        const user = await findOne(req.body.logUsername) as FindOneType[] | undefined;

        if (user && user[0]) {
            
            const result = await bcrypt.compare(req.body.logPassword, user[0].password);
    
            if (result === true) {

                const privkey = fs.readFileSync(`${process.env.private_key}`, 'utf8');
    
                const refreshToken = jwt.sign({ userId: user[0].userId, username: user[0].username }
                    , privkey
                    , {
                        algorithm: 'RS256',
                        expiresIn: '7d'
                    });
    
                res.set('Authorization', `Bearer ${refreshToken}`);
                return res.sendStatus(200);
            }
        }
        
        return res.sendStatus(401);
    } catch (e) {
        console.log('userLogin error', e);
        return res.sendStatus(500);
    }
};

export default {
    userLogin
};
