# Analytics API: A Front-end Developer's Guide

## 1. Getting Started

This guide provides all the necessary information for a front-end developer to build a rich, interactive analytics and
pivot grid UI using the Datarun Analytics API.

### 1.1. Core Concepts

- **Field:** The central concept in the API. A Field is any piece of data you can query, filter on, or group by. It can
  be a system attribute like "Team" or a form question like "Age of Household Head".
- **Dimension:** A Field used to group or categorize your data (e.g., grouping by `Team`). Dimensions are the "rows"
  and "columns" of your analysis.
- **Measure:** A calculation performed on a Field (e.g., the `SUM` of "Quantity Issued"). Measures are the values within
  the cells of your analysis.
- **Standardized ID:** The unique, namespaced identifier for every Field (e.g., `core:team_uid`, `etc:CiEZemZ7mlg`). You
  will receive these from the metadata and use them in all query requests.

### 1.2. API Fundamentals

- **Base URL**: All API paths are relative to your deployed instance's base URL (e.g.,
  `https://your-datarun-instance.com`).
- **Authentication**: `POST {{baseUrl}}/api/v1/authenticate` with `{ "username": "user","password": "..." }` → returns `{ accessToken, refreshToken }`; store both.
  Send `Authorization: Bearer <accessToken>` on all API requests.
  On 401 `POST {{baseUrl}}/api/v1/authenticate/refresh` with `{ refreshToken }` to get new tokens and update auth state.

---

## 2. The Core Workflow: Building a Simple Data Table

The core workflow is a stateful loop: **Discover** available fields, **Query** for data, and **Render** the results. We
will start by building a basic, read-only data table.

### Step 1: Discover Available Fields (The Metadata Endpoint)

Before you can build a query, you need to know what fields are available for a given form. This is done by calling the
metadata endpoint.

**Endpoint:** `GET /api/v1/analytics/pivot/metadata`
**Parameters:** `templateId`, `templateVersionId`

```http
GET /api/v1/analytics/pivot/metadata?templateId=Tcf3Ks9ZRpB&templateVersionId=fb2GC7FInSu
```

The response is a single `PivotMetadataResponse` object containing an `availableFields` list. Each object in this list
is a self-describing **`PivotFieldDto`** that provides everything your UI needs to know about a field.

#### Example `PivotMetadataResponse`

```json
{
  "templateId": "Tcf3Ks9ZRpB",
  "templateVersionId": "fb2GC7FInSu",
  "availableFields": [
    {
      "id": "core:team_uid",
      "label": "Team",
      "dataType": "UID",
      "isDimension": true,
      "isSortable": true,
      "aggregationModes": [],
      "displayGroup": "System Fields",
      "extras": {
        "resolution": { "type": "API_ENDPOINT", "endpoint": "/api/v1/teams" }
      }
    },
    {
      "id": "core:parent_category_uid",
      "label": "Parent Category",
      "dataType": "UID",
      "isDimension": true,
      "isSortable": true,
      "aggregationModes": [],
      "displayGroup": "Hierarchies",
      "extras": {
        "resolution": { "type": "HIERARCHICAL", "childDimensionId": "core:child_category_uid" }
      }
    },
    {
      "id": "etc:income_main_earner",
      "label": "Household Income",
      "dataType": "NUMERIC",
      "isDimension": false,
      "isSortable": true,
      "aggregationModes": ["SUM", "AVG", "MIN", "MAX"],
      "displayGroup": "Household Financials",
      "extras": { "formatHint": "CURRENCY_USD" }
    },
    {
      "id": "core:submission_completed_at",
      "label": "Submission Date",
      "dataType": "TIMESTAMP",
      "isDimension": true,
      "isSortable": true,
      "aggregationModes": ["MIN", "MAX", "COUNT"],
      "displayGroup": "System Fields",
      "extras": { "formatHint": "SHORT_DATE" }
    },
    {
      "id": "de:completion_rate",
      "label": "Completion Rate",
      "dataType": "NUMERIC",
      "isDimension": false,
      "isSortable": true,
      "aggregationModes": ["AVG"],
      "displayGroup": "Submission Metrics",
      "extras": { "formatHint": "PERCENT" }
    }
  ]
}
```

#### Interpreting the `PivotFieldDto`

This object is the key to building a dynamic UI. Here is a breakdown of its properties and how to use them:

