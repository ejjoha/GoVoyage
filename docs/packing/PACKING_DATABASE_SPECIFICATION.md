# PACKING_DATABASE_SPECIFICATION

## Overview

This document defines the database architecture for the Travel Organizer Packing feature.

The Packing system is built around two primary tables:

```text
packing_lists
packing_list_items
```

These tables are trip-scoped and inherit access control from the Trip security model through Supabase Row Level Security (RLS).

---

# Database Design Goals

The database design supports:

* Multiple packing spaces per trip
* Multiple items per packing space
* Collaborative trip packing
* Smart suggestion generation
* Progress tracking
* Soft deletion
* Future assignment workflows

---

# Entity Relationship Diagram

```text
auth.users
    │
    ├── packing_lists.created_by
    │
    ├── packing_list_items.added_by
    │
    └── packing_list_items.packed_by


trips
    │
    └── packing_lists
            │
            └── packing_list_items


trip_members
    │
    ├── packing_lists.member_id
    │
    └── packing_list_items.responsible_member_id
```

---

# Table: packing_lists

## Purpose

Stores packing spaces for a trip.

User-facing examples:

```text
My List
Carry-on
Shared Bag
Kids List
```

Each record represents a single packing space.

---

## Columns

| Column     | Type        | Nullable | Default           |
| ---------- | ----------- | -------- | ----------------- |
| id         | uuid        | No       | gen_random_uuid() |
| trip_id    | bigint      | No       | —                 |
| member_id  | bigint      | Yes      | —                 |
| title      | text        | No       | —                 |
| type       | text        | No       | —                 |
| emoji      | text        | Yes      | —                 |
| color      | text        | Yes      | —                 |
| created_by | uuid        | Yes      | —                 |
| archived   | boolean     | No       | false             |
| sort_order | integer     | No       | 0                 |
| created_at | timestamptz | No       | now()             |
| updated_at | timestamptz | No       | now()             |

---

## Column Definitions

### id

Unique identifier for the packing list.

---

### trip_id

References the parent trip.

Every packing list belongs to exactly one trip.

---

### member_id

Optional relationship to a trip member.

Potential future use:

```text
Owner
Responsible Traveler
Assigned User
```

Current behavior not fully verified.

---

### title

User-visible packing space name.

Examples:

```text
My List
Carry-on
Shared Bag
Kids List
```

---

### type

Packing list classification.

Allowed values:

```text
personal
shared
luggage
activity
```

Enforced by database constraint.

---

### emoji

Optional icon displayed in the UI.

Examples:

```text
🧳
🎒
👜
🧸
```

---

### color

Optional future visual customization field.

Current UI usage not verified.

---

### created_by

User who created the packing list.

References:

```text
auth.users.id
```

---

### archived

Soft-delete flag.

Archived lists are excluded from active queries.

---

### sort_order

Controls display ordering.

Current UI reordering not verified.

---

### created_at

Creation timestamp.

---

### updated_at

Last update timestamp.

---

# Constraints: packing_lists

## Primary Key

```sql
PRIMARY KEY (id)
```

---

## Foreign Keys

### Trip Relationship

```sql
trip_id
→ trips(id)
ON DELETE CASCADE
```

Behavior:

Deleting a trip removes all packing lists.

---

### Member Relationship

```sql
member_id
→ trip_members(id)
ON DELETE SET NULL
```

Behavior:

Deleting a member does not delete packing lists.

---

### User Relationship

```sql
created_by
→ auth.users(id)
```

---

## Check Constraint

### Allowed Types

```sql
CHECK (
  type IN (
    'personal',
    'shared',
    'luggage',
    'activity'
  )
)
```

---

# Table: packing_list_items

## Purpose

Stores individual packing items.

Examples:

```text
Passport
Phone Charger
Swimsuit
Laptop
Travel Adapter
```

Each item belongs to a single packing list.

---

## Columns

| Column                | Type        | Nullable | Default           |
| --------------------- | ----------- | -------- | ----------------- |
| id                    | uuid        | No       | gen_random_uuid() |
| packing_list_id       | uuid        | No       | —                 |
| name                  | text        | No       | —                 |
| category              | text        | No       | —                 |
| quantity              | integer     | No       | 1                 |
| packed                | boolean     | No       | false             |
| packed_at             | timestamptz | Yes      | —                 |
| packed_by             | uuid        | Yes      | —                 |
| responsible_member_id | bigint      | Yes      | —                 |
| source                | text        | No       | 'custom'          |
| notes                 | text        | Yes      | —                 |
| protected             | boolean     | No       | false             |
| hidden                | boolean     | No       | false             |
| sort_order            | integer     | No       | 0                 |
| added_by              | uuid        | Yes      | —                 |
| created_at            | timestamptz | No       | now()             |
| updated_at            | timestamptz | No       | now()             |

---

# Column Definitions

## packing_list_id

Parent packing list.

Each item belongs to exactly one list.

