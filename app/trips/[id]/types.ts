export type Trip = {
  id: number;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  image_url?: string;
};

export type TripMember = {
  id: number;
  trip_id: number;
  name: string;
};

export type BookingType =
  | "flight"
  | "hotel"
  | "activity"
  | "transport"
  | "dining";

export type BookingFilter = "all" | "flight" | "hotel" | "plans";

export type Booking = {
  id: number;
  title: string;
  type: BookingType;
  start_time: string;
  end_time?: string;
  location?: string;
  confirmation_code?: string;
  notes?: string;
  airline?: string;
  flight_number?: string;
  departure_airport?: string;
  arrival_airport?: string;
  hotel_name?: string;
  address?: string;
  origin?: string;
  destination?: string;
};