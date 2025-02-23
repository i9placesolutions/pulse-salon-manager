
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricsCardProps {
  title: string;
  value: string;
  change: number;
  icon: LucideIcon;
  description: string;
}

export function MetricsCard({ title, value, change, icon: Icon, description }: MetricsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground flex items-center mt-1">
          <span className={change > 0 ? 'text-green-500' : 'text-red-500'}>
            {change > 0 ? '↑' : '↓'} {Math.abs(change)}%
          </span>
          <span className="ml-1">{description}</span>
        </p>
      </CardContent>
    </Card>
  );
}
