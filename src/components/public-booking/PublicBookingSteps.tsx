import { Scissors, User, Calendar, ClipboardCheck, CheckCircle } from "lucide-react";

interface PublicBookingStepsProps {
  currentStep: number;
}

export function PublicBookingSteps({ currentStep }: PublicBookingStepsProps) {
  const steps = [
    { number: 1, label: "Serviço", icon: Scissors },
    { number: 2, label: "Profissional", icon: User },
    { number: 3, label: "Data e Horário", icon: Calendar },
    { number: 4, label: "Seus Dados", icon: ClipboardCheck },
    { number: 5, label: "Confirmação", icon: CheckCircle },
  ];

  return (
    <>
      {/* Versão Desktop */}
      <div className="hidden md:flex items-center justify-center">
        {steps.map((step, index) => (
          <div
            key={step.number}
            className="flex items-center"
          >
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                  step.number === currentStep
                    ? "bg-pink-600 text-white"
                    : step.number < currentStep
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <step.icon className="h-5 w-5" />
              </div>
              <span
                className={`text-xs ${
                  step.number === currentStep
                    ? "text-pink-600 font-medium"
                    : step.number < currentStep
                    ? "text-green-600"
                    : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            
            {index < steps.length - 1 && (
              <div
                className={`w-16 h-0.5 mx-1 ${
                  step.number < currentStep ? "bg-green-300" : "bg-gray-200"
                }`}
              ></div>
            )}
          </div>
        ))}
      </div>

      {/* Versão Mobile */}
      <div className="flex justify-between items-center px-2 md:hidden">
        {steps.map((step) => (
          <div
            key={step.number}
            className="flex flex-col items-center"
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                step.number === currentStep
                  ? "bg-pink-600 text-white"
                  : step.number < currentStep
                  ? "bg-green-100 text-green-600"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              <step.icon className="h-4 w-4" />
            </div>
            <span
              className={`text-[10px] ${
                step.number === currentStep
                  ? "text-pink-600 font-medium"
                  : step.number < currentStep
                  ? "text-green-600"
                  : "text-gray-400"
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </>
  );
} 