/*eslint-disable no-unused-vars, no-undef */

import chai from 'chai';
import Sequelize from 'sequelize';
import AzRdbmsOrm from 'library/az-rdbms-orm';

import {
  postgresPort,
  postgresUser,
  postgresDbName,
  postgresPassword,
  postgresHost,
  getConnectString,
  resetTestDbAndTestRole,
} from '../test-utils/utils';

import {getAroModelDefs02} from '../test-data/az-rdbms-orm.testdata';
import fs from 'fs';
import path from 'path';
let logFiles = {};

let write = (file, data) => {
  let logFile = logFiles[file] = logFiles[file] || fs.createWriteStream(file, {flags : 'w'});
  logFile.write(data);
}

export default write;


function databaseLogger(...args){ // eslint-disable-line no-unused-vars
  write(path.resolve(__dirname, './az-rdbms-orm-001.spec.log'), args[0] + '\n');
}

let expect = chai.expect;

class AzRdbmsMgr {
  constructor(aroModelDefs){
    this.aroModelDefs = aroModelDefs;
    this.sequelizeDb = new Sequelize(getConnectString(postgresUser), {
      dialect: 'postgres',
      logging: databaseLogger,
    });

    this.azRdbmsOrm = new AzRdbmsOrm(this.sequelizeDb, this.aroModelDefs);
  }

  sync(force = true){
    return this.azRdbmsOrm.sync({force});
  }
}

describe('AzRdbmsOrm test', function(){

  describe('Basic', function(){
    beforeEach(function() {
      return resetTestDbAndTestRole();
    });

    it('should able to sync', function(){
      this.timeout(900000);
      let azRdbmsMgr = new AzRdbmsMgr({
        models: {},
        associationTables: {},
        associations: [],
      });
      return azRdbmsMgr.sync()
      .then(() => {
      });
    });

    it('should able to create', function(){
      this.timeout(900000);
      let azRdbmsMgr = new AzRdbmsMgr(getAroModelDefs02());
      return azRdbmsMgr.sync()
      .then(() => {
        let users = azRdbmsMgr.azRdbmsOrm.getModel('users');
        return users.create({
          value: {
            username: 'xxxxx',
          },
        })
        .then(user => {
          // console.log('user.origonalResult :', user.origonalResult);
        });
      });
    });

    it('should able to create', function(){
      this.timeout(900000);
      let azRdbmsMgr = new AzRdbmsMgr(getAroModelDefs02());
      return azRdbmsMgr.sync()
      .then(() => {
        let users = azRdbmsMgr.azRdbmsOrm.getModel('users');
        return users.create({
          value: {
            username: 'xxxxx',
          },
          submodels: [
            {
              model: 'accountLinks',
              value: ({parent: {result: user}}) => {
                return {
                  provider_id: 'vaxal',
                  provider_user_id: user.dataValues.username,
                  provider_user_access_info: {
                    password: user.dataValues.username,
                  },
                };
              },
            },
          ],
        })
        .then(user => {
          expect(user.origonalResult, 'user.origonalResult').to.be.an('object');
          let sqlzUserInst = user.origonalResult;
          expect(sqlzUserInst.dataValues, 'sqlzUserInst.dataValues').to.be.an('object');
          expect(sqlzUserInst.dataValues.username, 'sqlzUserInst.dataValues.username').to.equal('xxxxx');
          expect(sqlzUserInst.dataValues.accountLinks, 'sqlzUserInst.accountLinks').to.exist;
          expect(sqlzUserInst.dataValues.accountLinks[0], 'sqlzUserInst.accountLinks[0]').to.be.an('object');
          let sqlzAccountLinkInst = sqlzUserInst.dataValues.accountLinks[0];
          expect(sqlzAccountLinkInst.dataValues.provider_user_id, 'sqlzAccountLinkInst.dataValues.provider_user_id').to.equal('xxxxx');
        });
      });
    });

    it('should able to create', function(){
      this.timeout(900000);
      let azRdbmsMgr = new AzRdbmsMgr(getAroModelDefs02());
      return azRdbmsMgr.sync()
      .then(() => {
        let accountLinks = azRdbmsMgr.azRdbmsOrm.getModel('accountLinks');
        return accountLinks.create({
          value: {
            provider_id: 'vaxal',
            provider_user_id: 'ooooo',
            provider_user_access_info: {
              password: 'ooooo',
            },
          },
          submodels: [
            {
              model: 'user',
              value: ({parent: {result: accountLink}}) => {
                return {
                  username: accountLink.dataValues.provider_user_id,
                };
              },
            },
          ],
        })
        .then(accountLink => {
          expect(accountLink.origonalResult, 'accountLink.origonalResult').to.be.an('object');
          let sqlzAccountLinkInst = accountLink.origonalResult;
          expect(sqlzAccountLinkInst.dataValues, 'sqlzAccountLinkInst.dataValues').to.be.an('object');
          expect(sqlzAccountLinkInst.dataValues.provider_user_id, 'sqlzAccountLinkInst.dataValues.provider_user_id').to.equal('ooooo');
          expect(sqlzAccountLinkInst.dataValues.user, 'sqlzAccountLinkInst.dataValues.user').to.be.an('object');
          let sqlzUserInst = sqlzAccountLinkInst.dataValues.user;
          expect(sqlzUserInst.dataValues.username, 'sqlzUserInst.dataValues.username').to.equal('ooooo');
        });
      });
    });

  });

});
