/* eslint-disable no-param-reassign */
import Sequelize from 'sequelize';
import * as columnTypes from './columnTypes';
import {
  defaultCallbackPromise,
  isFunction,
  handleValueArrayForMethod,
  handlePromiseCallback,
} from '../utils';

export const ThroughValues = Symbol('through-values');

// import genClassMethods from './class-methods';
// import genInstanceMethods from './instance-methods';

function addMethodsForV4(table, azuModel) {
  // const classMethods = genClassMethods(azuModel);
  // Object.assign(table, classMethods);

  // const instanceMethods = genInstanceMethods(azuModel);
  // if(table.prototype) {
  //   Object.assign(table.prototype, instanceMethods);
  // }
}

const autoInclude = (asuOrm, modelName, values, inputInclude) => {
  const asuModel = asuOrm.getAsuModel(modelName);

  const includeMap = {};
  let include = inputInclude;
  (include || []).map(incl => incl.as && (includeMap[incl.as] = incl));


  if(asuModel && values){
    Object.keys(asuModel.associations).map(associationName => {
      if(values[associationName] !== undefined){
        const association = asuModel.associations[associationName];
        if(!includeMap[associationName]){
          include = include || [];
          const childValue = Array.isArray(values[associationName]) ? values[associationName][0] : values[associationName];
          const childInclude = autoInclude(asuOrm, association.targetModel.name, childValue)
          const includeToAdd = {
            model: association.targetModel,
            as: associationName,
          };
          if(childInclude){
            includeToAdd.include = childInclude;
          }
          includeMap[associationName] = includeToAdd;
          include.push(includeToAdd);
        }
        // console.log('association :', association.type === 'belongsToMany');
      }
    });
  }else{
    // console.log('include :', include.map(i => i));
  }

  return include;
}

export default class AzuModel {
  static columnTypes = columnTypes;
  static ThroughValues = ThroughValues;

  constructor(asuOrm, modelName, tableDefine, tablePrefix = 'tbl_') {
    this.asuOrm = asuOrm;
    this.db = this.asuOrm.db;
    this.tableDefine = tableDefine;
    this.tablePrefix = tablePrefix;
    this.modelName = modelName;

    const { columns, sqlzOptions, associations } = this.getNormalizedSettings(this.modelName);
    const {
      name,
      tableName,
    } = sqlzOptions;

    const sqlzModel = this.db.define(modelName, columns, sqlzOptions);
    this.columns = columns;

    this.sqlzOptions = sqlzOptions;
    this.name = name;
    this.tableName = tableName;
    this.associations = associations;
    this.sqlzModel = sqlzModel;
    this.addModelMethods();
  }

  get primaryKey(){
    return this.sqlzModel.primaryKeyAttribute;
  }

  separateNxNAssociations(instance){
    const result = {
      nxNAssociations: [],
    };
    if(!instance._options.include){
      return result;
    }
    result.originalInclude = instance._options.include;
    instance._options.include = [];
    result.originalInclude.map(i => {
      if(!i || !this.associations[i.as]){
        instance._options.include.push(i);
      }else{
        if(this.associations[i.as].type !== 'belongsToMany'){
          instance._options.include.push(i);
        }else{
          result.nxNAssociations.push(i);
        }
      }
    });
    return result;
  }

  addModelMethods(){
    const originalBuild = this.sqlzModel.build.bind(this.sqlzModel);
    this.sqlzModel.build = (values, options = {}) => {
      let include = options.include;
      if(options.isNewRecord){
        include = autoInclude(this.asuOrm, this.modelName, values, options.include);
      }

      const result = originalBuild(values, {
        ...options,
        include,
      });
      values && values[ThroughValues] && (result._options[ThroughValues] = values[ThroughValues]);
      return result;
    }

    const This = this;
    const originalSave = this.sqlzModel.prototype.save;
    this.sqlzModel.prototype.save = function(options) {
      const {
        originalInclude,
        nxNAssociations,
      } = This.separateNxNAssociations(this);
      if(!originalInclude || !nxNAssociations.length){
        return originalSave.call(this, options);
      }

      return originalSave.call(this, options)
      .then(me => {
        me._options.include = originalInclude;

        return Promise.all(nxNAssociations.map(include => {
          const includeOptions = {
            transaction: options.transaction,
            logging: options.logging,
            parentRecord: this,
            ...Sequelize.Utils.cloneDeep(include),
          };
          delete includeOptions.association;

          const instances = this.get(include.as);

          return Promise.all(instances.map(instance => {
            let throughValues = {};
            if(instance._options[ThroughValues]){
              throughValues = instance._options[ThroughValues];
              delete instance._options[ThroughValues];
            }

            return instance.save(includeOptions).then(() => {
              const values = {
                ...throughValues,
              };
              values[include.association.foreignKey] = this.get(this.constructor.primaryKeyAttribute, {raw: true});
              values[include.association.otherKey] = instance.get(instance.constructor.primaryKeyAttribute, {raw: true});
              // Include values defined in the scope of the association
              Object.assign(values, include.association.through.scope);
              return include.association.throughModel.create(values, includeOptions);
            })
            .then(throughInstance => {
              const throughAs = This.associations[include.as].extraOptions.asuThroughAs;
              instance.dataValues[throughAs] = throughInstance;
              // console.log('instance :', JSON.stringify(instance));
            });
          }));
        }))
        .then(() => me)
      });
    }
  }

  getNormalizedSettings(modelName) {
    let {
      columns: inputColumns,
      options,
    } = this.tableDefine;

    const associations = {};

    const columns = {};
    Object.keys(inputColumns).map(columnName => {
      const column = inputColumns[columnName]
      if(column.type && columnTypes.isAssociationColumn(column.type)){
        associations[columnName] = column.type;
        associations[columnName].setAs(columnName);
      }else{
        columns[columnName] = column;
      }
    });

    const sqlzOptions = Sequelize.Utils.merge({
      timestamps: true,
      paranoid: true,
      underscored: true,
      name: {
        plural: Sequelize.Utils.pluralize(modelName),
        singular: Sequelize.Utils.singularize(modelName),
      },
    }, options);

    sqlzOptions.tableName = sqlzOptions.tableName || `${this.tablePrefix}${Sequelize.Utils.underscore(sqlzOptions.name.singular)}`;

    return { columns, sqlzOptions, associations };
  }

  // ==============================================

  setupAssociations() {
    Object.keys(this.associations).map(associationName => {
      const association = this.associations[associationName];
      let TargetModel = association.targetModel;
      if(typeof TargetModel === 'string'){
        TargetModel = association.targetModel = this.asuOrm.getSqlzModel(TargetModel);
      }

      let throughModel = undefined;
      let options = undefined;
      if(association.type === 'belongsToMany'){
        throughModel = this.asuOrm.getSqlzAssociationModel(association.options.through.asuModelName);
        options = Sequelize.Utils.merge({
          through: {
            model: throughModel,
          },
          as: associationName,
        }, association.options);
      }else{
        options = Sequelize.Utils.merge({
          as: associationName,
        }, association.options);
      }

      if(options.as && options.as !== associationName){
        throw new Error(`Association.as (${options.as}) should be the same as column name (${associationName}) in model (${this.modelName})`);
      }
      this.sqlzModel[association.type](TargetModel, options);
    });
  }
}
