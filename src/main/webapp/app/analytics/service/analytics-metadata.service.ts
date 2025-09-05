// src/app/analytics/services/analytics-metadata.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';
import { FieldGroup, PivotFieldDto } from '../models/pivot_field_dto.model';
import { ApplicationConfigService } from '../../core/config/application-config.service';

@Injectable({ providedIn: 'root' })
export class AnalyticsMetadataService {
  private readonly http = inject(HttpClient);
  private readonly applicationConfigService = inject(ApplicationConfigService);
  private readonly resourceUrl = this.applicationConfigService.getEndpointFor('/api/v1/analytics/pivot/metadata');

  // A simple in-memory cache to store the Observable for each template version.
  private cache = new Map<string, Observable<FieldGroup[]>>();

  /**
   * Fetches, transforms, and caches the pivot metadata for a given template.
   * @param templateId The ID of the template.
   * @param versionId The version ID of the template.
   * @returns An Observable emitting an array of grouped fields for the UI.
   */
  getMetadata(templateId: string, versionId: string): Observable<FieldGroup[]> {
    const cacheKey = `${templateId}:${versionId}`;
    if (!this.cache.has(cacheKey)) {
      const request$ = this.http
        .get<{ availableFields: PivotFieldDto[] }>(this.resourceUrl, {
          params: { templateId, templateVersionId: versionId },
        })
        .pipe(
          map(response => this.groupFieldsByDisplayGroup(response.availableFields)),
          shareReplay(1),
        );
      this.cache.set(cacheKey, request$);
    }
    return this.cache.get(cacheKey)!;
  }

  /**
   * Transforms a flat array of fields into an array of groups.
   */
  private groupFieldsByDisplayGroup(pivotFields: PivotFieldDto[]): FieldGroup[] {
    const grouped = pivotFields.reduce<Record<string, PivotFieldDto[]>>((acc, field) => {
      // Ensure the group array exists before pushing to it.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      (acc[field.displayGroup] = acc[field.displayGroup] || []).push(field);
      return acc;
    }, {});

    // Convert the record object into the FieldGroup[] array structure.
    return Object.entries(grouped).map(([groupName, fields]) => ({
      groupName,
      fields,
    }));
  }
}
