# Angular changes/deprecations as of v19

This section covers major to minor changes introduced between Angular v16 and v19 that may affect
application codebases, which uses Angular v19.2.9, ordered from _major_ to _minor_

## 🧭 Core Things to Learn & Use

1. **Standalone-First Mentality**
   - No `AppModule` by default → apps boot with `bootstrapApplication()` and `ApplicationConfig`.
   - Put `provideHttpClient()`, `provideRouter(routes)`, and `provideAnimations()` in `app.config.ts`.
   - Modules still exist, but treat them as legacy/compatibility only.
2. **New Control Flow Blocks**

   - Use `@if`, `@for`, `@switch` instead of `*ngIf`, `*ngFor`, `*ngSwitch`.
   - Cleaner, more powerful (block scoping, better ergonomics).

3. **HTTP API Changes**

   - Import with `provideHttpClient()` instead of `HttpClientModule`.
   - Similar for testing: `provideHttpClientTesting()`.

4. **Routing in Standalone**

   - Define routes in `app.routes.ts`.
   - Provide them via `provideRouter(routes)` in `app.config.ts`.

5. **Angular Material / CDK Migration**

   - Use MDC/M3 components (not legacy).
   - DOM/CSS might differ from older docs/tutorials — double-check before copy-pasting.

---

## ⚡ Secondary But Important

1. **SSR + Hydration**

   - If your project will use SSR, Angular now has hydration + event replay built-in.
   - It’s more robust, but you’ll need to test carefully if you depend on SSR side-effects.

2. **Stricter Type & Template Checking**

   - Angular 19 surfaces more compile-time issues.
   - Don’t suppress warnings: they usually reveal actual problems.

3. **Updated Tooling Expectations**

   - Node.js: must match Angular’s compatibility table.
   - TypeScript: v5.8+
   - RxJS: latest v7.8.

4. **Small Quality-of-Life Changes**

   - `style` / `styleUrl` shorthand.
   - Boolean attribute coercion.
   - HMR enabled by default.
   - File naming guidance changed (`.component` suffix optional).

---

## Angular Signals and related APIs

**Angular introduction to Signals and related APIs** (e.g. `signal()`, `computed()`, `effect()`, plus utilities like `model()` and
`resource()`):

- Signals + helpers are now **the recommended default reactivity model**.
- Many new CLI schematics suggest signals-first patterns.
- Added **signal-based forms utilities** and further interop improvements with RxJS (`toSignal`, `toObservable`).
- New `input()` and `output()` helpers for components (preferred over older apis) , designed as signal-powered
  replacements for `@Input()`/`@Output()`.

---

## 🛠 Workflow & Mindset

- **Think in Standalone Components, not Modules** — your mental model should shift toward tree-shakable,
  provider-in-config patterns.
- **Prefer the new recommended APIs Over the Older** prefer Signals and helpers (i.e. `input()` and `output()`) over
  older APIs when needed.
