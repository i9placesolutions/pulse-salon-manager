import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Professional {
  id: number;
  name: string;
}

interface AppointmentFiltersProps {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  selectedProfessional: string;
  setSelectedProfessional: (professional: string) => void;
  professionals: Professional[];
  searchTerm?: string;
  setSearchTerm?: (term: string) => void;
}

export const AppointmentFilters = ({
  selectedDate,
  setSelectedDate,
  selectedProfessional,
  setSelectedProfessional,
  professionals,
  searchTerm = "",
  setSearchTerm = () => {}
}: AppointmentFiltersProps) => {
  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  format(selectedDate, "PPP", { locale: ptBR })
                ) : (
                  <span>Selecione uma data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0 bg-slate-50">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={ptBR}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar cliente..." 
              className="pl-8" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <select
            className="flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={selectedProfessional}
            onChange={e => setSelectedProfessional(e.target.value)}
          >
            <option value="">Todos os profissionais</option>
            {professionals.map(prof => (
              <option key={prof.id} value={prof.id}>
                {prof.name}
              </option>
            ))}
          </select>

          <select
            className="flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Todos os status</option>
            <option value="confirmed">Confirmados</option>
            <option value="waiting">Em Espera</option>
            <option value="cancelled">Cancelados</option>
          </select>
        </div>
      </div>
    </Card>
  );
};
