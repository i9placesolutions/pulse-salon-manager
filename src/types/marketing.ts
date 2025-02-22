
export interface Campaign {
  id: number;
  name: string;
  type: 'whatsapp' | 'coupon' | 'retention' | 'referral';
  status: 'active' | 'scheduled' | 'completed' | 'draft';
  startDate: string;
  endDate?: string;
  audience: 'all' | 'inactive' | 'vip' | 'new' | 'birthday';
  messageTemplate?: string;
  discount?: {
    type: 'percentage' | 'fixed' | 'service';
    value: number;
  };
  metrics?: {
    sent: number;
    opened: number;
    converted: number;
  };
}

export interface Coupon {
  id: number;
  code: string;
  name: string;
  type: 'percentage' | 'fixed' | 'service';
  value: number;
  startDate: string;
  endDate: string;
  maxUses: number;
  currentUses: number;
  status: 'active' | 'expired' | 'draft';
  restrictions?: string[];
}

export interface ReferralProgram {
  id: number;
  clientId: number;
  referralCode: string;
  invitedClients: number;
  successfulReferrals: number;
  rewardsEarned: number;
  lastReferralDate?: string;
}
