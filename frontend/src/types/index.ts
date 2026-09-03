export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  avatar_url?: string | null;
  bio?: string | null;
  home_airport?: string | null;
  preferred_currency?: string;
  travel_interests: string[];
  travel_style: string;
  budget_preference: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export type TripRole = 'OWNER' | 'EDITOR' | 'VIEWER' | 'EXPENSE_MANAGER';
export type TripStatus = 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

export interface TripMember {
  id: string;
  trip_id: string;
  user_id: string;
  role: TripRole;
  joined_at: string;
  user?: User;
}

export interface TripSummary {
  id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  status: TripStatus;
  budget: number;
  currency: string;
  cover_image?: string | null;
  member_count: number;
  user_role: TripRole;
}

export interface Trip {
  id: string;
  title: string;
  description?: string | null;
  destination: string;
  destination_lat?: number | null;
  destination_lng?: number | null;
  start_date: string;
  end_date: string;
  budget: number;
  currency: string;
  cover_image?: string | null;
  status: TripStatus;
  owner_id: string;
  created_at: string;
  updated_at: string;
  owner?: User;
  members: TripMember[];
  user_role?: TripRole;
}

export type ItineraryCategory = 'SIGHTSEEING' | 'FOOD' | 'ACTIVITY' | 'TRANSPORT' | 'HOTEL' | 'RELAXATION' | 'OTHER';

export interface ItineraryItem {
  id: string;
  day_id: string;
  trip_id: string;
  title: string;
  description?: string | null;
  location_name?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  start_time?: string | null;
  end_time?: string | null;
  category: ItineraryCategory;
  estimated_cost: number;
  currency: string;
  order_index: number;
  notes?: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface ItineraryDay {
  id: string;
  trip_id: string;
  day_number: number;
  date?: string | null;
  notes?: string | null;
  created_at: string;
  items: ItineraryItem[];
}

export interface Recommendation {
  id: string;
  trip_id: string;
  name: string;
  category: string;
  description?: string | null;
  rating: number;
  price_level: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  image_url?: string | null;
  reason?: string | null;
  tags: string[];
  is_saved: boolean;
  created_at: string;
}

export type FlightStatusType = 'SCHEDULED' | 'BOARDING' | 'DEPARTED' | 'DELAYED' | 'CANCELLED' | 'LANDED';

export interface FlightStatusHistory {
  id: string;
  old_status?: string | null;
  new_status: string;
  message?: string | null;
  changed_at: string;
}

export interface Flight {
  id: string;
  trip_id: string;
  user_id?: string | null;
  airline: string;
  flight_number: string;
  departure_airport: string;
  arrival_airport: string;
  departure_city?: string | null;
  arrival_city?: string | null;
  departure_time: string;
  arrival_time: string;
  terminal?: string | null;
  gate?: string | null;
  status: FlightStatusType;
  seat?: string | null;
  booking_reference?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  user?: User;
  status_history: FlightStatusHistory[];
}

export type ExpenseCategoryType = 'FLIGHTS' | 'HOTEL' | 'FOOD' | 'TRANSPORT' | 'ACTIVITIES' | 'SHOPPING' | 'TICKETS' | 'OTHER';
export type SplitType = 'EQUAL' | 'EXACT' | 'PERCENTAGE';

export interface ExpenseParticipant {
  id: string;
  expense_id: string;
  user_id: string;
  share_amount: number;
  share_percentage?: number | null;
  user?: User;
}

export interface Expense {
  id: string;
  trip_id: string;
  paid_by_user_id: string;
  amount: number;
  currency: string;
  category: ExpenseCategoryType;
  description: string;
  expense_date: string;
  split_type: SplitType;
  receipt_url?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  payer?: User;
  participants: ExpenseParticipant[];
}

export interface SuggestedSettlement {
  payer_id: string;
  payer_name: string;
  payer_avatar?: string | null;
  receiver_id: string;
  receiver_name: string;
  receiver_avatar?: string | null;
  amount: number;
  currency: string;
}

export interface MemberBalance {
  user_id: string;
  user_name: string;
  avatar_url?: string | null;
  total_paid: number;
  total_share: number;
  net_balance: number;
}

export interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
}

export interface DailySpending {
  date: string;
  amount: number;
}

export interface ExpenseAnalyticsSummary {
  trip_id: string;
  total_spent: number;
  trip_budget: number;
  remaining_budget: number;
  budget_usage_percentage: number;
  currency: string;
  spending_by_category: CategorySpending[];
  spending_by_member: MemberBalance[];
  daily_spending: DailySpending[];
  suggested_settlements: SuggestedSettlement[];
  recent_expenses: Expense[];
}

export interface Settlement {
  id: string;
  trip_id: string;
  payer_id: string;
  receiver_id: string;
  amount: number;
  currency: string;
  is_settled: boolean;
  settled_at?: string | null;
  notes?: string | null;
  payer?: User;
  receiver?: User;
}

export interface ChatMessage {
  id: string;
  trip_id: string;
  user_id: string;
  message: string;
  message_type: string;
  reactions: Record<string, string[]>;
  created_at: string;
  user?: User;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link_url?: string | null;
  is_read: boolean;
  extra_data: Record<string, any>;
  created_at: string;
}

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
  sender?: User;
  receiver?: User;
}

export interface WeatherForecastItem {
  date: string;
  max_temp: number;
  min_temp: number;
  rain_probability: number;
  condition: string;
  icon: string;
}

export interface WeatherData {
  destination: string;
  temperature: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  precipitation: number;
  condition: string;
  icon: string;
  forecast: WeatherForecastItem[];
}
