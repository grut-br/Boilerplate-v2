import { InvalidCapability, InvalidMetadata, InvalidWorkUnit, InvalidWorkflow } from './WorkUnitErrors.ts';
import type { WorkUnit } from './WorkUnit.ts';
import { WorkUnitSchema } from './WorkUnitSchema.ts';

export class WorkUnitValidator {
  validate(workUnit: WorkUnit): WorkUnit {
    if (!WorkUnitSchema.isPresent(workUnit.id)) throw new InvalidWorkUnit('Work Unit id is required.');
    if (!WorkUnitSchema.isPresent(workUnit.objective)) throw new InvalidWorkUnit('Work Unit objective is required.');
    if (!WorkUnitSchema.isPresent(workUnit.capability) || !WorkUnitSchema.isIdentifier(workUnit.capability)) {
      throw new InvalidCapability('Work Unit capability is invalid.');
    }
    if (!WorkUnitSchema.isPresent(workUnit.workflow) || !WorkUnitSchema.isIdentifier(workUnit.workflow)) {
      throw new InvalidWorkflow('Work Unit workflow is invalid.');
    }
    if (!WorkUnitSchema.isPresent(workUnit.title) || !WorkUnitSchema.isPresent(workUnit.description)) {
      throw new InvalidMetadata('Work Unit title and description are required.');
    }
    return workUnit;
  }
}