| Property            | Description                                                                                             | Frontend Implementation                                                                                                             |
| :------------------ | :------------------------------------------------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------- |
| `id`                | The unique Standardized ID for the field.                                                               | Use this ID in all API query requests (`dimensions`, `measures`, `filters`, `sorts`).                                               |
| `label`             | The human-readable name for the field.                                                                  | Display this in all UI pickers and column headers.                                                                                  |
| `dataType`          | The underlying data type (`NUMERIC`, `TEXT`, `UID`, etc.).                                              | Drives which filter operators and UI controls to show (e.g., a `TIMESTAMP` gets a date picker). See Appendix for full mapping.      |
| `isDimension`       | A boolean hint suggesting if the field is primarily used for grouping.                                  | Use this to pre-populate the "Dimensions" list, but any field can be used as a dimension.                                           |
| `aggregationModes`  | An array of valid aggregation functions (`SUM`, `COUNT`, etc.). If empty, it's not typically a measure. | Use this to populate the aggregation dropdown when a user drags this field into the "Measures" area.                                |
| `isSortable`        | An explicit boolean declaring if the API can sort by this field.                                        | If `true`, enable sorting controls (e.g., clickable column headers). If `false`, disable them.                                      |
| `displayGroup`      | A string used to group related fields in the UI.                                                        | Use this to build an organized field picker (e.g., with accordions or sections) instead of one long, flat list.                     |
| `extras.formatHint` | An optional string suggesting how to format the data for display.                                       | Apply formatting masks based on the hint (e.g., `CURRENCY_USD` -> `$1,234.50`, `PERCENT` -> `85.4%`).                               |
| `extras.resolution` | An object describing how to "resolve" the field's values (e.g., for filter dropdowns or interactions).  | Drives advanced interactivity. An `endpoint` tells you where to fetch values for a filter; a `childDimensionId` enables drill-down. |

### Step 2: Execute a Query for a Standard Table

Once the user has selected their desired dimensions and measures, you construct and send a query to the `query`
endpoint. For a standard grid, you will use `format=TABLE_ROWS`.

**Endpoint:** `POST /api/v1/analytics/pivot/query?format=TABLE_ROWS`

**Request Body (`PivotQueryRequest`)**
This is a minimal request to get the average income by team.

```json
{
  "templateId": "Tcf3Ks9ZRpB",
  "templateVersionId": "fb2GC7FInSu",
  "dimensions": ["core:team_uid"],
  "measures": [{ "fieldId": "etc:income_main_earner", "aggregation": "AVG", "alias": "avg_income" }]
}
```

**Response (`TABLE_ROWS` format)**
The response provides column definitions and a corresponding array of row data.

```json
{
  "columns": [
    { "id": "core:team_uid", "label": "Team", "dataType": "UID" },
    { "id": "avg_income", "label": "Avg Income", "dataType": "NUMERIC" }
  ],
  "rows": [
    { "core:team_uid": "tm12345abc", "avg_income": 45000.75 },
    { "core:team_uid": "tm67890xyz", "avg_income": 52100.5 }
  ],
  "total": 24
}
```

### Step 3: Render the Basic Grid

- Use the `columns` array to configure your grid's column definitions. The `id` property in each column object
  corresponds to the key in each `rows` object.
- Use the `rows` array as the data source for your grid component.
- The `total` property indicates the total number of rows available, which will be used for pagination.

At this point, you have a functional, read-only data table driven entirely by the API.

---

## 3. Enhancing the Grid: Interactivity

Now, let's use the metadata to add filtering, sorting, and pagination.

### 3.1. Filtering

The metadata tells you exactly how to build filter controls for any field.

1. **Select a Field:** When a user wants to filter by "Team" (`core:team_uid`).
2. **Inspect its Metadata:** Look at its `PivotFieldDto`.
   - The `dataType` (`UID`) tells you which operators are valid (`IN`, `=`, `!=`).
   - The `extras.resolution.endpoint` (`/api/v1/teams`) gives you the exact URL to call to get the list of available
     teams.
3. **Build the UI:** Use the data from the endpoint to populate a searchable dropdown.
4. **Update the Query:** Once the user makes a selection, add a `filter` object to your query request.

**Request with Filter:**

```json
{
  "filters": [{ "field": "core:team_uid", "op": "IN", "value": ["tm12345abc"] }]
}
```

### 3.2. Sorting

Add a `SortDto` object to the `sorts` array in your query. Use the `isSortable` flag from the metadata to determine if
the UI controls should be enabled.

```json
{
  "sorts": [{ "fieldOrAlias": "avg_income", "desc": true }]
}
```

### 3.3. Pagination

Use the `limit` and `offset` parameters to navigate through pages of data. The `total` from the response is used to calculate the total number of pages.

```json
{
  "limit": 50,
  "offset": 50
}
```

---

## 4. Polishing the UI: Data Presentation

With an interactive grid working, let's focus on making the data easy to understand.

### 4.1. Resolving UIDs to Names

The query response contains raw UIDs. To display friendly names (e.g., "Team Alpha" instead of "tm12345abc"), use the
batch resolution endpoint.

**Endpoint:** `POST /api/v1/resolveUids`

**Workflow:**

1. After a query returns, collect all unique UIDs from the result set.
2. Make a single batch request to this endpoint.
3. Use the returned map to replace UIDs with names in your grid's display layer.

**Request Body:**

```json
{
  "uids": ["tm12345abc", "tm67890xyz"]
}
```

**Response Body:**
A map of UID to its resolved name. If a UID cannot be found, it will be omitted from the response.

```json
{
  "tm12345abc": "Team Alpha",
  "tm67890xyz": "Team Bravo"
}
```

### 4.2. Applying Data Formats (`formatHint`)

Use the `formatHint` from the metadata to apply proper formatting to numeric and date values. This ensures data is
always presented in the correct business context.

