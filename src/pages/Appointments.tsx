
import { useState } from "react";
import { AppointmentDialog } from "@/components/appointments/AppointmentDialog";
import { AppointmentFilters } from "@/components/appointments/AppointmentFilters";
import { AppointmentList } from "@/components/appointments/AppointmentList";

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
        <AppointmentFilters
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedProfessional={selectedProfessional}
          setSelectedProfessional={setSelectedProfessional}
          professionals={professionals}
        />
        <AppointmentList
          appointments={appointments}
          selectedDate={selectedDate}
        />
      </div>
    </div>
  );
};

export default Appointments;
