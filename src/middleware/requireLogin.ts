import jwt from 'jsonwebtoken';
import fs from 'fs';
import 'dotenv/config';
import { ReqValue, ExpressRes, ExpressNext, DecodedValue } from '..';

const preLogin = (req: ReqValue, res: ExpressRes, next: ExpressNext) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.redirect('/login');
    const refreshToken = cookies.jwt;

    const pubkey = fs.readFileSync(process.env.public_key!, 'utf8');
    jwt.verify(refreshToken, pubkey, { algorithms: ['RS256'] }, (err, decoded: DecodedValue) => {
        if (err || !(decoded.userId) || !(decoded.username)) return res.redirect('/login');
        req.userId = decoded.userId;
        req.username = decoded.username;
        next();
    });
};

export default {
    preLogin
};
