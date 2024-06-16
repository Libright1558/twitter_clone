import { setUserExpNX } from '../redis/cache.js';
import { fetchPersonalData } from '../redis/get.js';
import { writePersonalData } from '../redis/write.js';
import { userInfo } from './databaseController/get.js';

const intoTheHomePage = async (req, res) => {
    try {
        const userId = req.userId;
        let personalData = await fetchPersonalData(userId);

        if (!personalData || !personalData.username) {
            const response = await userInfo(userId);
            personalData = response[0];

            await writePersonalData(userId, personalData);
            await setUserExpNX(900);
        }

        const payload = {
            pageTitle: 'Home',
            UserloggedIn: personalData,
            UserloggedInJs: JSON.stringify(personalData)
        };
        res.status(200).render('home', payload);
    } catch (err) {
        console.log('intoTheHomePage error', err);
    }
};

export default {
    intoTheHomePage
};
