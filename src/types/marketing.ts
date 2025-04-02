import { LucideIcon } from "lucide-react";

export interface MessageCampaignData {
  title: string;
  message: string;
  recipients: 'all' | 'vip' | 'inactive' | 'custom' | 'phone';
  channels: string[];
  scheduleDate?: string;
  scheduleTime?: string;
}

export interface MarketingMetric {
  title: string;
  value: string;
  change: number;
  icon: LucideIcon;
  description: string;
}

export interface CampaignType {
  id: number;
  type: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

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
