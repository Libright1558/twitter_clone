import sequelize from '../../database/sequelize.js'
import registString from '../../database/queryString/regist.js'
import { QueryTypes } from 'sequelize'

const initRegist = async (param) => {
  try {
    await sequelize.query(registString.regist, {
      bind: [param.firstname, param.lastname, param.username, param.email, param.password, param.profilepic],
      type: QueryTypes.INSERT
    })
  } catch (err) {
    console.log('initRegist error: ', err)
  }
}

export {
  initRegist
}
