import { setUserExpNX } from '../redis/cache.js';
import { fetchPersonalData } from '../redis/get.js';
import { writePersonalData } from '../redis/write.js';
import { userInfo } from './databaseController/get.js';
import { Request, Response, PersonalDetail } from '..';

const intoTheHomePage = async (req: Request, res: Response) => {
    try {
        const userId = req.headers['userId'] as string;
        let personalData = await fetchPersonalData(userId) as PersonalDetail;

        if (!personalData || !personalData.username) {
            const response = await userInfo(userId);
            if (response) {
                personalData = response[0] as PersonalDetail;
            }
            
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
        return res.sendStatus(500);
    }
};

export default {
    intoTheHomePage
};
