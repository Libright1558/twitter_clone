import jwt from 'jsonwebtoken';
import 'dotenv/config';
import fs from 'fs';

const verifyJWT = (req, res, next) => {
    const cookies = req.cookies;
    if (!cookies?.access) return res.sendStatus(401);
    const token = cookies.access;

    const pubkey = fs.readFileSync(process.env.public_key, 'utf8');
    jwt.verify(token, pubkey, { algorithms: ['RS256'] }, (err, decoded) => {
        if (err && err.message === 'jwt expired') {
            return res.status(403).send(err);// token expired
        }

        if (err || !(decoded.userId) || !(decoded.username)) {
            return res.sendStatus(403);// invalid token
        }

        req.userId = decoded.userId;
        req.username = decoded.username;
        next();
    });
};

export default verifyJWT;
