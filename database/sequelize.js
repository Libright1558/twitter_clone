import { Sequelize, DataTypes } from 'sequelize'
import 'dotenv/config'

const sequelize = new Sequelize({
  host: process.env.db_host,
  database: process.env.db_schema,
  port: process.env.db_port,
  user: process.env.db_user,
  dialect: process.env.db_type
})

try {
  await sequelize.authenticate()
  console.log('Connection has been established successfully.')
} catch (error) {
  console.error('Unable to connect to the database: ', error)
}

const user = sequelize.define(
  'user',
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
    }
  },
  {
    freezeTableName: true
  }
)

const post = sequelize.define(
  'post',
  {
    postId: {
      type: DataTypes.UUID,
      defaultValue: sequelize.literal('uuid_generate_v4()'),
      allowNull: false,
      primaryKey: true
    },
    postby: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    content: {
      type: DataTypes.TEXT
    }
  },
  {
    timestamps: true,
    updatedAt: false,
    freezeTableName: true
  }
)

const like = sequelize.define(
  'like',
  {
    postId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    }
  },
  {
    timestamps: false,
    freezeTableName: true
  }
)

const retweet = sequelize.define(
  'retweet',
  {
    postId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    }
  },
  {
    timestamps: false,
    freezeTableName: true
  }
)

const pinned = sequelize.define(
  'pinned',
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
