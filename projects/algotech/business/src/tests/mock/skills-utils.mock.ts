import { SmartObjectDto, WorkflowInstanceContextDto } from "@algotech-ce/core";
import { Observable, of } from "rxjs";
import { SkillsUtils, SoUtils } from "../../../interpretor/src";

export class SkillsUtilsMock extends SkillsUtils {

  constructor(protected soUtils: SoUtils) {
    super(soUtils);
  }
  getMagnets(appKey: string, boardInstance: string, zoneKey: string,
    context?: WorkflowInstanceContextDto): Observable<SmartObjectDto[]> {
    return of([]);
  }

}