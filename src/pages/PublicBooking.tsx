import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ServiceSelector } from "@/components/public-booking/ServiceSelector";
import { ProfessionalSelector } from "@/components/public-booking/ProfessionalSelector";
import { DateTimeSelector } from "@/components/public-booking/DateTimeSelector";
import { ClientForm, ClientInfo } from "@/components/public-booking/ClientForm";
import { BookingConfirmation } from "@/components/public-booking/BookingConfirmation";
import { PublicBookingSteps } from "@/components/public-booking/PublicBookingSteps";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoginModal, UserData } from "@/components/public-booking/LoginModal";

// Tipos
interface Service {
  id: number;
  name: string;
  price: number;
  duration: number;
  description: string;
  category: string;
}

interface Professional {
  id: number;
  name: string;
  photoUrl?: string;
  specialty: string;
  schedule: {
    [key: string]: { start: string; end: string };
  };
  unavailableDates?: string[];
}

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

interface Establishment {
  id: number;
  name: string;
  logo?: string;
  address: string;
  phone: string;
  customUrl: string;
}

interface BookingDetails {
  service?: Service;
  professional?: Professional;
  date?: Date;
  timeSlot?: TimeSlot;
  clientInfo?: ClientInfo;
}

// Função para encontrar horários disponíveis
const findAvailableTimeSlots = (
  professional?: Professional,
  date?: Date,
  service?: Service
): TimeSlot[] => {
  if (!professional || !date || !service) return [];

  const dayOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][
    date.getDay()
  ];

  const schedule = professional.schedule[dayOfWeek];
  if (!schedule) return [];

  // Converter para minutos desde meia-noite
  const startMinutes = 
    parseInt(schedule.start.split(":")[0]) * 60 + 
    parseInt(schedule.start.split(":")[1]);
  const endMinutes = 
    parseInt(schedule.end.split(":")[0]) * 60 + 
    parseInt(schedule.end.split(":")[1]);

  const slots: TimeSlot[] = [];
  const serviceDuration = service.duration;

  // Gerar slots a cada 30 minutos
  for (let time = startMinutes; time + serviceDuration <= endMinutes; time += 30) {
    const hours = Math.floor(time / 60);
    const minutes = time % 60;
    const timeString = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    const id = `slot-${date.toISOString().split("T")[0]}-${timeString}`;
    
    // Verificar se está disponível (simulação)
    const isAvailable = Math.random() > 0.3; // 70% de chance de estar disponível
    
    slots.push({
      id,
      time: timeString,
      available: isAvailable,
    });
  }

  return slots;
};

// Dados mockados
const mockServices: Service[] = [
  {
    id: 1,
    name: "Corte de Cabelo Feminino",
    price: 80,
    duration: 60,
    description: "Corte modelado, com acabamento e finalização.",
    category: "Cabelo",
  },
  {
    id: 2,
    name: "Corte de Cabelo Masculino",
    price: 50,
    duration: 30,
    description: "Corte na tesoura ou máquina com acabamento.",
    category: "Cabelo",
  },
  {
    id: 3,
    name: "Coloração",
    price: 120,
    duration: 120,
    description: "Aplicação de tintura com técnicas modernas.",
    category: "Coloração",
  },
  {
    id: 4,
    name: "Manicure",
    price: 40,
    duration: 45,
    description: "Cuidados completos com as unhas das mãos.",
    category: "Unhas",
  },
  {
    id: 5,
    name: "Pedicure",
    price: 50,
    duration: 60,
    description: "Cuidados completos com as unhas dos pés.",
    category: "Unhas",
  },
  {
    id: 6,
    name: "Design de Sobrancelhas",
    price: 35,
    duration: 30,
    description: "Modelagem e ajuste de sobrancelhas.",
    category: "Estética",
  },
];

const mockProfessionals: Professional[] = [
  {
    id: 1,
    name: "Mariana Silva",
    specialty: "Cabeleireira e Colorista",
    schedule: {
      monday: { start: "09:00", end: "18:00" },
      tuesday: { start: "09:00", end: "18:00" },
      wednesday: { start: "09:00", end: "18:00" },
      thursday: { start: "09:00", end: "18:00" },
      friday: { start: "09:00", end: "18:00" },
      saturday: { start: "09:00", end: "16:00" },
    },
  },
  {
    id: 2,
    name: "Carlos Oliveira",
    specialty: "Barbeiro",
    schedule: {
      monday: { start: "10:00", end: "19:00" },
      tuesday: { start: "10:00", end: "19:00" },
      wednesday: { start: "10:00", end: "19:00" },
      thursday: { start: "10:00", end: "19:00" },
      friday: { start: "10:00", end: "19:00" },
      saturday: { start: "10:00", end: "17:00" },
    },
  },
  {
    id: 3,
    name: "Ana Paula Ferreira",
    specialty: "Manicure e Pedicure",
    schedule: {
      monday: { start: "09:00", end: "18:00" },
      tuesday: { start: "09:00", end: "18:00" },
      wednesday: { start: "09:00", end: "18:00" },
      thursday: { start: "09:00", end: "18:00" },
      friday: { start: "09:00", end: "18:00" },
    },
  },
];

