'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var associations = exports.associations = ['hasOne', 'hasMany', 'belongsTo', 'belongsToMany'];

var AssociationColumn = exports.AssociationColumn = function () {
  function AssociationColumn(type, targetModel) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var extraOptions = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

    _classCallCheck(this, AssociationColumn);

    if (!type) {
      throw new Error('ASSOCIATION must has a type argument');
    }
    this.type = type;
    this.targetModel = targetModel;
    this.options = options;
    this.extraOptions = extraOptions;
  }

  _createClass(AssociationColumn, [{
    key: 'setAs',
    value: function setAs(as) {
      this.as = as;
    }
  }]);

  return AssociationColumn;
}();

var ASSOCIATION = exports.ASSOCIATION = function ASSOCIATION(type, targetModel, options, extraOptions) {
  if (!type) {
    throw new Error('ASSOCIATION must has a type argument');
  }
  return new AssociationColumn(type, targetModel, options, extraOptions);
};

var HAS_ONE = exports.HAS_ONE = function HAS_ONE(targetModel, options) {
  return ASSOCIATION(HAS_ONE.type, targetModel, options);
};
HAS_ONE.type = 'hasOne';

var HAS_MANY = exports.HAS_MANY = function HAS_MANY(targetModel, options) {
  return ASSOCIATION(HAS_MANY.type, targetModel, options);
};
HAS_MANY.type = 'hasMany';

var BELONGS_TO = exports.BELONGS_TO = function BELONGS_TO(targetModel, options) {
  return ASSOCIATION(BELONGS_TO.type, targetModel, options);
};
BELONGS_TO.type = 'belongsTo';

var BELONGS_TO_MANY = exports.BELONGS_TO_MANY = function BELONGS_TO_MANY(targetModel, _options) {
  var options = _extends({}, _options);

  var extraOptions = {};
  if (typeof options.through === 'string') {
    extraOptions.asuThroughAs = options.through;
  } else if (options.through.asuThroughAs) {
    extraOptions.asuThroughAs = options.through.asuThroughAs;
    delete options.through.asuThroughAs;
  } else if (options.through.asuModelName) {
    extraOptions.asuThroughAs = options.through.asuModelName;
  } else {
    extraOptions.asuThroughAs = options.through.model.name;
  }
  return ASSOCIATION(BELONGS_TO_MANY.type, targetModel, options, extraOptions);
};
BELONGS_TO_MANY.type = 'belongsToMany';

ASSOCIATION.HAS_ONE = HAS_ONE;
ASSOCIATION.HAS_MANY = HAS_MANY;
ASSOCIATION.BELONGS_TO = BELONGS_TO;
ASSOCIATION.BELONGS_TO_MANY = BELONGS_TO_MANY;

var isAssociationColumn = exports.isAssociationColumn = function isAssociationColumn(columnType) {
  return columnType instanceof AssociationColumn;
};