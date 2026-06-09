# PACKING_COMPONENT_REFERENCE

## Overview

This document catalogs all known components within the Packing feature.

Purpose:

* Document responsibilities
* Document dependencies
* Document component relationships
* Identify active and inactive components
* Support future refactoring

---

# Component Status Legend

| Status   | Meaning                                  |
| -------- | ---------------------------------------- |
| Active   | Currently used in the Packing experience |
| Inactive | Exists but not currently referenced      |
| Legacy   | Superseded by newer implementation       |
| Unknown  | Usage not yet verified                   |

---

# Active Components

---

# PackingBoard

## Status

```text
Active
```

## Location

```text
features/packing/components/packing-board.tsx
```

## Purpose

Root orchestration component.

Coordinates:

* Data loading
* State management
* Weather integration
* Progress calculations
* Mutations
* Error recovery

---

## Responsibilities

### Load Trip Data

Uses:

```ts
getTripForPacking()
```

---

### Load Weather

Uses:

```ts
getTripWeatherSummary()
```

---

### Load Packing Lists

Uses:

```ts
getPackingLists()
```

---

### Load Packing Items

Uses:

```ts
getPackingItems()
```

---

### Manage Mutations

Uses:

```ts
togglePackedItem()
archivePackingList()
hidePackingItem()
updatePackingItemQuantity()
```

---

## Child Components

```text
PackingTripHero
PackingSpaceSelector
CreatePackingListButton
PackingListCard
FloatingAddPackingItemButton
PackingBoardSkeleton
```

---

## Used By

```text
app/trips/[id]/packing/page.tsx
```

---

# PackingTripHero

## Status

```text
Active
```

## Location

```text
features/packing/components/packing-trip-hero.tsx
```

## Purpose

Displays trip context and overall packing progress.

---

## Responsibilities

* Destination display
* Trip image
* Weather display
* Trip duration
* Progress display
* Back navigation

---

## Props

```ts
tripId
title
destination
days
nights
imageUrl
temperature
weatherLabel
rainChance
packedCount
totalCount
```

---

## Used By

```text
PackingBoard
```

---

# PackingSpaceSelector

## Status

```text
Active
```

## Location

```text
features/packing/components/packing-space-selector.tsx
```

## Purpose

Primary navigation for packing spaces.

---

## Responsibilities

* Switch active space
* Create new space
* Prevent duplicate templates
* Configure smart suggestions

---

## Creates

```text
Packing Lists
Suggested Packing Items
```

---

## Dependencies

```ts
createPackingList()
createSuggestedPackingItems()
getSuggestedItemsForList()
```

---

## Used By

```text
PackingBoard
```

---

# CreatePackingListButton

## Status

```text
Active
```

## Location

```text
features/packing/components/create-packing-list-button.tsx
```

## Purpose

First-run onboarding when no packing spaces exist.

---

## Responsibilities

* Create initial packing space

---

## Used By

```text
PackingBoard
```

Condition:

```text
Only shown when no packing lists exist.
```

---

# PackingListCard

## Status

```text
Active
```

## Location

```text
features/packing/components/packing-list-card.tsx
```

## Purpose

Render the currently selected packing space.

---

## Responsibilities

### Empty State

Shows:

```text
SmartSuggestionsPrompt
```

---

### Populated State

Groups items by category.

Renders:

```text
PackingCategorySection
```

---

### List Removal

Triggers:

```text
archivePackingList()
```

---

## Child Components

```text
SmartSuggestionsPrompt
PackingCategorySection
```

---

## Used By

```text
PackingBoard
```

---

# SmartSuggestionsPrompt

## Status

```text
Active
```

## Location

```text
features/packing/components/smart-suggestions-prompt.tsx
```

## Purpose

Generate starter packing recommendations.

---

## Responsibilities

### Climate Selection

```text
Hot
Cold
Rainy
```

---

### Environment Selection

```text
City
Beach
Mountain
```

---

### Trip Style Selection

```text
Business
Traveling with kids
```

---

### Suggestion Generation

Uses:

```ts
getSuggestedItemsForList()
```

---

### Item Creation

Uses:

```ts
createSuggestedPackingItems()
```

---

## Used By

