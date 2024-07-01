import jwt from 'jsonwebtoken';
import fs from 'fs';
import 'dotenv/config';
import { ExpressReq, ExpressRes, DecodedValue } from '..';

const handleRefreshToken = async (req: ExpressReq, res: ExpressRes) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt;

    const pubkey = fs.readFileSync(`${process.env.public_key}`, 'utf8');
    jwt.verify(refreshToken, pubkey, { algorithms: ['RS256'] }, (err, decoded) => {
        if (err) return res.sendStatus(403);

        const prikey = fs.readFileSync(`${process.env.private_key}`, 'utf8');
        if (decoded) {
            decoded = decoded as DecodedValue;
            const userId = decoded.userId;
            const username = decoded.username;
            const accessToken = jwt.sign(
                { userId, username },
                prikey,
                { algorithm: 'RS256', expiresIn: '300s' }
            );
            res.cookie('access', accessToken, { httpOnly: true, sameSite: true, maxAge: 15 * 60 * 1000 });
        }
        
        return res.end();
    });
};

export default {
    handleRefreshToken
};
