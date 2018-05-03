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

    it('should able to add has-many association ', function(){
      this.timeout(900000);
      let User = asuMgr.asuOrm.getSqlzModel('user');
      let UserGroup = asuMgr.asuOrm.getSqlzModel('userGroup');

      let user = null;
      return asuMgr.sync()
      .then(() => {
        return Promise.all([User.create(), UserGroup.create()])
        .then(([_user, userGroup]) => {
          user = _user;
          // console.log('user :', JSON.stringify(user));
          return user.addUserGroup(userGroup, { through: { role: 1 }});
        })
        .then(() => {
          
        });
      });
    });
  });

});
