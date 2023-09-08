import jwt from "jsonwebtoken";
import fs from 'fs';
import 'dotenv/config';

const preLogin = (req, res, next) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.redirect("/login");
    const refreshToken = cookies.jwt;

    const pubkey = fs.readFileSync(process.env.public_key, 'utf8');
    jwt.verify(refreshToken, pubkey, { algorithms: ['RS256'] }, (err, decoded) => {
        if (err || !(decoded.username)) return res.redirect("/login");
        req.username = decoded.username;
        next();
    });
}

export default {
    preLogin,
}