import { computed, effect, Injectable, signal } from '@angular/core';
import { PivotFieldDto } from '../models/pivot_field_dto.model';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsStateService {
  // === PUBLIC COMPUTED (READ-ONLY) SIGNALS ===
  // This signal automatically computes the API request body whenever any of its
  // dependencies (dimensions, measures, etc.) change.
  public queryRequest = computed<PivotQueryRequest | null>(() => {
    // Only build the request if we have the necessary info
    if (!this.templateId() || !this.templateVersionId() || (this.dimensions().length === 0 && this.measures().length === 0)) {
      return null;
    }

    return {
      templateId: this.templateId(),
      templateVersionId: this.templateVersionId(),
      dimensions: this.dimensions().map(d => d.id),
      measures: this.measures(),
    };
  });

  // === PRIVATE WRITABLE SIGNALS ===
  // These are the core state variables managed by this service.
  private dimensions = signal<PivotFieldDto[]>([]);
  private measures = signal<Measure[]>([]);
  // We'll set these from the main component later
  private templateId = signal<string>('');
  private templateVersionId = signal<string>('');

  // A constructor with an `effect` to debug reactive state changes.
  constructor() {
    effect(() => {
      // eslint-disable-next-line no-console
      console.log('Query Request Body Updated:', this.queryRequest());
    });
  }

  // === PUBLIC METHODS (ACTIONS) ===
  // This will be called by our main analytics component to initialize the state
  setTemplate(templateId: string, versionId: string): void {
    this.templateId.set(templateId);
    this.templateVersionId.set(versionId);
  }

  addField(field: PivotFieldDto): void {
    // The API guide says `isDimension` is a "hint". We'll use it as a default.
    // Fields with aggregation modes are treated as measures.
    if (field.aggregationModes.length > 0 && !field.isDimension) {
      // For now, default to the first available aggregation mode.
      const newMeasure: Measure = {
        fieldId: field.id,
        aggregation: field.aggregationModes[0],
        alias: `${field.id}_${field.aggregationModes[0].toLowerCase()}`,
      };
      this.measures.update(current => [...current, newMeasure]);
    } else {
      this.dimensions.update(current => [...current, field]);
    }
  }
}
