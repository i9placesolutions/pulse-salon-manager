
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

interface MarketingHeaderProps {
  onNewMessage: () => void;
}

export function MarketingHeader({ onNewMessage }: MarketingHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-neutral">Marketing e Campanhas</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie suas campanhas promocionais e programas de fidelidade
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={onNewMessage}>
          <MessageSquare className="mr-2 h-4 w-4" />
          Nova Mensagem
        </Button>
      </div>
    </div>
  );
}
