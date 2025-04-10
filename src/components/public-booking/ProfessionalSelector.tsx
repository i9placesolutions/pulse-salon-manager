import { Star, ArrowLeft, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

interface ProfessionalSelectorProps {
  professionals: Professional[];
  onSelect: (professional: Professional) => void;
  onBack: () => void;
}

export function ProfessionalSelector({
  professionals,
  onSelect,
  onBack
}: ProfessionalSelectorProps) {
  // Função para obter iniciais do nome
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="flex items-center gap-1 text-gray-600 hover:text-gray-900 -ml-2 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Button>

      {professionals.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            Nenhum profissional disponível para este serviço.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {professionals.map((professional) => (
            <div
              key={professional.id}
              className="border rounded-lg p-4 hover:border-pink-300 hover:bg-pink-50 transition-colors cursor-pointer shadow-sm"
              onClick={() => onSelect(professional)}
            >
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 border-2 border-pink-200">
                  <AvatarImage src={professional.photoUrl} />
                  <AvatarFallback className="bg-pink-100 text-pink-700">
                    {getInitials(professional.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <h3 className="font-medium">{professional.name}</h3>
                  <p className="text-sm text-gray-600">{professional.specialty}</p>
                  
                  <div className="flex items-center mt-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="h-3 w-3 text-yellow-400 fill-yellow-400"
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 ml-1">
                      (32 avaliações)
                    </span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-pink-600 hover:text-pink-700 hover:bg-pink-100 p-0 h-8 w-8 rounded-full flex-shrink-0"
                >
                  <UserCheck className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 