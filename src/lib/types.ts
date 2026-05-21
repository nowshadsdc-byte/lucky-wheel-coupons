<<<<<<< HEAD
export type RewardKey = "FREE" | "OFF30" | "OFF20" | "OFF10";

export interface Reward {
  id: RewardKey;
=======
export type RewardKey = string;

export interface Reward {
  id: string;
>>>>>>> master
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
<<<<<<< HEAD
  course_option_1: string;
  course_option_2: string;
  course_option_3: string;
=======
  course_option: string;
>>>>>>> master
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
