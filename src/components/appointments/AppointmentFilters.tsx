
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";

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
}

export const AppointmentFilters = ({
  selectedDate,
  setSelectedDate,
  selectedProfessional,
  setSelectedProfessional,
  professionals,
}: AppointmentFiltersProps) => {
  return (
    <Card className="p-4 lg:col-span-3">
      <div className="space-y-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-md border"
        />

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Buscar</label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar cliente..." className="pl-8" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Profissional</label>
            <select
              className="mt-1 block w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={selectedProfessional}
              onChange={(e) => setSelectedProfessional(e.target.value)}
            >
              <option value="">Todos</option>
              {professionals.map((prof) => (
                <option key={prof.id} value={prof.id}>
                  {prof.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Status</label>
            <select
              className="mt-1 block w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Todos</option>
              <option value="confirmed">Confirmados</option>
              <option value="waiting">Em Espera</option>
              <option value="cancelled">Cancelados</option>
            </select>
          </div>
        </div>
      </div>
    </Card>
  );
};
