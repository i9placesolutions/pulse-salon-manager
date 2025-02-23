
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

type RecipientType = 'all' | 'vip' | 'inactive' | 'custom';

interface RecipientSelectorProps {
  value: RecipientType;
  onChange: (value: RecipientType) => void;
}

export function RecipientSelector({ value, onChange }: RecipientSelectorProps) {
  return (
    <div className="space-y-4">
      <Label>Destinatários</Label>
      <RadioGroup
        value={value}
        onValueChange={onChange}
      >
        <div className="grid gap-2">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="recipients-all" />
            <Label htmlFor="recipients-all">Todos os clientes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="vip" id="recipients-vip" />
            <Label htmlFor="recipients-vip">Clientes VIP</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="inactive" id="recipients-inactive" />
            <Label htmlFor="recipients-inactive">Clientes Inativos</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="custom" id="recipients-custom" />
            <Label htmlFor="recipients-custom">Seleção Personalizada</Label>
          </div>
        </div>
      </RadioGroup>
      {value === 'custom' && (
        <Button variant="outline" className="w-full mt-2">
          <Users className="mr-2 h-4 w-4" />
          Selecionar Contatos
        </Button>
      )}
    </div>
  );
}
