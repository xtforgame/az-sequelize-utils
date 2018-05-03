'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _AsuModel2 = require('./AsuModel');

var _AsuModel3 = _interopRequireDefault(_AsuModel2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AssociationModel = function (_AsuModel) {
  _inherits(AssociationModel, _AsuModel);

  function AssociationModel(asuOrm, modelName, tableDefine) {
    _classCallCheck(this, AssociationModel);

    return _possibleConstructorReturn(this, (AssociationModel.__proto__ || Object.getPrototypeOf(AssociationModel)).call(this, asuOrm, modelName, tableDefine, 'mn_'));
  }

  return AssociationModel;
}(_AsuModel3.default);

exports.default = AssociationModel;