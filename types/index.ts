export interface DateRange {
  start: string; // YYYY-MM-DD
  end: string;
}

export type Season = "spring" | "summer" | "fall" | "winter";
export type TravelMonth =
  | "jan" | "feb" | "mar" | "apr" | "may" | "jun"
  | "jul" | "aug" | "sep" | "oct" | "nov" | "dec";

export interface Availability {
  seasons: Season[];
  months: TravelMonth[];
  dateRanges: DateRange[];
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  region: string;
}

export interface TravelPlan {
  id: string;
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  phoneNumber: string;
  bio: string;
  wishlist: Destination[];
  availability: Availability;
  travelPlans: TravelPlan[];
  onboardingComplete: boolean;
  createdAt: number;
}

export interface FollowRelation {
  uid: string;
  displayName: string;
  photoURL: string;
  followedAt: number;
}

export interface OverlapNotification {
  id: string;
  type: "overlap";
  friendUids: string[];
  friendNames: string[];
  sharedDestinations: Destination[];
  overlapSeasons?: Season[];
  overlapMonths?: TravelMonth[];
  overlapDates?: DateRange[];
  createdAt: number;
  read: boolean;
}

// Trip types (kept from before, trip planning is secondary)
export interface Trip {
  id: string;
  name: string;
  organizerId: string;
  organizerName: string;
  status: "planning" | "decided" | "done" | "completed";
  inviteCode: string;
  destination?: Destination;
  createdAt: number;
  participantUids: string[];
}

export interface Member {
  uid: string;
  displayName: string;
  photoURL: string;
  joinedAt: number;
  hasSubmittedPrefs: boolean;
}

export interface TaskItem {
  id: string;
  label: string;
  assignedTo?: string;
  assignedName?: string;
  deadline?: string;
  done: boolean;
  createdAt: number;
}

export interface ContentItem {
  id: string;
  category: "food" | "activity" | "accommodation" | "other";
  title: string;
  url?: string;
  addedBy: string;
  addedByName: string;
  upvotes: string[];
  downvotes: string[];
  createdAt: number;
}

export interface DecisionOption {
  id: string;
  label: string;
  thumbsUp: string[];
  thumbsDown: string[];
  isFinalized: boolean;
}

export interface Decision {
  id: string;
  category: "destination" | "transport" | "accommodation" | "activity" | "dates";
  title: string;
  options: DecisionOption[];
  finalizedOptionId?: string;
}
