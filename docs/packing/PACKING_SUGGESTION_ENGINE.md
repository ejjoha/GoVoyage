# PACKING_SUGGESTION_ENGINE

## Overview

The Packing Suggestion Engine is responsible for generating intelligent starter packing lists for travelers.

It combines:

* Core travel essentials
* Climate-specific recommendations
* Environment-specific recommendations
* Trip-style recommendations
* Quantity calculations based on trip duration

The engine is entirely rule-based and deterministic.

No AI model or external recommendation service is currently used.

---

# Related Documentation

* PACKING_FEATURE_OVERVIEW.md
* PACKING_TECHNICAL_ARCHITECTURE.md
* PACKING_DATABASE_SPECIFICATION.md
* PACKING_COMPONENT_REFERENCE.md

---

# Architecture

## Primary Files

```text
features/packing/lib/packing-template-engine.ts
features/packing/lib/packing-suggestions.ts
```

Responsibilities:

### packing-template-engine.ts

Provides:

* Category taxonomy
* Base recommendation templates
* Climate templates
* Environment templates
* Trip-style templates
* Quantity calculation rules
* Deduplication logic

### packing-suggestions.ts

Provides:

* Recommendation generation
* List-type specialization
* Template selection
* Final item preparation

---

# Suggestion Generation Flow

```text
Packing List
       +
Trip Duration
       +
Climate Selection
       +
Environment Selection
       +
Trip Style Selection
       │
       ▼
Base Items
       +
Climate Templates
       +
Environment Templates
       +
Trip Style Templates
       │
       ▼
Merge
       │
       ▼
Deduplicate
       │
       ▼
Calculate Quantities
       │
       ▼
Create Suggested Items
```

---

# Category Taxonomy

## Supported Categories

Confirmed categories:

```text
Essentials
Clothing
Footwear
Toiletries
Health & Safety
Tech
Comfort & Travel
Laundry
Weather
Beach & Swim
Outdoor & Hiking
City & Business
Kids & Family
```

These categories are used for:

* Item organization
* UI grouping
* Progress tracking

---

# Packing Item Model

## Template Item Structure

Each recommendation item contains:

```ts
key
name
category
quantity
packed
source
protected
hidden
quantityRule
minQuantity
maxQuantity
```

---

# Base Recommendations

## Purpose

Base recommendations are applied to most packing lists.

They represent essential travel items.

---

## Essential Documents

Examples:

```text
Passport or ID
Wallet
Payment card
Travel insurance info
Booking confirmations
House keys
```

Several of these items are marked:

```text
protected = true
```

---

## Technology

Examples:

```text
Phone
Phone charger
Power bank
Travel adapter
```

---

## Clothing

Examples:

```text
Underwear
Socks
T-shirts or tops
Pants or skirts
Sleepwear
Light jacket or layer
```

Many clothing items use quantity rules.

---

## Toiletries

Examples:

```text
Toothbrush
Toothpaste
Deodorant
Skin care
Shampoo
Razor or grooming kit
```

---

## Health & Safety

Examples:

```text
Prescription medicine
Pain reliever
Basic first aid
```

---

## Comfort & Travel

Examples:

```text
Reusable water bottle
Sunglasses
Travel snacks
Laundry bag
```

---

# Climate Profiles

## Overview

Climate profiles add weather-specific recommendations.

---

## Hot

Items:

```text
High SPF sunscreen
Cap or sun hat
Linen or light shirts
After-sun lotion
```

---

## Cold

Items:

```text
Warm coat
Thermal base layers
Gloves
Beanie
Scarf or neck warmer
Warm socks
```

Several items are protected.

---

## Rainy

Items:

```text
Umbrella
Waterproof jacket
Waterproof shoes
Dry bag
```

---

## Tropical

Items:

```text
Reef-safe sunscreen
Insect repellent
Lightweight rain jacket
Breathable shirts
Sun hat
```

Important finding:

The engine supports:

```text
tropical
```

but the current UI only exposes:

```text
Hot
Cold
Rainy
```

This indicates future expansion potential.

---

# Environment Profiles

## Beach

Items:

```text
Swimsuit
Beach towel
Flip-flops
Waterproof phone pouch
Beach bag
```

---

## Hiking

Items:

```text
Hiking boots
Daypack
Hiking socks
Quick-dry shirt
Trail snacks
Headlamp
Map or offline navigation
```

Several items are protected.

---

## Mountain

Items:

```text
Insulating mid-layer
Windproof shell
Trekking poles
Altitude medication if needed
```

---

## City

Items:

```text
Smart casual outfit
Small crossbody bag
Portable tote bag
Evening shoes
```

---

# Trip Style Profiles

## Business

Items:

```text
Business outfit
Laptop
Laptop charger
Notebook and pen
```

Business outfit uses a dynamic quantity rule.

---

## Traveling with Kids

The most extensive recommendation profile in the system.

Categories include:

### Documentation

```text
Kids’ documents
Passports/IDs
Boarding passes
Insurance cards
Emergency contacts
```

