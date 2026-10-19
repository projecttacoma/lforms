import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LhcItemChoiceAutocompleteComponent } from './lhc-item-choice-autocomplete.component';
import { LhcDataService} from '../../lib/lhc-data.service';
    
describe('LhcItemChoiceAutocompleteComponent', () => {
  let component: LhcItemChoiceAutocompleteComponent;
  let fixture: ComponentFixture<LhcItemChoiceAutocompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LhcItemChoiceAutocompleteComponent ],
      providers: [LhcDataService]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LhcItemChoiceAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('addOrRemoveSubGroups', () => {
    const answer = { code: 'car', text: 'Car' };
    let formData: jasmine.SpyObj<any>;
    let getLhcFormData: jasmine.Spy;

    beforeEach(() => {
      formData = jasmine.createSpyObj('formData', [
        'getLinkIdForMultiSelectSubGroup',
        'addSubItemsForMultiSelect',
        'deleteSubItemsForAutocomplete'
      ]);
      getLhcFormData = spyOn(component.lhcDataService, 'getLhcFormData').and.returnValue(formData);
    });

    it('should not create subgroups for a single answer with help text only', () => {
      // Importing a help-only child leaves an empty items array.
      component.item = {
        _multipleAnswers: false,
        codingInstructions: 'Choose a mode of transport.',
        value: answer,
        items: []
      };

      expect(() => component.addOrRemoveSubGroups()).not.toThrow();
      expect(getLhcFormData).not.toHaveBeenCalled();
    });

    it('should not create subgroups for a single answer with a child question', () => {
      component.item = {
        _multipleAnswers: false,
        value: answer,
        items: [{ linkId: 'travel-time', dataType: 'INT' }]
      };

      expect(() => component.addOrRemoveSubGroups()).not.toThrow();
      expect(getLhcFormData).not.toHaveBeenCalled();
    });

    it('should not create subgroups for multiple answers with empty child items', () => {
      component.item = { _multipleAnswers: true, value: [answer], items: [] };

      component.addOrRemoveSubGroups();

      expect(getLhcFormData).not.toHaveBeenCalled();
    });

    it('should not create subgroups for multiple answers without child items', () => {
      component.item = { _multipleAnswers: true, value: [answer] };

      component.addOrRemoveSubGroups();

      expect(getLhcFormData).not.toHaveBeenCalled();
    });

    it('should still create a subgroup for a selected multiple answer with child questions', () => {
      component.item = {
        _multipleAnswers: true,
        value: [answer],
        items: [{ linkId: 'travel-time', dataType: 'INT' }]
      };
      formData.getLinkIdForMultiSelectSubGroup.and.returnValue('multi-select-subgroup||car');

      component.addOrRemoveSubGroups();

      expect(formData.addSubItemsForMultiSelect).toHaveBeenCalledOnceWith(component.item, answer);
      expect(formData.deleteSubItemsForAutocomplete).not.toHaveBeenCalled();
    });

    it('should still remove subgroups when a multiple-answer selection is cleared', () => {
      const child = { linkId: 'travel-time', dataType: 'INT' };
      component.item = {
        _multipleAnswers: true,
        value: undefined,
        items: [
          { linkId: 'multi-select-subgroup||car', isSubGroupForMultiSelect: true },
          child
        ]
      };
      formData.deleteSubItemsForAutocomplete.and.callFake((item, index) => item.items.splice(index, 1));

      component.addOrRemoveSubGroups();

      expect(formData.deleteSubItemsForAutocomplete).toHaveBeenCalledOnceWith(component.item, 0);
      expect(component.item.items).toEqual([child]);
      expect(formData.addSubItemsForMultiSelect).not.toHaveBeenCalled();
    });
  });
});
