/**
 * Represents the detailed metadata for a single queryable field, as returned by the API.
 */
export interface PivotFieldDto {
  id: string;
  label: string;
  dataType: 'NUMERIC' | 'TEXT' | 'BOOLEAN' | 'TIMESTAMP' | 'DATE' | 'UID' | 'OPTION';
  isDimension: boolean;
  isSortable: boolean;
  aggregationModes: string[];
  displayGroup: string;
  extras: {
    formatHint?: string;
    resolution?: {
      type: 'API_ENDPOINT' | 'HIERARCHICAL';
      endpoint?: string;
      childDimensionId?: string;
    };
  };
}

/**
 * A UI-friendly structure for grouping fields under a common name (e.g., "System Fields").
 */
export interface FieldGroup {
  groupName: string;
  fields: PivotFieldDto[];
}
