interface Measure {
  fieldId: string;
  aggregation: string; // e.g., 'SUM', 'AVG'
  alias: string;
}

interface PivotQueryRequest {
  templateId: string;
  templateVersionId: string;
  dimensions: string[];
  measures: Measure[];
  // filters, sorts, etc. will be added in later phases
}
