import express from 'express';
import bcrypt from 'bcrypt';
import { findDup, initRegist } from './databaseController/regist.js';
import { FindDupType } from '.';
import { Request, Response } from '..';
const app = express();

app.use(express.urlencoded({ extended: false }));

const registAccount = async (req: Request, res: Response) => {
    try {
        const firstName = req.body.firstName.trim();
        const lastName = req.body.lastName.trim();
        const username = req.body.username.trim();
        const email = req.body.email.trim();
        let password = req.body.password;

        if (firstName && lastName && username && email && password) {
            let user;
            const param = [username, email];

            user = await findDup(param) as FindDupType[] | undefined;
            
            if (user && user[0] == null) {
                // No user found
                password = await bcrypt.hash(password, 12); // Hashing the password.
                const defaultProfile = '/images/UserProfiles/ProfilePic.jpeg';
                const userData = [firstName, lastName, username, email, password, defaultProfile];
                await initRegist(userData); // Writing user's data into the database.

                return res.sendStatus(200);
            } 
            // User found
            res.sendStatus(409);
        } else {
            res.sendStatus(400);
        }
    } catch (e) {
        console.log(e);
        res.sendStatus(500);
    }
};

export default {
    registAccount
};
