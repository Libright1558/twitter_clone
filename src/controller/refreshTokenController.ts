import jwt from 'jsonwebtoken';
import fs from 'fs';
import 'dotenv/config';
import { Request, Response, DecodedValue } from '..';

const handleRefreshToken = async (req: Request, res: Response) => {
    const bearerHeader = req.headers['Authorization'] as string;
    const token = bearerHeader?.split(' ');
    if (!token) return res.sendStatus(401);
    const refreshToken = token[1];

    const pubkey = fs.readFileSync(`${process.env.public_key}`, 'utf8');
    jwt.verify(refreshToken, pubkey, { algorithms: ['RS256'] }, (err, decoded: DecodedValue) => {
        if (err) return res.sendStatus(403);

        const prikey = fs.readFileSync(`${process.env.private_key}`, 'utf8');
        if (decoded) {
            const userId = decoded.userId;
            const username = decoded.username;
            const accessToken = jwt.sign(
                { userId, username },
                prikey,
                { algorithm: 'RS256', expiresIn: '60s' }
            );
            res.set('Authorization', `Bearer ${accessToken}`);
        }
        
        return res.status(200).end();
    });
};

export default {
    handleRefreshToken
};