```text
PackingListCard
```

---

# PackingCategorySection

## Status

```text
Active
```

## Location

```text
features/packing/components/packing-category-section.tsx
```

## Purpose

Display a category of packing items.

---

## Responsibilities

* Category title
* Progress display
* Collapse/expand
* Item rendering

---

## Child Components

```text
PackingItemRow
```

---

## Used By

```text
PackingListCard
```

---

# PackingItemRow

## Status

```text
Active
```

## Location

```text
features/packing/components/packing-item-row.tsx
```

## Purpose

Render a single packing item.

---

## Responsibilities

### Packed State

```text
Packed
Unpacked
```

---

### Quantity Controls

```text
Increase
Decrease
```

---

### Swipe Removal

Uses:

```text
Framer Motion
```

---

### Completion Display

Visual packed state.

---

## Used By

```text
PackingCategorySection
```

---

# FloatingAddPackingItemButton

## Status

```text
Active
```

## Location

```text
features/packing/components/floating-add-packing-item-button.tsx
```

## Purpose

Create custom packing items.

---

## Responsibilities

### Item Creation

Uses:

```ts
createPackingItem()
```

---

### Category Selection

Supports:

```text
Essentials
Clothing
Tech
Toiletries
Documents
Health
Other
```

Plus discovered categories from existing items.

---

## Used By

```text
PackingBoard
```

---

# PackingBoardSkeleton

## Status

```text
Active
```

## Location

```text
features/packing/components/packing-board-skeleton.tsx
```

## Purpose

Loading state UI.

---

## Responsibilities

Display placeholders during:

```text
Trip Loading
Packing Loading
```

---

## Used By

```text
PackingBoard
```

---

# Inactive Components

---

# AddPackingItemForm

## Status

```text
Inactive
```

## Location

```text
features/packing/components/add-packing-item-form.tsx
```

## Usage Verification

Search result:

```text
No references found
```

---

## Purpose

Legacy item creation form.

---

## Likely Replaced By

```text
FloatingAddPackingItemButton
```

---

# PackingHeader

## Status

```text
Inactive
```

## Location

```text
features/packing/components/packing-header.tsx
```

## Usage

Not currently referenced.

---

## Likely Replaced By

```text
PackingTripHero
```

---

# PackingSpaceSummary

## Status

```text
Inactive
```

## Location

```text
features/packing/components/packing-space-summary.tsx
```

## Usage

Not currently referenced.

---

## Notes

Implementation appears incomplete.

---

# PackingFocusCard

## Status

```text
Inactive
```

## Location

```text
features/packing/components/packing-focus-card.tsx
```

## Usage

Not currently referenced.

---

## Purpose

Focus-oriented packing assistance.

Contains concepts such as:

```text
Today's Focus
Priority Items
Remaining Essentials
```

---

## Future Potential

Could support:

```text
Packing Readiness
Smart Prioritization
Pre-Departure Checklist
```

---

# NewPackingListButton

## Status

```text
Inactive
```

## Location

```text
features/packing/components/new-packing-list-button.tsx
```

## Usage

Not currently referenced.

---

## Likely Replaced By

```text
PackingSpaceSelector
```

---

# Component Dependency Map

```text
PackingPage
    │
    ▼
PackingBoard
    │
    ├── PackingTripHero
    │
    ├── PackingSpaceSelector
    │
    ├── CreatePackingListButton
    │
    ├── PackingListCard
    │       │
    │       ├── SmartSuggestionsPrompt
    │       │
    │       └── PackingCategorySection
    │               │
    │               └── PackingItemRow
    │
    ├── FloatingAddPackingItemButton
    │
    └── PackingBoardSkeleton
```

---

# Refactoring Candidates

## High Confidence

Potential removal candidates:

```text
AddPackingItemForm
PackingHeader
PackingSpaceSummary
NewPackingListButton
```

---

## Requires Product Decision

```text
PackingFocusCard
```

May represent unfinished future functionality.

---

# Known Gaps

## Not Yet Verified

The following remain undocumented:

* Internal implementation of PackingBoardSkeleton
* Original intent behind PackingFocusCard
* Historical migration path from old packing system
* Any external consumers of inactive components

Further investigation required before removal.
