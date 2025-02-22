
import { useState } from "react";
import { CalendarIcon, Search, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Temporary mock data
const professionals = [
  { id: 1, name: "Ana Silva" },
  { id: 2, name: "Carlos Santos" },
  { id: 3, name: "Maria Oliveira" },
];

const appointments = [
  {
    id: 1,
    client: "João Paulo",
    service: "Corte de Cabelo",
    professional: "Ana Silva",
    time: "10:00",
    status: "confirmed",
  },
  {
    id: 2,
    client: "Maria Clara",
    service: "Coloração",
    professional: "Maria Oliveira",
    time: "14:30",
    status: "waiting",
  },
];

const AppointmentDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Criar Agendamento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novo Agendamento</DialogTitle>
          <DialogDescription>
            Preencha os dados do agendamento. Campos marcados com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="client" className="text-sm font-medium">
              Cliente *
            </label>
            <Input id="client" placeholder="Buscar cliente..." />
          </div>
          <div className="grid gap-2">
            <label htmlFor="service" className="text-sm font-medium">
              Serviço *
            </label>
            <Input id="service" placeholder="Selecionar serviço..." />
          </div>
          <div className="grid gap-2">
            <label htmlFor="professional" className="text-sm font-medium">
              Profissional *
            </label>
            <Input id="professional" placeholder="Escolher profissional..." />
          </div>
          <div className="grid gap-2">
            <label htmlFor="date" className="text-sm font-medium">
              Data e Hora *
            </label>
            <div className="flex gap-2">
              <Input id="date" type="date" className="flex-1" />
              <Input type="time" className="w-32" />
            </div>
          </div>
          <div className="grid gap-2">
            <label htmlFor="notes" className="text-sm font-medium">
              Observações
            </label>
            <textarea
              id="notes"
              className="min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Adicionar observações..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedProfessional, setSelectedProfessional] = useState<string>("");

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header with title and actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold text-neutral">Agendamentos</h1>
        <AppointmentDialog />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Sidebar with calendar and filters */}
        <Card className="p-4 lg:col-span-3">
          <div className="space-y-4">
            {/* Calendar */}
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />

            {/* Filters */}
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

        {/* Main content with appointments list */}
        <Card className="p-4 lg:col-span-9">
          <div className="space-y-4">
            <h2 className="font-semibold text-neutral">
              Agendamentos para {selectedDate?.toLocaleDateString()}
            </h2>

            <div className="grid gap-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{appointment.client}</p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.service} com {appointment.professional}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">{appointment.time}</span>
                    <Button variant="outline" size="sm">
                      Detalhes
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Appointments;
