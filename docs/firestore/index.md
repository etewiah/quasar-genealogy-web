# Firestore Backend — Overview

This section documents how to use Firebase (Firestore and/or Firebase Storage) as the backend for this genealogy app, replacing the current approach of bundling static GEDCOM data inside the JavaScript build.

## Contents

- [Approach A: Firebase Storage](approach-a-storage.md) — Store the raw `.ged` file in Firebase Storage and parse it client-side at runtime
- [Approach B: Firestore Structured Database](approach-b-firestore.md) — Parse the GEDCOM once and store each individual and family as a Firestore document
- [Migration Script](migration.md) — One-time script to read a `.ged` file and populate Firestore
- [Security & Access Control](security.md) — Firestore security rules for public and private trees

---

## Why move away from bundled static data?

The current architecture embeds the GEDCOM file directly inside the JavaScript bundle at build time. This has several problems:

- **The full dataset is publicly readable** — anyone who opens browser DevTools can fetch the JS bundle and extract the complete GEDCOM, including details about living relatives. See [Extracting Data from a Deployed Build](../extracting-deployed-data.md).
- **Updating the data requires a full rebuild and redeploy** — there is no way to add or edit records without touching the source code.
- **The entire dataset is downloaded on every page load** — the campbells.ged file is 5.9MB. A backend would let the app fetch only the ~20 documents needed for the current view.
- **No multi-user support** — there is no way for family members to contribute records or corrections.

---

## Comparison of approaches

| | Approach A (Storage) | Approach B (Firestore) |
|---|---|---|
| **What is stored** | Raw `.ged` file | Parsed individuals + families as documents |
| **Implementation effort** | Low (~1 day) | Medium (~3–5 days) |
| **Data loaded per page view** | Full file (5.9MB) | ~20–50 documents (~50KB) |
| **Queryable / filterable** | No | Yes |
| **Editable records** | No (replace whole file) | Yes (update individual documents) |
| **Fine-grained access control** | No | Yes (per-document security rules) |
| **Enables AI features** | Partially | Fully |
| **Enables editing UI** | No | Yes |
| **Best for** | Quick migration, read-only trees | Long-term foundation |

**Recommendation:** Approach B (Firestore structured database) for any tree intended for ongoing use. Approach A is a useful stepping stone if you want to move off static bundling quickly.

---

## Firebase free tier (Spark plan)

Both approaches work within Firebase's free Spark plan for a personal or small family genealogy site:

| Resource | Free limit | Campbells dataset usage |
|---|---|---|
| Firestore reads | 50,000 / day | ~30 per page view |
| Firestore writes | 20,000 / day | 4,822 one-time migration writes |
| Firestore storage | 1 GB | ~5MB for full dataset |
| Firebase Storage | 5 GB storage, 1 GB/day download | 5.9MB file |

A site receiving hundreds of daily visitors would stay well within the free tier. Thousands of daily visitors would likely require upgrading to the Blaze (pay-as-you-go) plan, where costs remain very low for this data size.

---

## The one key gotcha: Firestore document size limit

Firestore enforces a **1MB maximum per document**. Individual genealogy records are typically 1–5KB, well within the limit. The only potential concern is a family document with an unusually large `children` array or embedded notes — not a real issue for standard GEDCOM data.

The 1MB limit does mean you **cannot** store the full GEDCOM as a single Firestore document (the campbells.ged is 5.9MB). This is why Approach A uses Firebase Storage (which has no size limit on files) and Approach B splits the data across many small documents.
