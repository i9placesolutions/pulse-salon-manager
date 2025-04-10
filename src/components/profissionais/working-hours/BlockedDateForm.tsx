
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface BlockedDateFormValues {
  startDate: string;
  endDate: string;
  reason: string;
}

interface BlockedDateFormProps {
  values: BlockedDateFormValues;
  onChange: (values: BlockedDateFormValues) => void;
  onAdd: () => void;
}

export const BlockedDateForm = ({
  values,
  onChange,
  onAdd,
}: BlockedDateFormProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Bloqueio de Datas</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Data Início</Label>
          <Input
            type="date"
            value={values.startDate}
            onChange={(e) =>
              onChange({ ...values, startDate: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Data Fim</Label>
          <Input
            type="date"
            value={values.endDate}
            onChange={(e) =>
              onChange({ ...values, endDate: e.target.value })
            }
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Motivo</Label>
          <Input
            value={values.reason}
            onChange={(e) =>
              onChange({ ...values, reason: e.target.value })
            }
            placeholder="Ex: Férias, Folga, etc."
          />
        </div>
        <Button
          type="button"
          onClick={onAdd}
          className="md:col-span-2"
        >
          Adicionar Bloqueio
        </Button>
      </div>
    </div>
  );
};
