'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _AsuModel = require('./AsuModel');

var _AsuModel2 = _interopRequireDefault(_AsuModel);

var _AssociationModel = require('./AssociationModel');

var _AssociationModel2 = _interopRequireDefault(_AssociationModel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DataModel = _AsuModel2.default;

var AsuOrm = function () {
  function AsuOrm(sequelizeDb, asuModelDefs) {
    var _this = this;

    _classCallCheck(this, AsuOrm);

    this.db = sequelizeDb;
    this.asuModelDefs = asuModelDefs;
    this.tableInfo = {};
    this.associationModelInfo = {};

    var _asuModelDefs = this.asuModelDefs,
        _asuModelDefs$models = _asuModelDefs.models,
        models = _asuModelDefs$models === undefined ? {} : _asuModelDefs$models,
        _asuModelDefs$associa = _asuModelDefs.associationModels,
        associationModels = _asuModelDefs$associa === undefined ? {} : _asuModelDefs$associa;


    Object.keys(associationModels).map(function (name) {
      return _this.associationModelInfo[name] = new _AssociationModel2.default(_this, name, associationModels[name]);
    });

    Object.keys(models).map(function (name) {
      return _this.tableInfo[name] = new DataModel(_this, name, models[name]);
    });

    Object.keys(this.tableInfo).map(function (name) {
      return _this.tableInfo[name].setupAssociations();
    });
  }

  _createClass(AsuOrm, [{
    key: 'sync',
    value: function sync() {
      var force = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      return this.db.sync({ force: force });
    }
  }, {
    key: 'getAsuModel',
    value: function getAsuModel(name) {
      return this.tableInfo[name];
    }
  }, {
    key: 'getSqlzModel',
    value: function getSqlzModel(name) {
      var model = this.getAsuModel(name);
      return model && model.sqlzModel;
    }
  }, {
    key: 'getAsuAssociationModel',
    value: function getAsuAssociationModel(name) {
      return this.associationModelInfo[name];
    }
  }, {
    key: 'getSqlzAssociationModel',
    value: function getSqlzAssociationModel(name) {
      var model = this.getAsuAssociationModel(name);
      return model && model.sqlzModel;
    }
  }]);

  return AsuOrm;
}();

exports.default = AsuOrm;


Object.keys(_AsuModel2.default.columnTypes).map(function (name) {
  AsuOrm[name] = _AsuModel2.default.columnTypes[name];
});

AsuOrm.ThroughValues = _AsuModel2.default.ThroughValues;