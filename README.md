# Datarun Analytics Grid

A front-end component for exploring analytics data from the **Datarun platform**.  
It provides a table and pivot-grid interface powered by the `/api/v1/analytics` endpoints.

## Features

- Fetches metadata dynamically to build field pickers
- Query builder for dimensions, measures, filters, and sorts
- Table mode (`TABLE_ROWS`) and Pivot mode (`PIVOT_MATRIX`)
- Interactive features: filtering, sorting, pagination
- Advanced UX: drill-downs, saved views, guided analytics hints
- Strong error handling with UI feedback

## Roadmap, and guides

- **[Datarun Analytics API Guide](api-guide/datarun-analytics-api-guide.md)**
- **[Datarun Angular Analytics Grid — Prioritized MVP Plan](api-guide/mvp-plan.md)**

## 🔗 Integration

This module is designed to slot into the broader **Datarun** system.  
All queries and metadata come from the analytics API: `/api/v1/analytics`.

## 📄 License

MIT
