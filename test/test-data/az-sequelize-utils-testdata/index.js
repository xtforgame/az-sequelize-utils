import Sequelize from 'sequelize';
import AsuOrm from 'library/AsuOrm';

let getModelDefs00 = () => ({
  models: {
    user: {
      columns: {
        id: {
          type: Sequelize.BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
          comment: 'PrimaryKey',
        },
        username: {
          type: Sequelize.STRING,
          //unique: true,
          comment: 'Username',
        },
        accountLinks: {
          type: AsuOrm.HAS_MANY('accountLink', {
            foreignKey: 'owner_id',
          }),
        },
        privilege: Sequelize.STRING,
      },
      options: {
        // name: {
        //   singular: 'user',
        //   plural: 'users',
        // },
        // tableName: 'tbl_user',
      },
    },
    accountLink: {
      columns: {
        id: {
          type: Sequelize.BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
          comment: 'PrimaryKey',
        },
        provider_id: {
          type: Sequelize.STRING,
          //unique: true,
        },
        provider_user_id: {
          type: Sequelize.STRING,
          //unique: true,
        },
        provider_user_access_info: {
          type: Sequelize.JSONB,
          //unique: true,
        },
        owner: {
          type: AsuOrm.BELONGS_TO('user', {
            foreignKey: 'owner_id',
          }),
        },
      },
      options: {
        indexes: [
          {
            unique: true,
            fields: ['owner_id', 'provider_id'],
            where: {
              deleted_at: null,
            },
          },
          {
            unique: true,
            fields: ['provider_id', 'provider_user_id'],
            where: {
              deleted_at: null,
            },
          },
        ],
      },
    },
  },
  associationModels: {},
});

let getModelDefs01 = () => ({
  models: {
    user: {
      columns: {
        id: {
          type: Sequelize.BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
          comment: 'PrimaryKey',
        },
        username: {
          type: Sequelize.STRING,
          //unique: true,
          comment: 'Username',
        },
        accountLinks: {
          type: AsuOrm.HAS_MANY('accountLink', {
            foreignKey: 'owner_id',
          }),
        },
        privilege: Sequelize.STRING,
        userGroups: {
          type: AsuOrm.BELONGS_TO_MANY('userGroup', {
            through: {
              asuModelName: 'userUserGroup',
              asuThroughAs: 'relationship',
            },
            foreignKey: 'u_id',
            otherKey: 'g_id',
          }),
        },
      },
      options: {
        // name: {
        //   singular: 'user',
        //   plural: 'users',
        // },
        // tableName: 'tbl_user',
      },
    },
    accountLink: {
      columns: {
        id: {
          type: Sequelize.BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
          comment: 'PrimaryKey',
        },
        provider_id: {
          type: Sequelize.STRING,
          //unique: true,
        },
        provider_user_id: {
          type: Sequelize.STRING,
          //unique: true,
        },
        provider_user_access_info: {
          type: Sequelize.JSONB,
          //unique: true,
        },
        owner: {
          type: AsuOrm.BELONGS_TO('user', {
            foreignKey: 'owner_id',
          }),
        },
      },
      options: {
        indexes: [
          {
            unique: true,
            fields: ['owner_id', 'provider_id'],
            where: {
              deleted_at: null,
            },
          },
          {
            unique: true,
            fields: ['provider_id', 'provider_user_id'],
            where: {
              deleted_at: null,
            },
          },
        ],
      },
    },
    userGroup: {
      columns: {
        id: {
          type: Sequelize.BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
        },
        name: Sequelize.STRING(900),
        users: {
          type: AsuOrm.BELONGS_TO_MANY('user', {
            through: {
              asuModelName: 'userUserGroup',
            },
            foreignKey: 'g_id',
            otherKey: 'u_id',
          }),
        },
      },
      options: {
        // name: {
        //   singular: 'userGroup',
        //   plural: 'userGroups',
        // },
        // tableName: 'tbl_user_group',
      },
    },
  },
  associationModels: {
    userUserGroup: {
      columns: {
        id: {
          type: Sequelize.BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
        },
        role: Sequelize.STRING,
      },
      options: {
        // name: {
        //   singular: 'userUserGroup',
        //   plural: 'userUserGroups',
        // },
        // tableName: 'mn_user_user_group',
      },
    },
  },
});

let getModelDefs02 = () => ({
  models: {
    user: {
      columns: {
        id: {
          type: Sequelize.BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
          comment: 'PrimaryKey',
        },
        username: {
          type: Sequelize.STRING,
          //unique: true,
          comment: 'Username',
        },
        accountLinks: {
          type: AsuOrm.HAS_MANY('accountLink', {
            foreignKey: 'owner_id',
          }),
        },
        privilege: Sequelize.STRING,
      },
      options: {
        // name: {
        //   singular: 'user',
        //   plural: 'users',
        // },
        // tableName: 'tbl_user',
      },
    },
    accountLink: {
      columns: {
        id: {
          type: Sequelize.BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
          comment: 'PrimaryKey',
        },
        provider_id: {
          type: Sequelize.STRING,
          //unique: true,
        },
        provider_user_id: {
          type: Sequelize.STRING,
          //unique: true,
        },
        provider_user_access_info: {
          type: Sequelize.JSONB,
          //unique: true,
        },
        owner: {
          type: AsuOrm.BELONGS_TO('user', {
            foreignKey: 'owner_id',
          }),
        },
      },
      options: {
        indexes: [
          {
            unique: true,
            fields: ['owner_id', 'provider_id'],
            where: {
              deleted_at: null,
            },
          },
          {
            unique: true,
            fields: ['provider_id', 'provider_user_id'],
            where: {
              deleted_at: null,
            },
          },
        ],
      },
    },
  },
  associationModels: {},
});

export {
  getModelDefs00,
  getModelDefs01,
  getModelDefs02,
};
