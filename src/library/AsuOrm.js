/* eslint-disable no-param-reassign */
import AsuModel from './AsuModel';
import AssociationModel from './AssociationModel';

const DataModel = AsuModel;

export default class AsuOrm {
  constructor(sequelizeDb, asuModelDefs) {
    this.db = sequelizeDb;
    this.asuModelDefs = asuModelDefs;
    this.tableInfo = {};
    this.associationModelInfo = {};

    const { models = {}, associationModels = {} } = this.asuModelDefs;

    Object.keys(associationModels).map(name =>
      (this.associationModelInfo[name] = new AssociationModel(this, name, associationModels[name])));

    Object.keys(models).map(name =>
      (this.tableInfo[name] = new DataModel(this, name, models[name])));

    Object.keys(this.tableInfo).map(name =>
      this.tableInfo[name].setupAssociations());
  }

  sync(force = true) {
    return this.db.sync({ force });
  }

  getAsuModel(name) {
    return this.tableInfo[name];
  }

  getSqlzModel(name) {
    const model = this.getAsuModel(name)
    return model && model.sqlzModel;
  }

  getAsuAssociationModel(name) {
    return this.associationModelInfo[name];
  }

  getSqlzAssociationModel(name) {
    const model = this.getAsuAssociationModel(name)
    return model && model.sqlzModel;
  }
}

Object.keys(AsuModel.columnTypes).map(name => {
  AsuOrm[name] = AsuModel.columnTypes[name];
});

AsuOrm.ThroughValues = AsuModel.ThroughValues;
