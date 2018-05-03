export const associations = [
  'hasOne',
  'hasMany',
  'belongsTo',
  'belongsToMany',
];

export class AssociationColumn {
  constructor(type, targetModel, options = {}, extraOptions = {}){
    if(!type){
      throw new Error('ASSOCIATION must has a type argument');
    }
    this.type = type;
    this.targetModel = targetModel;
    this.options = options;
    this.extraOptions = extraOptions;
  }

  setAs(as){
    this.as = as;
  }
}

export const ASSOCIATION = (type, targetModel, options, extraOptions) => {
  if(!type){
    throw new Error('ASSOCIATION must has a type argument');
  }
  return new AssociationColumn(type, targetModel, options, extraOptions);
}

export const HAS_ONE = (targetModel, options) => {
  return ASSOCIATION(HAS_ONE.type, targetModel, options);
}
HAS_ONE.type = 'hasOne';

export const HAS_MANY = (targetModel, options) => {
  return ASSOCIATION(HAS_MANY.type, targetModel, options);
}
HAS_MANY.type = 'hasMany';

export const BELONGS_TO = (targetModel, options) => {
  return ASSOCIATION(BELONGS_TO.type, targetModel, options);
}
BELONGS_TO.type = 'belongsTo';

export const BELONGS_TO_MANY = (targetModel, _options) => {
  const options = { ..._options };

  const extraOptions = {};
  if(typeof options.through === 'string'){
    extraOptions.asuThroughAs = options.through;
  }else if(options.through.asuThroughAs) {
    extraOptions.asuThroughAs = options.through.asuThroughAs;
    delete options.through.asuThroughAs;
  }else if(options.through.asuModelName) {
    extraOptions.asuThroughAs = options.through.asuModelName;
  }else {
    extraOptions.asuThroughAs = options.through.model.name;
  }
  return ASSOCIATION(BELONGS_TO_MANY.type, targetModel, options, extraOptions);
}
BELONGS_TO_MANY.type = 'belongsToMany';

ASSOCIATION.HAS_ONE = HAS_ONE;
ASSOCIATION.HAS_MANY = HAS_MANY;
ASSOCIATION.BELONGS_TO = BELONGS_TO;
ASSOCIATION.BELONGS_TO_MANY = BELONGS_TO_MANY;

export const isAssociationColumn = (columnType) => {
  return columnType instanceof AssociationColumn;
}
