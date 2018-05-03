'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.ThroughValues = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp;

var _sequelize = require('sequelize');

var _sequelize2 = _interopRequireDefault(_sequelize);

var _columnTypes = require('./columnTypes');

var columnTypes = _interopRequireWildcard(_columnTypes);

var _utils = require('../utils');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ThroughValues = exports.ThroughValues = Symbol('through-values');

function addMethodsForV4(table, azuModel) {}

var autoInclude = function autoInclude(asuOrm, modelName, values, inputInclude) {
  var asuModel = asuOrm.getAsuModel(modelName);

  var includeMap = {};
  var include = inputInclude;
  (include || []).map(function (incl) {
    return incl.as && (includeMap[incl.as] = incl);
  });

  if (asuModel && values) {
    Object.keys(asuModel.associations).map(function (associationName) {
      if (values[associationName] !== undefined) {
        var association = asuModel.associations[associationName];
        if (!includeMap[associationName]) {
          include = include || [];
          var childValue = Array.isArray(values[associationName]) ? values[associationName][0] : values[associationName];
          var childInclude = autoInclude(asuOrm, association.targetModel.name, childValue);
          var includeToAdd = {
            model: association.targetModel,
            as: associationName
          };
          if (childInclude) {
            includeToAdd.include = childInclude;
          }
          includeMap[associationName] = includeToAdd;
          include.push(includeToAdd);
        }
      }
    });
  } else {}

  return include;
};

