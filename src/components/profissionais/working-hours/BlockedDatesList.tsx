
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BlockedDate } from "@/types/professional";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trash2 } from "lucide-react";

interface BlockedDatesListProps {
  blockedDates: BlockedDate[];
  onRemove: (id: number) => void;
}

export function BlockedDatesList({ blockedDates, onRemove }: BlockedDatesListProps) {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      return dateStr;
    }
  };
  
  return (
    <div className="space-y-4">
      {blockedDates.length > 0 ? (
        <ScrollArea className="h-[250px] rounded-md border bg-white">
          <div className="p-4 space-y-3">
            {blockedDates.map((date) => (
              <div
                key={date.id}
                className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
              >
                <div className="flex-1">
                  <p className="font-medium">
                    {formatDate(date.startDate || date.start)} - {formatDate(date.endDate || date.end)}
                  </p>
                  <p className="text-sm text-muted-foreground">{date.reason}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(date.id ?? 0)}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="text-center py-10 text-muted-foreground border rounded-md bg-white">
          <p>Nenhuma data bloqueada</p>
          <p className="text-sm">Adicione períodos em que o profissional estará indisponível.</p>
        </div>
      )}
    </div>
  );
}
