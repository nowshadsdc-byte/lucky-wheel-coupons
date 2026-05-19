export type RewardKey = "FREE" | "OFF30" | "OFF20" | "OFF10";

export interface Reward {
  id: RewardKey;
  reward_name: string;
  label: string;        // short label on wheel
  probability: number;  // weight (not %); engine normalizes
  is_active: boolean;
  max_limit: number;    // 0 = unlimited
  total_won: number;
  color: string;        // brand css var
}

export interface User {
  id: string;
  full_name: string;
  phone_number: string;
  address: string;
  course_option_1: string;
  course_option_2: string;
  course_option_3: string;
  has_spun: boolean;
  reward_won: RewardKey | null;
  coupon_code: string | null;
  claimed: boolean;
  created_at: string;
}

export interface AdminSession {
  email: string;
  loggedInAt: string;
}
