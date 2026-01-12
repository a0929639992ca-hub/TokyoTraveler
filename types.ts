export type TabType = 'ITINERARY' | 'INFO' | 'SHOPPING' | 'EXPENSES';

export type ItineraryType = 'SIGHTSEEING' | 'HOTEL' | 'FOOD' | 'SHOPPING' | 'FLIGHT' | 'OTHER';

export type TransportType = 'WALK' | 'CAR' | 'TRAIN';

export interface ItineraryItem {
  id: string;
  type: ItineraryType;
  name: string;
  startTime: string; // HH:MM
  endTime?: string;
  ticketPrice?: number;
  notes?: string;
  locationLink?: string; // Google Maps URL
  transportToNext?: {
    type: TransportType;
    durationMinutes: number;
    details?: string; // Detailed route info (e.g. Line name, transfer station)
  };
}

export interface DaySchedule {
  id: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // Mon, Tue...
  items: ItineraryItem[];
  weather: {
    temp: number;
    condition: 'SUNNY' | 'CLOUDY' | 'RAIN' | 'SNOW';
    feelsLike: number;
  };
}

export interface ShoppingItem {
  id: string;
  name: string;
  image?: string;
  bought: boolean;
}

export interface ExpenseItem {
  id: string;
  category: 'TRANSPORT' | 'FOOD' | 'HOTEL' | 'TICKET' | 'SHOPPING' | 'OTHER';
  name: string;
  date: string;
  amountJpy: number;
  paymentMethod: 'CASH' | 'CARD';
  notes?: string;
}

export interface FlightInfo {
  type: 'OUTBOUND' | 'INBOUND';
  airportCode: string; // NRT/HND
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
}

export const CATEGORY_LABELS: Record<ItineraryType, string> = {
  SIGHTSEEING: '景點',
  HOTEL: '住宿',
  FOOD: '美食',
  SHOPPING: '購物',
  FLIGHT: '航班',
  OTHER: '其他',
};

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseItem['category'], string> = {
  TRANSPORT: '交通',
  FOOD: '飲食',
  HOTEL: '住宿',
  TICKET: '門票',
  SHOPPING: '購物',
  OTHER: '其他',
};
