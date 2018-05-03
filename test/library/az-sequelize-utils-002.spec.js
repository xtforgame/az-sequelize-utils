/*eslint-disable no-unused-vars, no-undef */

import chai from 'chai';
import Sequelize from 'sequelize';
import AsuOrm from 'library/AsuOrm';
import getLogFileNamefrom from '../test-utils/getLogFileName';

import {
  postgresPort,
  postgresUser,
  postgresDbName,
  postgresPassword,
  postgresHost,
  getConnectString,
  resetTestDbAndTestRole,
} from '../test-utils/utils';

import {
  getModelDefs01,
} from '../test-data/az-sequelize-utils-testdata';
import fs from 'fs';
import path from 'path';
let logFiles = {};

let write = (file, data) => {
  let logFile = logFiles[file] = logFiles[file] || fs.createWriteStream(file, {flags : 'w'});
  logFile.write(data);
}

export default write;

const logFileName = getLogFileNamefrom(__filename);
function databaseLogger(...args){ // eslint-disable-line no-unused-vars
  write(path.resolve(__dirname, logFileName), args[0] + '\n');
}

let expect = chai.expect;

class AzRdbmsMgr {
  constructor(asuModelDefs){
    this.asuModelDefs = asuModelDefs;
    this.sequelizeDb = new Sequelize(getConnectString(postgresUser), {
      dialect: 'postgres',
      logging: databaseLogger,
      define: {
        defaultScope: {
          attributes: {
            exclude: ['created_at', 'updated_at', 'deleted_at'],
          },
        },
      },
    });

    this.asuOrm = new AsuOrm(this.sequelizeDb, this.asuModelDefs);
  }

  sync(force = true){
    return this.asuOrm.sync({force});
  }

  close(){
    return this.asuOrm.db.close();
  }
}

describe('AsuOrm test', function(){

  describe('Basic', function(){
    let asuMgr = null;
    beforeEach(function() {
      return resetTestDbAndTestRole()
      .then(() => {
        asuMgr = new AzRdbmsMgr(getModelDefs01());
      });
    });

    afterEach(function() {
      return asuMgr.close();
    });

    it('should able to do CRUD for has-many association ', function(){
      this.timeout(900000);
      let User = asuMgr.asuOrm.getSqlzModel('user');
      let UserGroup = asuMgr.asuOrm.getSqlzModel('userGroup');

      return asuMgr.sync()
      .then(() => {
        return User.create({
          username: 'xxxx',
          userGroups: [{
            name: 'group 1',
          }],
        }, {
          // include: [{
          //   model: UserGroup,
          //   as: 'userGroups',
          // }],
        })
        .then(user => {
          // console.log('user :', JSON.stringify(user));
        });
      })
      .then(() => {
        return User.findOne({
          where: {
            username: 'xxxx',
          },
          include: [{
            model: UserGroup,
            as: 'userGroups',
          }],
        })
        .then(user => {
          // console.log('user :', JSON.stringify(user));
        });
      })
      .then(() => {
        return UserGroup.findOne({
          where: {
            name: 'group 1',
          },
          include: [{
            model: User,
            as: 'users',
          }],
        })
        .then(userGroup => {
          // console.log('userGroup :', userGroup && userGroup.dataValues);
        });
      })
      .then(() => {
        return UserGroup.create({
          name: 'group 2',
          users: [{
            username: 'oooo',
            userGroups: [{
              name: 'group 3',
            }],
          }],
        }, {
          // include: [{
          //   model: User,
          //   as: 'users',
          //   include: [{
          //     model: UserGroup,
          //     as: 'userGroups',
          //   }],
          // }],
        })
        .then(userGroup => {
          // console.log('userGroup :', userGroup && userGroup.dataValues);
        });
      });
    });

    it('should able to do CRUD with transaction', function(){
      this.timeout(900000);
      let User = asuMgr.asuOrm.getSqlzModel('user');
      let UserGroup = asuMgr.asuOrm.getSqlzModel('userGroup');

      return asuMgr.sync()
      .then(() => {
        return asuMgr.sequelizeDb.transaction({
          isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE,
          // deferrable: Sequelize.Deferrable.SET_DEFERRED(['mn_user_user_group_user_id_fkey']),
          // deferrable: Sequelize.Deferrable.SET_DEFERRED,
        })
        .then(t => {
          return UserGroup.create({
            name: 'group 2',
            users: [{
              username: 'oooo',
              userGroups: [{
                name: 'group 3',
                [AsuOrm.ThroughValues]: {
                  role: 'group 3',
                },
              }],
              [AsuOrm.ThroughValues]: {
                role: 'group 2',
              },
            }],
          }, {
            transaction: t,
          })
          .then(result => {
            // console.log('result :', JSON.stringify(result));
            return t.commit()
            .then(() => result);
          }).catch(error => {
            console.log(error);
            return t.rollback()
            .then(() => Promise.reject(error));
          });
        });
      })
      .then(() => {
        return asuMgr.sequelizeDb.transaction({
          isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE,
          // deferrable: Sequelize.Deferrable.SET_DEFERRED(['mn_user_user_group_user_id_fkey']),
          // deferrable: Sequelize.Deferrable.SET_DEFERRED,
        })
        .then(t => {
          return UserGroup.create({
            name: 'group 2',
            users: [{
              username: 'oooo',
              userGroups: [{
                id: 1,
                name: 'group 3',
                [AsuOrm.ThroughValues]: {
                  role: 'group 3',
                },
              }],
              [AsuOrm.ThroughValues]: {
                role: 'group 2',
              },
            }],
          }, {
            transaction: t,
          })
          .then(result => {
            return t.commit()
            .then(() => result);
          }).catch(error => {
            return t.rollback();
          });
        });
      });
    });

  });

});