---

## name

User-visible item name.

Examples:

```text
Passport
Laptop
Toothbrush
```

---

## category

Used for grouping and display.

Examples:

```text
Essentials
Clothing
Tech
Toiletries
Documents
Health
```

Additional categories may be generated by templates.

---

## quantity

Number of items required.

Examples:

```text
5 Shirts
3 Pairs of Socks
```

---

## packed

Completion state.

```text
true
false
```

---

## packed_at

Timestamp recorded when item becomes packed.

Cleared when item becomes unpacked.

---

## packed_by

User who marked the item packed.

References:

```text
auth.users.id
```

---

## responsible_member_id

Optional assignment field.

Potential future use:

```text
Packing responsibility
Delegated ownership
```

Current UI behavior not verified.

---

## source

Indicates item origin.

Allowed values:

```text
custom
suggested
template
```

---

## notes

Optional free-text notes.

Current UI implementation not verified.

---

## protected

Marks important recommendation items.

Examples may include:

```text
Passport
Wallet
Phone
Prescription Medicine
```

Exact behavior not yet verified.

---

## hidden

Soft-delete flag.

Hidden items are excluded from active queries.

---

## sort_order

Ordering field.

Current manual ordering not verified.

---

## added_by

User who created the item.

References:

```text
auth.users.id
```

---

# Constraints: packing_list_items

## Primary Key

```sql
PRIMARY KEY (id)
```

---

## Foreign Keys

### Packing List

```sql
packing_list_id
→ packing_lists(id)
ON DELETE CASCADE
```

Deleting a list removes all items.

---

### Responsible Member

```sql
responsible_member_id
→ trip_members(id)
ON DELETE SET NULL
```

---

### Added By

```sql
added_by
→ auth.users(id)
```

---

### Packed By

```sql
packed_by
→ auth.users(id)
```

---

## Check Constraint

### Allowed Sources

```sql
CHECK (
  source IN (
    'suggested',
    'custom',
    'template'
  )
)
```

---

# Row Level Security (RLS)

## Overview

Both packing tables use Supabase Row Level Security.

Access is granted only to authenticated users with trip access.

---

# Access Function

## user_can_access_trip()

Packing authorization is inherited from the trip permission model.

Access is granted when the user:

### Owns the Trip

```sql
trips.user_id = auth.uid()
```

---

### Is an Active Collaborator

```sql
trip_collaborators.user_id = auth.uid()
AND active = true
```

---

### Has a Pending Invite

```sql
trip_invites.email = auth.jwt()->>'email'
AND status = 'pending'
```

---

### Has an Accepted Invite

```sql
trip_invites.email = auth.jwt()->>'email'
AND status = 'accepted'
```

---

# RLS Policies: packing_lists

## SELECT

```text
Trip users can read packing lists
```

Condition:

```sql
user_can_access_trip(trip_id)
```

---

## INSERT

```text
Trip users can create packing lists
```

Condition:

```sql
user_can_access_trip(trip_id)
```

---

## UPDATE

```text
Trip users can update packing lists
```

Condition:

```sql
user_can_access_trip(trip_id)
```

---

## DELETE

```text
Trip users can delete packing lists
```

Condition:

```sql
user_can_access_trip(trip_id)
```

---

# RLS Policies: packing_list_items

Authorization is derived through the parent packing list.

## SELECT

Users may read items when:

```sql
packing_list_items
→ packing_lists
→ trip_id
→ user_can_access_trip(trip_id)
```

---

## INSERT

Users may create items under accessible packing lists.

---

## UPDATE

Users may update items under accessible packing lists.

---

## DELETE

Users may delete items under accessible packing lists.

---

# Query Behavior

## Active Packing Lists

Current application queries filter:

```sql
archived = false
```

Archived lists remain in the database.

---

## Active Packing Items

Current application queries filter:

```sql
hidden = false
```

Hidden items remain in the database.

---

# Soft Deletion Model

## Packing Lists

Instead of deleting:

```sql
archived = true
```

---

## Packing Items

Instead of deleting:

```sql
hidden = true
```

---

# Current Database Assumptions

## Confirmed

* UUID primary keys
* Foreign key relationships
* Check constraints
* RLS protection
* Soft deletion model
* Collaborative access model

---

## Not Yet Verified

* Additional indexes
* Database triggers
* Packing-specific SQL functions
* Scheduled cleanup jobs
* Analytics tables
* Audit tables

---

# Known Schema Notes

## Source Type Consistency

Database values:

```text
suggested
custom
template
```

Application type definitions match these values.

A separate template engine type currently contains an inconsistent value:

```text
personal
```

This should be reviewed and aligned with the database schema.

---

# Future Schema Opportunities

Potential future enhancements:

* Item assignment workflows
* Archived item recovery
* Archived list recovery
* Packing activity history
* Packing templates table
* Suggestion profile table
* User packing preferences
* Packing analytics