export default function PublicBooking() {
  const params = useParams();
  const navigate = useNavigate();
  const slug = params.slug;
  const [currentStep, setCurrentStep] = useState(1);
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails>({});
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [isBookingComplete, setIsBookingComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para controlar o modal de login/cadastro
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  // Carregar informações do estabelecimento com base na URL personalizada
  useEffect(() => {
    if (!slug) return;

    // Simulação de carregamento de dados do estabelecimento
    const fetchEstablishment = async () => {
      try {
        // Aqui você faria uma chamada de API para obter dados reais
        // Por enquanto vamos simular com um timeout
        setTimeout(() => {
          setEstablishment({
            id: 1,
            name: "Salão Beleza Pura",
            address: "Rua das Flores, 123 - Centro",
            phone: "(11) 99999-9999",
            customUrl: slug as string,
            logo: "/logo.png",
          });
        }, 500);
      } catch (error) {
        setError("Não foi possível carregar as informações do estabelecimento.");
      }
    };

    fetchEstablishment();
  }, [slug]);

  // Atualizar horários disponíveis quando profissional ou data mudarem
  useEffect(() => {
    if (bookingDetails.professional && bookingDetails.date && bookingDetails.service) {
      const slots = findAvailableTimeSlots(
        bookingDetails.professional,
        bookingDetails.date,
        bookingDetails.service
      );
      setAvailableTimeSlots(slots);
    }
  }, [bookingDetails.professional, bookingDetails.date, bookingDetails.service]);

  const handleServiceSelect = (service: Service) => {
    setBookingDetails((prev) => ({ ...prev, service }));
    setCurrentStep(2);
  };

  const handleProfessionalSelect = (professional: Professional) => {
    setBookingDetails((prev) => ({ ...prev, professional }));
    setCurrentStep(3);
  };

  const handleDateTimeSelect = (date: Date, timeSlot: TimeSlot) => {
    setBookingDetails((prev) => ({ ...prev, date, timeSlot }));
    
    // Em vez de avançar diretamente para o próximo passo,
    // abrir o modal de login/cadastro
    setIsLoginModalOpen(true);
  };
  
  // Nova função para lidar com o sucesso do login/cadastro
  const handleLoginSuccess = (userData: UserData) => {
    setUserData(userData);
    
    // Preencher informações do cliente automaticamente se já existirem
    if (userData.name) {
      const clientInfo: ClientInfo = {
        name: userData.name,
        email: "", // Email não é solicitado no login, então fica vazio
        phone: userData.whatsapp.replace(/\D/g, ""), // Remover formatação
        notes: "",
        acceptTerms: false,
        isLoggedIn: true
      };
      
      setBookingDetails(prev => ({
        ...prev,
        clientInfo: {
          ...clientInfo,
          ...prev.clientInfo
        }
      }));
    }
    
    // Avançar para o próximo passo
    setCurrentStep(4);
  };

  const handleClientInfoSubmit = (clientInfo: ClientInfo) => {
    setBookingDetails((prev) => ({ ...prev, clientInfo }));
    setCurrentStep(5);
  };

  const handleConfirmBooking = async () => {
    setLoading(true);
    try {
      // Simulação de uma requisição de agendamento
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsBookingComplete(true);
      setLoading(false);
    } catch (err) {
      setError("Ocorreu um erro ao confirmar seu agendamento. Tente novamente.");
      setLoading(false);
    }
  };

  const handleBackStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStartNewBooking = () => {
    setBookingDetails({});
    setIsBookingComplete(false);
    setCurrentStep(1);
    setUserData(null);
  };

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!establishment) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-40">
          <p>Carregando informações...</p>
        </div>
      </div>
    );
  }

  if (isBookingComplete) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 space-y-4">
              <div className="flex justify-center">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-green-600">Agendamento confirmado!</h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Seu agendamento foi realizado com sucesso. Em breve você receberá um e-mail com os detalhes.
              </p>
              <div className="mt-6">
                <Button onClick={handleStartNewBooking}>Fazer novo agendamento</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-pink-600">{establishment.name}</h1>
          <p className="text-gray-600">{establishment.address}</p>
        </div>

        <PublicBookingSteps currentStep={currentStep} />

        <Card className="mt-8">
          <CardHeader className="border-b pb-3">
            <h2 className="text-xl font-semibold">
              {currentStep === 1 && "Selecione o serviço"}
              {currentStep === 2 && "Escolha o profissional"}
              {currentStep === 3 && "Escolha a data e horário"}
              {currentStep === 4 && "Suas informações"}
              {currentStep === 5 && "Confirme seu agendamento"}
            </h2>
          </CardHeader>
          <CardContent className="pt-6">
            {currentStep === 1 && (
              <ServiceSelector 
                services={mockServices} 
                onSelect={handleServiceSelect} 
              />
            )}

            {currentStep === 2 && (
              <ProfessionalSelector 
                professionals={mockProfessionals.filter(pro => 
                  // Filtrar profissionais que fazem o serviço selecionado (simulação)
                  Math.random() > 0.3
                )} 
                onSelect={handleProfessionalSelect}
                onBack={handleBackStep}
              />
            )}

            {currentStep === 3 && (
              <DateTimeSelector 
                availableTimeSlots={availableTimeSlots}
                onSelectDateTime={handleDateTimeSelect}
                selectedDate={bookingDetails.date}
                selectedTimeSlot={bookingDetails.timeSlot}
                onBack={handleBackStep}
              />
            )}

            {currentStep === 4 && (
              <ClientForm 
                onSubmit={handleClientInfoSubmit}
                onBack={handleBackStep}
              />
            )}

            {currentStep === 5 && bookingDetails.service && 
              bookingDetails.professional && 
              bookingDetails.date && 
              bookingDetails.timeSlot && 
              bookingDetails.clientInfo && (
              <BookingConfirmation 
                service={bookingDetails.service}
                professional={bookingDetails.professional}
                date={bookingDetails.date}
                timeSlot={bookingDetails.timeSlot}
                clientInfo={bookingDetails.clientInfo}
                onConfirm={handleConfirmBooking}
                onBack={handleBackStep}
                loading={loading}
              />
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Modal de Login/Cadastro */}
      <LoginModal 
        open={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
} 