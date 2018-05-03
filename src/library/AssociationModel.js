import AsuModel from './AsuModel';

export default class AssociationModel extends AsuModel {
  constructor(asuOrm, modelName, tableDefine) {
    super(asuOrm, modelName, tableDefine, 'mn_');
  }
}
