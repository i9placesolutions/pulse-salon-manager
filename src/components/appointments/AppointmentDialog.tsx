
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const AppointmentDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Criar Agendamento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novo Agendamento</DialogTitle>
          <DialogDescription>
            Preencha os dados do agendamento. Campos marcados com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="client" className="text-sm font-medium">
              Cliente *
            </label>
            <Input id="client" placeholder="Buscar cliente..." />
          </div>
          <div className="grid gap-2">
            <label htmlFor="service" className="text-sm font-medium">
              Serviço *
            </label>
            <Input id="service" placeholder="Selecionar serviço..." />
          </div>
          <div className="grid gap-2">
            <label htmlFor="professional" className="text-sm font-medium">
              Profissional *
            </label>
            <Input id="professional" placeholder="Escolher profissional..." />
          </div>
          <div className="grid gap-2">
            <label htmlFor="date" className="text-sm font-medium">
              Data e Hora *
            </label>
            <div className="flex gap-2">
              <Input id="date" type="date" className="flex-1" />
              <Input type="time" className="w-32" />
            </div>
          </div>
          <div className="grid gap-2">
            <label htmlFor="notes" className="text-sm font-medium">
              Observações
            </label>
            <textarea
              id="notes"
              className="min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Adicionar observações..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