### Snacks & Hydration

```text
Snacks
Refillable water bottles
Snack cups
Ziplock bags
```

### Entertainment

```text
Toys/books
Coloring books
Sticker books
Tablet + headphones
Favorite stuffed animal
```

### Hygiene

```text
Wipes
Hand sanitizer
Disinfecting wipes
Tissues
```

### Medical

```text
Medication
Prescription meds
Band-aids
Thermometer
Sunscreen
```

### Clothing

```text
Spare clothes
Pajamas
Socks/underwear
Sweater/jacket
```

### Baby & Toddler

```text
Diapers
Changing pad
Portable potty seat
Diaper cream
```

### Stroller Equipment

```text
Stroller rain cover
Stroller blanket
Stroller fan
Organizer hooks
```

### Transportation

```text
Car seat
Car seat travel bag
Window shade
Neck pillow
Blanket
```

---

# List-Specific Recommendation Logic

## Personal Lists

Default behavior:

```text
Use base recommendations
Apply selected profiles
```

---

## Shared Lists

Base recommendations are reduced to:

```text
Travel adapter
Basic first aid
Travel snacks
Laundry bag
Reusable water bottle
```

Purpose:

Avoid duplicating personal items.

---

## Luggage Lists

Base recommendations are reduced to:

```text
Passport or ID
Wallet
Phone
Phone charger
Power bank
Travel snacks
Prescription medicine
```

Purpose:

Focus on carry-on essentials.

---

## Kids Lists

Special handling:

```text
title.includes("kid")
```

Triggers:

```text
Traveling with kids
```

recommendations automatically.

Important note:

This is title-based behavior rather than type-based behavior.

---

# Quantity Engine

## Overview

The quantity engine adjusts recommendations using trip duration.

Function:

```ts
getSmartQuantity()
```

---

## Rule: fixed

Always use template quantity.

Example:

```text
Passport
Wallet
Phone
```

---

## Rule: perDay

Example:

```text
Underwear
Socks
```

Calculation:

```text
tripDays
```

Subject to min/max limits.

---

## Rule: perNight

Calculation:

```text
tripDays - 1
```

Minimum:

```text
1
```

---

## Rule: tripDaysMinusOne

Calculation:

```text
tripDays - 1
```

Used for travel patterns where one less item than days is required.

---

## Rule: everyTwoDays

Examples:

```text
T-shirts
Thermal layers
Quick-dry shirts
```

Calculation:

```text
ceil(days / 2)
```

---

## Rule: weekly

Example:

```text
Pants or skirts
```

Calculation:

```text
ceil(days / 7) + 1
```

---

## Rule: onePerOutfitDay

Example:

```text
Business outfit
```

Calculation:

```text
One outfit per day
```

Respecting maximum quantity limits.

---

# Quantity Constraints

Items may define:

```text
minQuantity
maxQuantity
```

These values clamp generated quantities.

Examples:

```text
Underwear
2–14

Socks
2–14

Business Outfit
1–5
```

---

# Deduplication Engine

Function:

```ts
mergePackingItems()
```

Purpose:

Prevent duplicate recommendations.

---

## Strategy

Each item has:

```ts
key
```

Deduplication occurs by key.

Example:

```text
Travel adapter
```

appearing in multiple recommendation groups results in only one final item.

---

# Protected Items

Many critical recommendations are marked:

```text
protected = true
```

Examples:

```text
Passport
Wallet
Phone
Travel Insurance
Prescription Medicine
Laptop
Kids Documents
```

Current database support exists for protected items.

Exact UI behavior has not yet been verified.

---

# Source Types

Database-supported values:

```text
suggested
custom
template
```

---

# Important Technical Finding

The template engine defines:

```ts
source: "suggested" | "custom" | "personal"
```

However the database schema supports:

```text
suggested
custom
template
```

This is a verified inconsistency.

Recommendation:

Reuse the shared `PackingItemSource` type from:

```text
features/packing/types/packing.types.ts
```

---

# Known Limitations

## Climate Support Mismatch

Engine supports:

```text
tropical
```

Current UI does not expose it.

---

## Kids Detection

Current behavior:

```ts
title.includes("kid")
```

This is fragile.

Future improvement:

```text
Dedicated list type
```

or

```text
Dedicated recommendation profile field
```

---

# Future Opportunities

Potential enhancements:

* Seasonal profiles
* Winter sports profile
* Camping profile
* Road trip profile
* Cruise profile
* International travel profile
* Pet travel profile
* Accessibility-focused recommendations
* User-specific packing preferences
* Historical packing learning
* AI-assisted recommendation generation

---

# Verification Status

## Confirmed

* Category taxonomy
* Base recommendations
* Climate profiles
* Environment profiles
* Trip styles
* Quantity rules
* Deduplication logic
* List-specific behavior

## Not Yet Verified

* Future intended use of protected items
* Long-term purpose of source type mismatch
* Historical evolution of recommendation templates
