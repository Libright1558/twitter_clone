import sequelize from '../../database/sequelize.js';
import registString from '../../database/queryString/regist.js';
import { QueryTypes } from 'sequelize';

const initRegist = async (param) => {
    try {
        await sequelize.query(registString.regist, {
            bind: [param[0], param[1], param[2], param[3], param[4], param[5]],
            type: QueryTypes.INSERT
        });
    } catch (err) {
        console.log('initRegist error: ', err);
    }
};

const findDup = async (param) => {
    try {
        const result = await sequelize.query(registString.findDup, {
            bind: [param[0], param[1]],
            type: QueryTypes.SELECT
        });
        return result;
    } catch (err) {
        console.log('findDup error: ', err);
    }
};

const findOne = async (identity) => {
    try {
        const result = await sequelize.query(registString.findOne, {
            bind: [identity],
            type: QueryTypes.SELECT
        });
        return result;
    } catch (err) {
        console.log('findOne error: ', err);
    }
};

export {
    initRegist,
    findDup,
    findOne
};