var AzuModel = (_temp = _class = function () {
  function AzuModel(asuOrm, modelName, tableDefine) {
    var tablePrefix = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'tbl_';

    _classCallCheck(this, AzuModel);

    this.asuOrm = asuOrm;
    this.db = this.asuOrm.db;
    this.tableDefine = tableDefine;
    this.tablePrefix = tablePrefix;
    this.modelName = modelName;

    var _getNormalizedSetting = this.getNormalizedSettings(this.modelName),
        columns = _getNormalizedSetting.columns,
        sqlzOptions = _getNormalizedSetting.sqlzOptions,
        associations = _getNormalizedSetting.associations;

    var name = sqlzOptions.name,
        tableName = sqlzOptions.tableName;


    var sqlzModel = this.db.define(modelName, columns, sqlzOptions);
    this.columns = columns;

    this.sqlzOptions = sqlzOptions;
    this.name = name;
    this.tableName = tableName;
    this.associations = associations;
    this.sqlzModel = sqlzModel;
    this.addModelMethods();
  }

  _createClass(AzuModel, [{
    key: 'separateNxNAssociations',
    value: function separateNxNAssociations(instance) {
      var _this = this;

      var result = {
        nxNAssociations: []
      };
      if (!instance._options.include) {
        return result;
      }
      result.originalInclude = instance._options.include;
      instance._options.include = [];
      result.originalInclude.map(function (i) {
        if (!i || !_this.associations[i.as]) {
          instance._options.include.push(i);
        } else {
          if (_this.associations[i.as].type !== 'belongsToMany') {
            instance._options.include.push(i);
          } else {
            result.nxNAssociations.push(i);
          }
        }
      });
      return result;
    }
  }, {
    key: 'addModelMethods',
    value: function addModelMethods() {
      var _this2 = this;

      var originalBuild = this.sqlzModel.build.bind(this.sqlzModel);
      this.sqlzModel.build = function (values) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        var include = options.include;
        if (options.isNewRecord) {
          include = autoInclude(_this2.asuOrm, _this2.modelName, values, options.include);
        }

        var result = originalBuild(values, _extends({}, options, {
          include: include
        }));
        values && values[ThroughValues] && (result._options[ThroughValues] = values[ThroughValues]);
        return result;
      };

      var This = this;
      var originalSave = this.sqlzModel.prototype.save;
      this.sqlzModel.prototype.save = function (options) {
        var _this3 = this;

        var _This$separateNxNAsso = This.separateNxNAssociations(this),
            originalInclude = _This$separateNxNAsso.originalInclude,
            nxNAssociations = _This$separateNxNAsso.nxNAssociations;

        if (!originalInclude || !nxNAssociations.length) {
          return originalSave.call(this, options);
        }

        return originalSave.call(this, options).then(function (me) {
          me._options.include = originalInclude;

          return Promise.all(nxNAssociations.map(function (include) {
            var includeOptions = _extends({
              transaction: options.transaction,
              logging: options.logging,
              parentRecord: _this3
            }, _sequelize2.default.Utils.cloneDeep(include));
            delete includeOptions.association;

            var instances = _this3.get(include.as);

            return Promise.all(instances.map(function (instance) {
              var throughValues = {};
              if (instance._options[ThroughValues]) {
                throughValues = instance._options[ThroughValues];
                delete instance._options[ThroughValues];
              }

              return instance.save(includeOptions).then(function () {
                var values = _extends({}, throughValues);
                values[include.association.foreignKey] = _this3.get(_this3.constructor.primaryKeyAttribute, { raw: true });
                values[include.association.otherKey] = instance.get(instance.constructor.primaryKeyAttribute, { raw: true });

                Object.assign(values, include.association.through.scope);
                return include.association.throughModel.create(values, includeOptions);
              }).then(function (throughInstance) {
                var throughAs = This.associations[include.as].extraOptions.asuThroughAs;
                instance.dataValues[throughAs] = throughInstance;
              });
            }));
          })).then(function () {
            return me;
          });
        });
      };
    }
  }, {
    key: 'getNormalizedSettings',
    value: function getNormalizedSettings(modelName) {
      var _tableDefine = this.tableDefine,
          inputColumns = _tableDefine.columns,
          options = _tableDefine.options;


      var associations = {};

      var columns = {};
      Object.keys(inputColumns).map(function (columnName) {
        var column = inputColumns[columnName];
        if (column.type && columnTypes.isAssociationColumn(column.type)) {
          associations[columnName] = column.type;
          associations[columnName].setAs(columnName);
        } else {
          columns[columnName] = column;
        }
      });

      var sqlzOptions = _sequelize2.default.Utils.merge({
        timestamps: true,
        paranoid: true,
        underscored: true,
        name: {
          plural: _sequelize2.default.Utils.pluralize(modelName),
          singular: _sequelize2.default.Utils.singularize(modelName)
        }
      }, options);

      sqlzOptions.tableName = sqlzOptions.tableName || '' + this.tablePrefix + _sequelize2.default.Utils.underscore(sqlzOptions.name.singular);

      return { columns: columns, sqlzOptions: sqlzOptions, associations: associations };
    }
  }, {
    key: 'setupAssociations',
    value: function setupAssociations() {
      var _this4 = this;

      Object.keys(this.associations).map(function (associationName) {
        var association = _this4.associations[associationName];
        var TargetModel = association.targetModel;
        if (typeof TargetModel === 'string') {
          TargetModel = association.targetModel = _this4.asuOrm.getSqlzModel(TargetModel);
        }

        var throughModel = undefined;
        var options = undefined;
        if (association.type === 'belongsToMany') {
          throughModel = _this4.asuOrm.getSqlzAssociationModel(association.options.through.asuModelName);
          options = _sequelize2.default.Utils.merge({
            through: {
              model: throughModel
            },
            as: associationName
          }, association.options);
        } else {
          options = _sequelize2.default.Utils.merge({
            as: associationName
          }, association.options);
        }

        if (options.as && options.as !== associationName) {
          throw new Error('Association.as (' + options.as + ') should be the same as column name (' + associationName + ') in model (' + _this4.modelName + ')');
        }
        _this4.sqlzModel[association.type](TargetModel, options);
      });
    }
  }, {
    key: 'primaryKey',
    get: function get() {
      return this.sqlzModel.primaryKeyAttribute;
    }
  }]);

  return AzuModel;
}(), _class.columnTypes = columnTypes, _class.ThroughValues = ThroughValues, _temp);
exports.default = AzuModel;