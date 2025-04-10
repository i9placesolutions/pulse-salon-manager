import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Edit,
  Percent,
  Settings,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Service } from "@/types/service";
import { formatCurrency, parseCurrency } from "@/utils/currency";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

interface Professional {
  id: number;
  name: string;
}

interface ServiceCommissionDialogProps {
  service: Service;
  professionals: Professional[];
  customCommissions?: any[];
  onSave: (commissions: any[]) => void;
}

export function ServiceCommissionDialog({
  service,
  professionals,
  customCommissions = [],
  onSave,
}: ServiceCommissionDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [applyToAll, setApplyToAll] = useState(true);
  const [loading, setLoading] = useState(false);

  const [globalCommissionType, setGlobalCommissionType] = useState<"percentage" | "fixed">(
    service.commission.type
  );
  const [globalCommissionValue, setGlobalCommissionValue] = useState<number>(
    service.commission.value
  );
  const [globalCommissionInput, setGlobalCommissionInput] = useState<string>(
    globalCommissionType === "percentage" 
      ? service.commission.value.toString() 
      : formatCurrency(service.commission.value)
  );

  useEffect(() => {
    if (open) {
      const initialCommissions = professionals.map((prof) => {
        const customCommission = customCommissions.find(
          (c) => c.professionalId === prof.id
        );
        return {
          professionalId: prof.id,
          name: prof.name,
          active: service.professionals?.includes(prof.id) || false,
          commission: customCommission
            ? { ...customCommission.commission }
            : { ...service.commission },
          customInput: customCommission
            ? customCommission.commission.type === "percentage"
              ? customCommission.commission.value.toString()
              : formatCurrency(customCommission.commission.value)
            : globalCommissionType === "percentage"
              ? globalCommissionValue.toString()
              : formatCurrency(globalCommissionValue),
        };
      });
      setCommissions(initialCommissions);
    }
  }, [open, service, professionals, customCommissions, globalCommissionType, globalCommissionValue]);

  const handleGlobalCommissionTypeChange = (type: "percentage" | "fixed") => {
    setGlobalCommissionType(type);
    setGlobalCommissionValue(type === "percentage" ? 50 : 0);
    setGlobalCommissionInput(type === "percentage" ? "50" : "R$ 0,00");
  };

  const handleGlobalCommissionValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setGlobalCommissionInput(value);
    
    try {
      if (globalCommissionType === "percentage") {
        // Para percentual, remove não-numéricos exceto ponto e vírgula
        const numericValue = Number(value.replace(/[^\d]/g, ""));
        setGlobalCommissionValue(numericValue);
      } else {
        // Para valor fixo, usa a função de parse
        const numericValue = parseCurrency(value);
        setGlobalCommissionValue(numericValue);
      }
    } catch (error) {
      console.error("Erro ao converter valor da comissão:", error);
    }
  };

  const applyGlobalCommission = () => {
    setCommissions((prev) =>
      prev.map((c) => ({
        ...c,
        commission: {
          type: globalCommissionType,
          value: globalCommissionValue,
        },
        customInput: globalCommissionType === "percentage" 
          ? globalCommissionValue.toString() 
          : formatCurrency(globalCommissionValue),
      }))
    );
  };

  const handleCommissionTypeChange = (professionalId: number, type: "percentage" | "fixed") => {
    setCommissions((prev) =>
      prev.map((c) =>
        c.professionalId === professionalId
          ? {
              ...c,
              commission: {
                type,
                value: type === "percentage" ? 50 : 0,
              },
              customInput: type === "percentage" ? "50" : "R$ 0,00",
            }
          : c
      )
    );
  };

  const handleCommissionValueChange = (
    professionalId: number,
    value: string
  ) => {
    setCommissions((prev) =>
      prev.map((c) => {
        if (c.professionalId === professionalId) {
          let numericValue = 0;
          
          try {
            if (c.commission.type === "percentage") {
              // Para percentual, remove não-numéricos
              numericValue = Number(value.replace(/[^\d]/g, ""));
            } else {
              // Para valor fixo, usa a função de parse
              numericValue = parseCurrency(value);
            }
          } catch (error) {
            console.error("Erro ao converter valor da comissão:", error);
          }
          
          return {
            ...c,
            commission: {
              ...c.commission,
              value: numericValue,
            },
            customInput: value,
          };
        }
        return c;
      })
    );
  };

  const handleActiveChange = (professionalId: number, active: boolean) => {
    setCommissions((prev) =>
      prev.map((c) =>
        c.professionalId === professionalId ? { ...c, active } : c
      )
    );
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const activeProfessionals = commissions
        .filter((c) => c.active)
        .map((c) => ({
          professionalId: c.professionalId,
          commission: c.commission,
        }));
      
      onSave(activeProfessionals);
      setOpen(false);
      toast({
        title: "Comissões salvas",
        description: "As configurações de comissão foram atualizadas.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar as comissões.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setOpen(true)}
        className="h-8 w-8 text-neutral-500 hover:text-primary hover:bg-primary/10"
      >
        <Settings className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden bg-white">
          <DialogHeader className="px-6 pt-6 pb-4 border-b bg-muted/30">
            <DialogTitle className="text-xl">Configuração de Comissões</DialogTitle>
            <DialogDescription>
              Configure as comissões para <span className="font-medium">{service.name}</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Comissão Padrão</h3>
                <div className="flex items-center">
                  <Switch 
                    id="apply-all" 
                    checked={applyToAll}
                    onCheckedChange={setApplyToAll}
                    className="mr-2"
                  />
                  <label htmlFor="apply-all" className="text-sm cursor-pointer">
                    Aplicar para todos
                  </label>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="grid grid-cols-2 gap-2 flex-1">
                  <Select
                    value={globalCommissionType}
                    onValueChange={(value) => handleGlobalCommissionTypeChange(value as "percentage" | "fixed")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentual (%)</SelectItem>
                      <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    value={globalCommissionInput}
                    onChange={handleGlobalCommissionValueChange}
                  />
                </div>
                <Button 
                  onClick={applyGlobalCommission}
                  variant="outline"
                  className="text-primary border-primary/20 hover:bg-primary/5"
                >
                  Aplicar
                </Button>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[50px]">Ativo</TableHead>
                    <TableHead>Profissional</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissions.map((commission) => (
                    <TableRow 
                      key={commission.professionalId}
                      className="hover:bg-muted/40"
                    >
                      <TableCell className="text-center">
                        <Switch
                          checked={commission.active}
                          onCheckedChange={(checked) =>
                            handleActiveChange(commission.professionalId, checked)
                          }
                        />
                      </TableCell>
                      <TableCell>{commission.name}</TableCell>
                      <TableCell>
                        <Select
                          value={commission.commission.type}
                          onValueChange={(value) =>
                            handleCommissionTypeChange(
                              commission.professionalId,
                              value as "percentage" | "fixed"
                            )
                          }
                          disabled={applyToAll}
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Percentual (%)</SelectItem>
                            <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          value={commission.customInput}
                          onChange={(e) =>
                            handleCommissionValueChange(
                              commission.professionalId,
                              e.target.value
                            )
                          }
                          disabled={applyToAll}
                          className="w-[130px]"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="rounded border p-4 bg-muted/20">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-sm">Resumo de ganhos</h3>
                  <p className="text-sm text-muted-foreground">
                    Valor do serviço: {formatCurrency(service.price)}
                  </p>
                </div>
                <div>
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    {commissions.filter(c => c.active).length} profissionais selecionados
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t bg-muted/20">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={loading} className="bg-primary hover:bg-primary/90">
              Salvar Comissões
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
