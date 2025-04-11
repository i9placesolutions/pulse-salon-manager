import { BirthdayAutomation } from "@/components/marketing/BirthdayAutomation";

export default function Aniversarios() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Automação de Aniversários</h2>
          <p className="text-sm text-muted-foreground">
            Configure mensagens automáticas para aniversários de clientes
          </p>
        </div>
      </div>
      
      <BirthdayAutomation />
    </div>
  );
}