| `formatHint` Value | Example Raw Value   | Suggested Rendering |
| :----------------- | :------------------ | :------------------ |
| `CURRENCY_USD`     | `1500.75`           | `$1,500.75`         |
| `PERCENT`          | `0.854`             | `85.4%`             |
| `SHORT_DATE`       | `2024-09-21T10:00Z` | `09/21/2024`        |

---

## 5. The Pivot Experience

For a true pivot table, use the `PIVOT_MATRIX` format. This format pre-aggregates data into a 2D matrix, which is ideal
for pivot grid components.

### 5.1. Querying with `PIVOT_MATRIX`

The request is similar, but you specify `rowDimensions` and `columnDimensions` instead of just `dimensions`.

**Endpoint:** `POST /api/v1/analytics/pivot/query?format=PIVOT_MATRIX`

**Request Body:**

```json
{
  "templateId": "dt123abc456",
  "rowDimensions": ["core:team_uid"],
  "columnDimensions": ["core:activity_name"],
  "measures": [{ "fieldId": "etc:etcZyx12346", "aggregation": "SUM", "alias": "total_sum" }]
}
```

### 5.2. Rendering the Pivot Matrix

The response contains headers and a 2D `cells` array.

**Response (`PIVOT_MATRIX`):**

```json
{
  "matrix": {
    "rowDimensionNames": ["core:team_uid"],
    "columnDimensionNames": ["core:activity_name"],
    "measureAliases": ["total_sum"],
    "rowHeaders": [["tm12345abc"], ["tm67890xyz"]],
    "columnHeaders": [["Activity A"], ["Activity B"]],
    "cells": [
      [{ "total_sum": 200 }, { "total_sum": 321 }],
      [{ "total_sum": 150 }, { "total_sum": 400 }]
    ]
  }
}
```

**Frontend Usage:**

- The `rowHeaders` array provides the values for the row axis.
- The `columnHeaders` array provides the values for the column axis.
- The `cells` data is a 2D array where `cells[i][j]` contains the measure values for the intersection of `rowHeaders[i]`
  and `columnHeaders[j]`.

---

## 6. Advanced Interaction Recipes

These patterns leverage the rich metadata to create a more powerful and intuitive UI.

### 6.1. Drill-Down on a Row or Cell

When a user clicks a cell, they expect to see the underlying data.

1. **Get Context:** The clicked row provides the context. For example, the user clicks a row where `team_uid` is
   `"tm12345abc"`.
2. **Construct New Query:** Clone the original query and add the context as a new `filter`. You can also add more
   granular dimensions (like `core:submission_uid`) to show the individual records.
3. **Execute and Render:** Display the results in a modal or a new view.

### 6.2. Hierarchical Drill-Down

If a field's metadata has a `resolution.type` of `HIERARCHICAL`, you can enable drilling up and down through a
hierarchy.

1. **Identify Field:** User right-clicks a row for "Parent Category" (`core:parent_category_uid`).
2. **Check Metadata:** Its metadata contains `"childDimensionId": "core:child_category_uid"`.
3. **Construct New Query:**
   - Replace `core:parent_category_uid` with `core:child_category_uid` in the `dimensions` array.
   - Add a filter: `{ "field": "core:parent_category_uid", "op": "=", "value": "<clicked_parent_uid>" }`.
4. **Execute:** The new query now shows the children of the selected parent.

### 6.3. Filtering by Aggregated Values (HAVING)

To filter on a calculated result (e.g., "show me teams with an average income > 50,000"), simply use the measure's
`alias` in a filter.

```json
{
  "measures": [{ "aggregation": "AVG", "alias": "avg_income", "fieldId": ".." }],
  "filters": [{ "field": "avg_income", "op": ">", "value": 50000 }]
}
```

Your UI's field picker for filters should include both dimensions and any user-defined measure aliases.

---

## 7. Essential Information

### 7.1. Error Handling

A `400 Bad Request` indicates a user input error (e.g., trying to SUM a non-numeric field). The response body will
contain details to help you highlight the error in the UI.

**Example Error Response (`400 Bad Request`)**

```json
{
  "status": 400,
  "message": "Validation failed for the query request.",
  "details": [
    {
      "field": "measures[0].aggregation",
      "value": "SUM",
      "issue": "Aggregation 'SUM' is not allowed for data type 'UID'."
    }
  ]
}
```

### 7.2. Appendix: Data Types and Operators

| `dataType`    | Supported Operators              | UI Control Suggestion    |
| :------------ | :------------------------------- | :----------------------- |
| **NUMERIC**   | `=`, `!=`, `>`, `<`, `>=`, `<=`  | Number Input             |
| **TEXT**      | `=`, `!=`, `LIKE`, `ILIKE`, `IN` | Text Input               |
| **BOOLEAN**   | `=`, `!=`                        | Toggle Switch / Dropdown |
| **TIMESTAMP** | `BETWEEN`, `>=`, `<=`            | Date/Time Range Picker   |
| **DATE**      | `BETWEEN`, `>=`, `<=`            | Date Range Picker        |
| **UID**       | `=`, `!=`, `IN`                  | Searchable Dropdown      |
| **OPTION**    | `=`, `!=`, `IN`                  | Multi-select Dropdown    |
