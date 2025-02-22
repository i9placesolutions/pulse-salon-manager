
import { useState } from "react";
import { AppointmentDialog } from "@/components/appointments/AppointmentDialog";
import { AppointmentFilters } from "@/components/appointments/AppointmentFilters";
import { WeeklyCalendar } from "@/components/appointments/WeeklyCalendar";

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
    professional: "Ana Silva",
    startTime: "10:00",
    endTime: "11:00",
    date: new Date(),
  },
  {
    id: 2,
    client: "Maria Clara",
    professional: "Maria Oliveira",
    startTime: "14:30",
    endTime: "15:30",
    date: new Date(),
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

      <AppointmentFilters
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedProfessional={selectedProfessional}
        setSelectedProfessional={setSelectedProfessional}
        professionals={professionals}
      />

      {selectedDate && (
        <WeeklyCalendar
          selectedDate={selectedDate}
          appointments={appointments}
        />
      )}
    </div>
  );
};

export default Appointments;
