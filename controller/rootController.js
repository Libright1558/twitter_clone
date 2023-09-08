import databaseController from "./databaseController.js";
import redis_cache from "../redis/cache.js";

const intoTheHomePage = async (req, res, next) => {
    try {
        const username = req.username;

        let personalData = await redis_cache.fetchPersonalData(username);
        if(!personalData) {
            const response = await databaseController.fetchPersonalData(username);
            personalData = response.rows[0];
            await redis_cache.writePersonalData(username, personalData);
            await redis_cache.setExpNX("personalData", 900);
        }
        else {
            personalData = JSON.parse(personalData);
        }
        
        const payload = {
            pageTitle: "Home",
            UserloggedIn: personalData,
            UserloggedInJs: JSON.stringify(personalData),
        }
        res.status(200).render("home", payload);
    
    }
    catch (err) {
        console.log("intoTheHomePage error", err);
    }
}

export default {
    intoTheHomePage,
}