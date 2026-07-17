export interface Trip {
  id: string;
  name: string;
  organizerId: string;
  organizerName: string;
  status: "planning" | "decided" | "done";
  inviteCode: string;
  createdAt: number;
}

export interface Member {
  uid: string;
  displayName: string;
  photoURL: string;
  joinedAt: number;
  hasSubmittedPrefs: boolean;
}

export interface DateRange {
  start: string; // ISO date string YYYY-MM-DD
  end: string;
}

export interface Availability {
  uid: string;
  dateRanges: DateRange[];
  vibes: Array<"relax" | "adventure" | "food" | "culture" | "nightlife">;
  budgetRange: { min: number; max: number };
}

export interface DecisionOption {
  id: string;
  label: string;
  thumbsUp: string[]; // userIds
  thumbsDown: string[]; // userIds
  isFinalized: boolean;
}

export interface Decision {
  id: string;
  category: "destination" | "transport" | "accommodation" | "activity" | "dates";
  title: string;
  options: DecisionOption[];
  finalizedOptionId?: string;
}
