
import { LucideIcon } from "lucide-react";

export interface MessageCampaignData {
  title: string;
  message: string;
  recipients: 'all' | 'vip' | 'inactive' | 'custom';
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
