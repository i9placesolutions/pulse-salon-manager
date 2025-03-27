import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricsCardProps {
  title: string;
  value: string;
  change: number;
  icon: LucideIcon;
  description: string;
}

const cardColors = [
  {
    border: "border-blue-200",
    gradient: "from-blue-50 to-blue-100",
    bg: "bg-blue-100",
    title: "text-blue-700",
    icon: "text-blue-600",
    value: "text-blue-900",
    text: "text-blue-600"
  },
  {
    border: "border-purple-200",
    gradient: "from-purple-50 to-purple-100",
    bg: "bg-purple-100",
    title: "text-purple-700",
    icon: "text-purple-600",
    value: "text-purple-900",
    text: "text-purple-600"
  },
  {
    border: "border-pink-200",
    gradient: "from-pink-50 to-pink-100",
    bg: "bg-pink-100",
    title: "text-pink-700",
    icon: "text-pink-600",
    value: "text-pink-900",
    text: "text-pink-600"
  },
  {
    border: "border-amber-200",
    gradient: "from-amber-50 to-amber-100",
    bg: "bg-amber-100",
    title: "text-amber-700",
    icon: "text-amber-600",
    value: "text-amber-900",
    text: "text-amber-600"
  }
];

export function MetricsCard({ title, value, change, icon: Icon, description, ...props }: MetricsCardProps) {
  // Selecionar cores com base no índice do cartão ou alguma outra lógica
  const colorIndex = Math.abs(title.length) % cardColors.length;
  const colors = cardColors[colorIndex];
  
  return (
    <Card className={`${colors.border} shadow-sm`}>
      <CardHeader className={`flex flex-row items-center justify-between pb-2 bg-gradient-to-r ${colors.gradient} rounded-t-lg`}>
        <CardTitle className={`text-sm font-medium ${colors.title}`}>
          {title}
        </CardTitle>
        <div className={`${colors.bg} p-2 rounded-full`}>
          <Icon className={`h-4 w-4 ${colors.icon}`} />
        </div>
      </CardHeader>
      <CardContent className="pt-3">
        <div className={`text-2xl font-bold ${colors.value}`}>{value}</div>
        <p className="text-xs flex items-center mt-1">
          <span className={change > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
            {change > 0 ? '↑' : '↓'} {Math.abs(change)}%
          </span>
          <span className={`ml-1 ${colors.text}`}>{description}</span>
        </p>
      </CardContent>
    </Card>
  );
}
