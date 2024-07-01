import express from 'express';
import bcrypt from 'bcrypt';
import { findDup, initRegist } from './databaseController/regist.js';
import { FindDupType } from '.';
import { ExpressReq, ExpressRes } from '..';
const app = express();

app.use(express.urlencoded({ extended: false }));

const renderRegister = (req: ExpressReq, res: ExpressRes) => {
    res.status(200).render('register');
};

const registAccount = async (req: ExpressReq, res: ExpressRes) => {
    const firstName = req.body.firstName.trim();
    const lastName = req.body.lastName.trim();
    const username = req.body.username.trim();
    const email = req.body.email.trim();
    let password = req.body.password;

    const payload = req.body;

    if (firstName && lastName && username && email && password) {

        let user;
        const param = [username, email];

        try {
            user = await findDup(param) as FindDupType[] | undefined;
        } catch (e) {
            console.log(e);
            payload.errorMessage = 'Something went worng.';
            res.status(200).render('register', payload);
        }

        if (user && user[0] == null) {
            // No user found
            try {
                password = await bcrypt.hash(password, 12); // Hashing the password.
                const defaultProfile = '/images/UserProfiles/ProfilePic.jpeg';
                const userData = [firstName, lastName, username, email, password, defaultProfile];
                await initRegist(userData);// Writing user's data into the database.

                return res.redirect('/login');
            } catch (e) {
                console.log(e);
                payload.errorMessage = 'Something went worng.';
                res.status(200).render('register', payload);
            }
        } else {
            // User found
            if (user && email === user[0].email) {
                payload.errorMessage = 'Email already in use.';
            } else {
                payload.errorMessage = 'username already in use.';
            }
            res.status(200).render('register', payload);
        }
    } else {
        payload.errorMessage = 'Make sure each field has a valid value.';
        res.status(200).render('register', payload);
    }
};

export default {
    renderRegister,
    registAccount
};
