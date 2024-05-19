import { Sequelize, DataTypes } from 'sequelize'
import 'dotenv/config'

const sequelize = new Sequelize({
  host: process.env.db_host,
  database: process.env.db_schema,
  port: process.env.db_port,
  user: process.env.db_user,
  dialect: process.env.db_type,
  logging: false,
  pool: {
    max: 2
  }
})

const testConnect = async () => {
  try {
    await sequelize.authenticate()
    console.log('Connection has been established successfully.')
  } catch (error) {
    console.log('Unable to connect to the database: ', error)
  }
}

testConnect()

const user = sequelize.define(
  'user_table',
  {
    userId: {
      type: DataTypes.UUID,
      defaultValue: sequelize.literal('uuid_generate_v4()'),
      allowNull: false,
      primaryKey: true
    },
    firstname: {
      type: DataTypes.STRING(50)
    },
    lastname: {
      type: DataTypes.STRING(50)
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING(50)
    },
    password: {
      type: DataTypes.TEXT
    },
    profilepic: {
      type: DataTypes.TEXT
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('NOW()')
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('NOW()')
    }
  },
  {
    freezeTableName: true
  }
)

const post = sequelize.define(
  'post_table',
  {
    postId: {
      type: DataTypes.UUID,
      defaultValue: sequelize.literal('uuid_generate_v4()'),
      allowNull: false,
      primaryKey: true
    },
    postby: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('NOW()')
    }
  },
  {
    timestamps: true,
    updatedAt: false,
    freezeTableName: true
  }
)

const like = sequelize.define(
  'like_table',
  {
    postId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('NOW()')
    }
  },
  {
    timestamps: true,
    updatedAt: false,
    freezeTableName: true
  }
)

const retweet = sequelize.define(
  'retweet_table',
  {
    postId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('NOW()')
    }
  },
  {
    timestamps: true,
    updatedAt: false,
    freezeTableName: true
  }
)

const pinned = sequelize.define(
  'pinned_table',
  {
    postId: {
      type: DataTypes.UUID,
      primaryKey: true
    }
  },
  {
    freezeTableName: true,
    timestamps: false
  }
)

const initSchema = async () => {
  await sequelize.sync()
}

initSchema()

user.hasMany(post, {
  sourceKey: 'username',
  foreignKey: 'postby'
})

user.hasMany(like, {
  sourceKey: 'username',
  foreignKey: 'username'
})

user.hasMany(retweet, {
  sourceKey: 'username',
  foreignKey: 'username'
})

post.hasMany(like, {
  foreignKey: 'postId'
})

post.hasMany(retweet, {
  foreignKey: 'postId'
})

post.hasMany(pinned, {
  foreignKey: 'postId'
})

export {
  user,
  post,
  like,
  retweet,
  pinned
}

export default sequelize
