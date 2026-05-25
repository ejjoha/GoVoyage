export const climateOptions = [
  "Hot",
  "Cold",
  "Rainy",
] as const;

export const environmentOptions = [
  "City",
  "Beach",
  "Mountain",
] as const;

export const tripStyleOptions = [
  "Business",
  "Traveling with kids",
] as const;

export type ClimateOption = (typeof climateOptions)[number];
export type EnvironmentOption = (typeof environmentOptions)[number];
export type TripStyleOption = (typeof tripStyleOptions)[number];