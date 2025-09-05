import { Component, computed, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { MatExpansionModule } from '@angular/material/expansion';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { AnalyticsMetadataService } from '../../service/analytics-metadata.service';
import { AnalyticsStateService } from '../../service/analytics-state.service';
import { FieldGroup, PivotFieldDto } from '../../models/pivot_field_dto.model';
import { ReactiveFormsModule } from '@angular/forms';
import { NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';

@Component({
  selector: 'app-field-picker',
  standalone: true,
  imports: [MatExpansionModule, MatInputModule, MatIconModule, MatListModule, ReactiveFormsModule, NgSwitch, NgSwitchCase, NgSwitchDefault],
  templateUrl: './field-picker.component.html',
})
export class FieldPickerComponent {
  templateId = input.required<string>();
  templateVersionId = input.required<string>();
  searchTerm = signal('');

  // a `computed` signal that automatically filters when dependencies change
  filteredGroups = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) {
      return this.allGroups();
    }
    return this.allGroups()
      .map(group => ({
        ...group,
        fields: group.fields.filter(field => field.label.toLowerCase().includes(term)),
      }))
      .filter(group => group.fields.length > 0);
  });

  // Inject services
  private metadataService = inject(AnalyticsMetadataService);
  private stateService = inject(AnalyticsStateService);

  // Convert the metadata Observable to a signal using `toSignal`
  private allGroups = toSignal(this.metadataService.getMetadata(this.templateId(), this.templateVersionId()), {
    initialValue: [] as FieldGroup[],
  });

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  onFieldSelected(field: PivotFieldDto): void {
    this.stateService.addField(field);
  }
}
