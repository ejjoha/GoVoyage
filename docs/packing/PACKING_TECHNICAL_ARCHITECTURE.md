# PACKING_TECHNICAL_ARCHITECTURE

## Overview

This document describes the technical architecture of the Travel Organizer Packing feature.

The Packing feature is a trip-scoped packing management system built with:

* Next.js
* TypeScript
* Supabase
* React
* Framer Motion

The feature combines:

* Multi-list packing management
* Smart packing recommendations
* Weather-aware suggestions
* Collaborative trip access
* Progress tracking

This document focuses on implementation architecture rather than user-facing functionality.

---

# System Architecture

## High-Level Architecture

```text
User
 │
 ▼
Packing Route
 │
 ▼
PackingBoard
 │
 ├── Query Layer
 │       ├── Trip
 │       ├── Packing Lists
 │       ├── Packing Items
 │       └── Weather
 │
 ├── State Management
 │
 ├── Component Layer
 │
 └── Mutation Layer
         │
         ▼
      Supabase
```

---

# Route Architecture

## Entry Route

```text
app/trips/[id]/packing/page.tsx
```

### Responsibility

The route is intentionally thin.

Responsibilities:

* Read trip ID from route
* Convert ID to number
* Render PackingBoard

Implementation flow:

```text
Route Parameter
    ↓
tripId
    ↓
PackingBoard
```

No business logic is executed at route level.

No data loading occurs at route level.

---

# Feature Boundary

## Feature Root

```text
features/packing
```

### Structure

```text
features/packing
│
├── components
├── lib
└── types
```

---

# Frontend Architecture

## Root Component

```text
PackingBoard
```

Location:

```text
features/packing/components/packing-board.tsx
```

### Responsibilities

PackingBoard acts as the orchestration layer.

Responsibilities include:

* Data loading
* State management
* Weather integration
* Progress calculations
* Optimistic updates
* Component coordination
* Error recovery

The remainder of the feature is driven through props and callbacks.

---

# Component Architecture

## Active Component Tree

```text
PackingPage
│
└── PackingBoard
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
    ├── PackingBoardSkeleton
    │
    └── Remove Item Modal
```

---

# State Management

## Strategy

The Packing feature currently uses local React state.

No global state management solution has been verified.

Examples:

```text
useState
useEffect
useMemo
```

---

## Core State

### Packing Lists

```ts
lists
```

Stores active packing spaces.

---

### Packing Items

```ts
itemsByList
```

Stores packing items grouped by list.

Structure:

```text
List ID
    ↓
Array<PackingListItem>
```

---

### Active List

```ts
activeListId
```

Tracks selected packing space.

---

### Trip

```ts
trip
```

Stores loaded trip metadata.

---

### Weather

```ts
weatherSummary
```

Stores weather intelligence output.

---

### UI State

```ts
loading
itemPendingRemove
resetSwipeKey
```

Used for:

* Loading state
* Remove confirmation
* Swipe reset handling

---

# Data Flow

## Initial Load

```text
PackingBoard
    │
    ▼
getTripForPacking()
    │
    ▼
Trip Loaded
    │
    ▼
getTripWeatherSummary()
    │
    ▼
Weather Loaded
    │
    ▼
getPackingLists()
    │
    ▼
Lists Loaded
    │
    ▼
getPackingItems()
    │
    ▼
Items Loaded
```

---

## Render Flow

```text
Trip
+ Weather
+ Lists
+ Items
        ↓
PackingBoard
        ↓
Child Components
```

---

# Query Layer

## File

```text
features/packing/lib/packing-queries.ts
```

## Responsibilities

Read-only data access.

### Functions

```ts
getTripForPacking()
getPackingLists()
getPackingItems()
getTripMembers()
```

---

## Query Pattern

All queries use:

```ts
supabase
    .from(...)
    .select(...)
```

and throw on Supabase errors.

---

# Mutation Layer

## File

```text
features/packing/lib/packing-mutations.ts
```

### Responsibilities

Write operations.

---

## Functions

```ts
createPackingList()
createPackingItem()
togglePackedItem()
archivePackingList()
createSuggestedPackingItems()
updatePackingItemQuantity()
hidePackingItem()
```

---

# Optimistic Update Strategy

The feature uses optimistic UI updates.

Pattern:

```text
Update Local State
        ↓
Execute Mutation
        ↓
Success
        ↓
Keep State
```

Failure:

```text
Update Local State
        ↓
Mutation Fails
        ↓
Reload Packing Data
```

This approach is used for:

* Toggle packed
* Quantity changes
* Remove item
* Archive list

---

# Database Architecture

## Core Tables

```text
packing_lists
packing_list_items
```

---

## Relationship Model

```text
Trip
 │
 └── Packing List
          │
          └── Packing Item
```

Database relationships:

```text
trips
    └── packing_lists
            └── packing_list_items
```

---

# Domain Model

## Packing List

Purpose:

Represents a packing space.

