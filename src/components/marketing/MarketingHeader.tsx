import { Button } from "@/components/ui/button";
import { MessageSquare, Target } from "lucide-react";

interface MarketingHeaderProps {
  onNewMessage: () => void;
}

export function MarketingHeader({ onNewMessage }: MarketingHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 p-6 rounded-xl border border-indigo-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-3 rounded-full">
            <Target className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              Marketing e Campanhas
            </h1>
            <p className="text-sm text-indigo-700/80">
              Gerencie suas campanhas promocionais e programas de fidelidade
            </p>
          </div>
        </div>
        
        <Button 
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
          onClick={onNewMessage}
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Nova Mensagem
        </Button>
      </div>
    </div>
  );
}
