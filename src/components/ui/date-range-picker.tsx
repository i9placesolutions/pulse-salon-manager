import React from 'react';
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

interface DateRangePickerProps {
  className?: string;
  value?: { from: Date | undefined; to: Date | undefined };
  onChange?: (value: { from: Date | undefined; to: Date | undefined }) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  className,
  value,
  onChange
}) => {
  const [date, setDate] = React.useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: value?.from, to: value?.to });

  const handleSelect = (newDate: { from: Date | undefined; to: Date | undefined }) => {
    setDate(newDate);
    onChange?.(newDate);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "P", { locale: ptBR })} -{" "}
                  {format(date.to, "P", { locale: ptBR })}
                </>
              ) : (
                format(date.from, "P", { locale: ptBR })
              )
            ) : (
              <span>Selecione um período</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}; 