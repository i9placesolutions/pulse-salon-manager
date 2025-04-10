import { Button } from "@/components/ui/button";

interface PeriodSelectButtonProps {
  label: string;
  value: string;
  selectedValue: string;
  onClick: () => void;
}

export function PeriodSelectButton({
  label,
  value,
  selectedValue,
  onClick
}: PeriodSelectButtonProps) {
  return (
    <Button
      variant={selectedValue === value ? "default" : "outline"}
      size="sm"
      onClick={onClick}
    >
      {label}
    </Button>
  );
} 