import jwt from 'jsonwebtoken';
import fs from 'fs';
import 'dotenv/config';
import { Request, Response, NextFunction, DecodedValue } from '..';

const preLogin = (req: Request, res: Response, next: NextFunction) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.redirect('/login');
    const refreshToken = cookies.jwt;

    const pubkey = fs.readFileSync(process.env.public_key!, 'utf8');
    jwt.verify(refreshToken, pubkey, { algorithms: ['RS256'] }, (err, decoded: DecodedValue) => {
        if (err || !(decoded.userId) || !(decoded.username)) return res.redirect('/login');
        
        req.headers['userId'] = decoded.userId;
        req.headers['username'] = decoded.username;
        next();
    });
};

export default {
    preLogin
};
