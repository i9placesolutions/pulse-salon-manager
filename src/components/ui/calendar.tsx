import * as React from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { DayPicker, CaptionProps, DropdownProps, useNavigation } from "react-day-picker";
import { cva } from "class-variance-authority";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

// Componente personalizado para o cabeçalho do calendário com seletores de mês e ano
function CustomCaption({ displayMonth }: CaptionProps) {
  // Usar o hook de navegação do react-day-picker para controlar a mudança de mês
  const { goToMonth } = useNavigation();
  // Atualizar valores dos seletores quando o mês em exibição muda
  const [monthValue, setMonthValue] = React.useState(format(displayMonth, 'LLLL', { locale: ptBR }));
  const [yearValue, setYearValue] = React.useState(String(displayMonth.getFullYear()));
  
  // Atualizar os valores dos seletores quando o mês exibido mudar externamente
  React.useEffect(() => {
    setMonthValue(format(displayMonth, 'LLLL', { locale: ptBR }));
    setYearValue(String(displayMonth.getFullYear()));
  }, [displayMonth]);

  const years = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 106 }, (_, i) => String(currentYear - 5 + i - 100));
  }, []);

  const monthsNames = React.useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(i);
      return format(date, 'LLLL', { locale: ptBR });
    });
  }, []);

  const selectMonth = (value: string) => {
    setMonthValue(value);
    const monthIndex = monthsNames.findIndex(month => month === value);
    const newDate = new Date(displayMonth);
    newDate.setMonth(monthIndex);
    // Navegar para o novo mês usando a API do DayPicker
    goToMonth(newDate);
  };

  const selectYear = (value: string) => {
    setYearValue(value);
    const newDate = new Date(displayMonth);
    newDate.setFullYear(Number(value));
    // Navegar para o novo mês usando a API do DayPicker
    goToMonth(newDate);
  };

  return (
    <div className="flex justify-center items-center space-x-2 pt-1 px-1">
      <Select value={monthValue} onValueChange={selectMonth}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Mês" />
        </SelectTrigger>
        <SelectContent>
          {monthsNames.map((month) => (
            <SelectItem key={month} value={month}>
              {month}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={yearValue} onValueChange={selectYear}>
        <SelectTrigger className="w-[80px]">
          <SelectValue placeholder="Ano" />
        </SelectTrigger>
        <SelectContent className="max-h-60 overflow-y-auto">
          {years.map((year) => (
            <SelectItem key={year} value={year}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "p-3 w-full sm:w-auto flex sm:justify-end justify-center",
        className
      )}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-[#db2777]/30 text-[#db2777] font-medium border border-primary/20",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent/50 aria-selected:text-muted-foreground rounded-none",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
        Caption: CustomCaption
      }}
      locale={ptBR}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