Examples:

```text
My List
Carry-on
Shared Bag
Kids List
```

---

## Packing Item

Purpose:

Represents a single item to be packed.

Examples:

```text
Passport
Laptop
Toothbrush
Swimsuit
```

---

# Smart Suggestion Architecture

## Overview

Suggestions are generated in application code.

No AI model is currently involved.

---

## Files

```text
packing-template-engine.ts
packing-suggestions.ts
```

---

## Generation Pipeline

```text
Base Items
        +
Climate Suggestions
        +
Environment Suggestions
        +
Trip Style Suggestions
        ↓
Merge
        ↓
Deduplicate
        ↓
Quantity Calculation
        ↓
Suggested Items
```

---

# Template Engine

## Responsibilities

Defines:

* Recommendation items
* Categories
* Quantity rules
* Profile mappings

---

## Supported Inputs

### Climate

```text
Hot
Cold
Rainy
```

### Environment

```text
City
Beach
Mountain
```

### Trip Style

```text
Business
Traveling with kids
```

---

# Quantity Engine

## Function

```ts
getSmartQuantity()
```

### Rules

```text
fixed
perDay
perNight
everyTwoDays
weekly
tripDaysMinusOne
onePerOutfitDay
```

---

# Weather Intelligence Architecture

## File

```text
weather-intelligence.ts
```

---

## External Services

### Geocoding

```text
Open-Meteo Geocoding API
```

### Forecast

```text
Open-Meteo Forecast API
```

---

## Flow

```text
Destination
    ↓
Geocode
    ↓
Forecast
    ↓
Temperature
Rain Probability
Weather Code
    ↓
Climate Profiles
```

---

## Output

```ts
TripWeatherSummary
```

Contains:

```text
locationName
temperature
precipitationProbability
weatherLabel
suggestedProfiles
```

---

# Packing Space Architecture

## Concept

The user-facing concept is a Packing Space.

Internally:

```text
Packing Space
=
Packing List
```

Each space has:

```text
Type
Emoji
Items
Progress
Suggestions
```

---

# Item Organization

## Grouping

Items are grouped by:

```text
category
```

Grouping occurs in:

```text
PackingListCard
```

---

## Category Rendering

```text
Category
    ↓
PackingCategorySection
    ↓
PackingItemRow
```

---

# Interaction Architecture

## Toggle Packed

```text
User Action
    ↓
PackingItemRow
    ↓
PackingBoard
    ↓
togglePackedItem()
```

---

## Quantity Update

```text
User Action
    ↓
PackingItemRow
    ↓
PackingBoard
    ↓
updatePackingItemQuantity()
```

---

## Remove Item

```text
Swipe Left
    ↓
Confirmation Modal
    ↓
hidePackingItem()
```

---

## Archive List

```text
Remove List
    ↓
archivePackingList()
```

---

# Security Architecture

## Authentication

Packing uses:

```text
Supabase Auth
```

through the browser client.

---

## Authorization

Authorization is enforced through RLS.

Packing does not implement a separate permission layer.

---

## Access Function

```sql
user_can_access_trip()
```

Access is granted when the user:

* Owns the trip
* Is an active collaborator
* Has a pending invite
* Has an accepted invite

---

# Error Handling

## Query Failures

Queries:

```text
Log Error
Throw Error
```

---

## Mutation Failures

Mutations:

```text
Log Error
Reload Packing Data
```

---

## Weather Failures

Weather failures:

```text
Return null
Continue Rendering
```

Packing remains usable without weather data.

---

# Loading Architecture

## Skeleton State

Component:

```text
PackingBoardSkeleton
```

Shown while initial data loads.

Provides:

* Hero placeholder
* Progress placeholder
* Space selector placeholder
* List placeholder

---

# Active Components

Confirmed active:

```text
PackingBoard
PackingTripHero
PackingSpaceSelector
CreatePackingListButton
PackingListCard
SmartSuggestionsPrompt
PackingCategorySection
PackingItemRow
FloatingAddPackingItemButton
PackingBoardSkeleton
```

---

# Inactive Components

Confirmed unused or dormant:

```text
AddPackingItemForm
PackingHeader
PackingSpaceSummary
PackingFocusCard
NewPackingListButton
```

These should be evaluated before future refactoring.

---

# Known Technical Debt

## Type Inconsistency

Verified inconsistency:

```text
PackingItemSource
    template

Template Engine Type
    personal
```

The template engine should align with the database and shared type definitions.

---

## Schema Source Control

Packing schema exists in Supabase but is not represented in local migrations.

Future improvement:

```text
Add schema creation and RLS policies to migration files.
```

---

# Future Architecture Considerations

Potential future enhancements:

* Server-side data loading
* Weather caching
* Drag-and-drop sorting
* Item assignment workflows
* Suggestion previews
* Recovery views for archived content
* Real trip-date weather forecasts
* Consolidated domain service layer
* Stronger type reuse across template engine and database models

```
```
