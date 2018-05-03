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

    it('should able to do CRUD', function(){
      this.timeout(900000);
      let User = asuMgr.asuOrm.getSqlzModel('user');
      let AccountLink = asuMgr.asuOrm.getSqlzModel('accountLink');

      return asuMgr.sync()
      .then(() => {
        return User.create({
          username: 'xxxx',
          accountLinks: [{
            provider_id: 'basic',
            provider_user_id: 'user1',
            provider_user_access_info: {},
          }],
        }, {
          // include: [{
          //   model: AccountLink,
          //   as: 'accountLinks',
          // }],
        })
        .then(user => {
          // console.log('user :', user.dataValues);
        });
      })
      .then(() => {
        return User.findOne({
          where: {
            username: 'xxxx',
          },
          include: [{
            model: AccountLink,
            as: 'accountLinks',
          }],
        })
        .then(user => {
          // console.log('user :', user && user.dataValues);
        });
      })
      .then(() => {
        return AccountLink.findOne({
          where: {
            provider_id: 'basic',
            provider_user_id: 'user1',
          },
          include: [{
            model: User,
            as: 'owner',
          }],
        })
        .then(accountLink => {
          // console.log('accountLink :', accountLink && accountLink.dataValues);
        });
      })
      .then(() => {
        return AccountLink.create({
          provider_id: 'basic',
          provider_user_id: 'user2',
          owner: {
            username: 'oooo',
            accountLinks: [{
              provider_id: 'third-party-1',
              provider_user_id: 'user2',
            }],
          },
        }, {
          // include: [{
          //   model: User,
          //   as: 'owner',
          //   include: [{
          //     model: AccountLink,
          //     as: 'accountLinks',
          //   }],
          // }],
        })
        .then(accountLink => {
          // console.log('accountLink :', accountLink && accountLink.dataValues);
        });
      });
    });

    it('should able to do CRUD with transaction', function(){
      this.timeout(900000);
      let User = asuMgr.asuOrm.getSqlzModel('user');
      let AccountLink = asuMgr.asuOrm.getSqlzModel('accountLink');

      return asuMgr.sync()
      .then(() => {
        return asuMgr.sequelizeDb.transaction({
          isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE,
          // deferrable: Sequelize.Deferrable.SET_DEFERRED(['mn_user_user_group_user_id_fkey']),
          // deferrable: Sequelize.Deferrable.SET_DEFERRED,
        })
        .then(t => {
          return AccountLink.create({
            provider_id: 'basic',
            provider_user_id: 'user2',
            owner: {
              username: 'oooo',
              accountLinks: [{
                provider_id: 'third-party-1',
                provider_user_id: 'user2',
              }],
            },
          }, {
            transaction: t,
          })
          .then(result => {
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
          return AccountLink.create({
            provider_id: 'basic',
            provider_user_id: 'user2',
            owner: {
              username: 'oooo',
              accountLinks: [{
                provider_id: 'basic',
                provider_user_id: 'user2',
              }],
            },
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
