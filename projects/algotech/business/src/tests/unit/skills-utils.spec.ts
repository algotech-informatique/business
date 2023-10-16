import { classToPlain } from "class-transformer";
import { zip } from "rxjs";
import { SkillsUtils } from "../../../public_api";
import { inputSmarObject1, inputSmarObject2, smartObject, sysfile1, sysfile2, sysfiles, transition1, transition2, transition3 } from "../fixtures/skills-utils.test";
import { SkillsUtilsMock } from "../mock/skills-utils.mock";

describe(SkillsUtils.name, () => {
  let skillsUtils: SkillsUtilsMock;


  beforeAll(() => {
    skillsUtils = new SkillsUtilsMock(null);
  });

  beforeEach(() => {
    smartObject.skills.atDocument.documents = ['toto'];
  })

  describe(SkillsUtils.prototype._createDocument.name, () => {    
    it('should be null and fill smartObject docuemnts Array', () => {
      smartObject.uuid = 'toto';
      expect(skillsUtils._createDocument(smartObject, { key: '', value: inputSmarObject1 }, false)).toBe(null);
      expect(smartObject.skills.atDocument.documents).toEqual(['123456', '1234567', '12345678']);
    });

    it('should be null and fill smartObject docuemnts Array', () => {
      smartObject.uuid = 'toto';
      expect(skillsUtils._createDocument(smartObject, { key: '', value: [inputSmarObject1, inputSmarObject2] }, false)).toBe(null);
      expect(smartObject.skills.atDocument.documents).toEqual(['123456', '1234567', '12345678', '12345', '123459']);
    });

    it('should be null and replace smartObject docuemnts Array', () => {
      smartObject.uuid = 'toto';
      expect(skillsUtils._createDocument(smartObject, { key: '', value: sysfile1 }, false)).toBe(null);
      expect(smartObject.skills.atDocument.documents).toEqual(['123456']);
    });

    it('should be null and fill smartObject docuemnts Array', () => {
      smartObject.uuid = 'toto';
      expect(skillsUtils._createDocument(smartObject, { key: '', value: sysfile1 }, true)).toBe(null);
      expect(smartObject.skills.atDocument.documents).toEqual(['toto', '123456']);
    });

    it('should be null and fill smartObject docuemnts Array', () => {
      smartObject.uuid = 'toto';
      expect(skillsUtils._createDocument(smartObject, { key: '', value: [sysfile1, sysfile2] }, true)).toBe(null);
      expect(smartObject.skills.atDocument.documents).toEqual(['toto', '123456', '1234567']);
    });

    it('should return Observable<InterpretorTransferTransitionDto>[] and fill smartObject docuemnts Array and return transitions', () => {
      smartObject.uuid = 'toto';
      zip(...skillsUtils._createDocument(smartObject, { key: '', value: sysfiles }, true)).pipe().subscribe({
        next: (res) => {
          expect(smartObject.skills.atDocument.documents).toEqual(['toto', '123456', '1234567']);
          expect(classToPlain(res)).toEqual(jasmine.arrayContaining([jasmine.objectContaining(transition1), jasmine.objectContaining(transition2), jasmine.objectContaining(transition3)]));
        }
      });
    });
  })

});
