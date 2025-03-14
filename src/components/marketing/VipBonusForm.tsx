import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Users, Crown, Plus, X } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

// Schema para validação do formulário
const vipBonusFormSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  startDate: z.date({
    required_error: "Data de início é obrigatória",
  }),
  endDate: z.date({
    required_error: "Data de término é obrigatória",
  }).optional(),
  eligibilityCriteria: z.object({
    minSpend: z.coerce.number().optional(),
    minServices: z.coerce.number().optional(),
    visitsPerMonth: z.coerce.number().optional(),
    referrals: z.coerce.number().optional(),
  }),
  benefits: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
    })
  ),
  isActive: z.boolean().default(true),
});

type VipBonusFormValues = z.infer<typeof vipBonusFormSchema>;

interface VipBonusFormProps {
  onSave: (data: VipBonusFormValues) => void;
  onCancel: () => void;
}

export function VipBonusForm({ onSave, onCancel }: VipBonusFormProps) {
  const [newBenefit, setNewBenefit] = useState("");
  const [newBenefitDesc, setNewBenefitDesc] = useState("");
  const [showMinSpend, setShowMinSpend] = useState(false);
  const [showMinServices, setShowMinServices] = useState(false);
  const [showVisitsPerMonth, setShowVisitsPerMonth] = useState(false);
  const [showReferrals, setShowReferrals] = useState(false);
  
  const form = useForm<VipBonusFormValues>({
    resolver: zodResolver(vipBonusFormSchema),
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
      eligibilityCriteria: {},
      benefits: [
        { id: "1", name: "Desconto exclusivo em serviços", description: "10% de desconto em todos os serviços" },
        { id: "2", name: "Prioridade no agendamento", description: "Acesso prioritário a novos horários" },
      ],
    },
  });

  const addBenefit = () => {
    if (!newBenefit.trim()) return;
    
    form.setValue("benefits", [
      ...form.getValues().benefits,
      {
        id: Date.now().toString(),
        name: newBenefit,
        description: newBenefitDesc || undefined,
      }
    ]);
    setNewBenefit("");
    setNewBenefitDesc("");
  };

  const removeBenefit = (id: string) => {
    form.setValue(
      "benefits", 
      form.getValues().benefits.filter(b => b.id !== id)
    );
  };

  const onSubmit = (data: VipBonusFormValues) => {
    toast({
      title: "Programa VIP criado!",
      description: "O programa de benefícios foi salvo com sucesso.",
    });
    onSave(data);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-primary" />
          Programa de Bônus VIP
        </CardTitle>
        <CardDescription>
          Configure um programa exclusivo de benefícios para seus clientes mais fiéis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Programa</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Clube VIP Pulse" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0 rounded-md border p-4">
                    <div className="space-y-1">
                      <FormLabel>Status do Programa</FormLabel>
                      <FormDescription>
                        Ativar ou desativar o programa
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva os detalhes do programa" 
                      className="min-h-[80px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Início</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: ptBR })
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Término (opcional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: ptBR })
                            ) : (
                              <span>Sem data de término</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Deixe em branco para programas sem data de expiração
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormLabel>Critérios de Elegibilidade</FormLabel>
              <FormDescription>
                Selecione os critérios para que um cliente seja considerado VIP
              </FormDescription>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="minSpend" 
                    checked={showMinSpend}
                    onCheckedChange={(checked) => setShowMinSpend(checked as boolean)}
                  />
                  <label htmlFor="minSpend" className="text-sm font-medium">
                    Gasto mínimo
                  </label>
                </div>

                {showMinSpend && (
                  <FormField
                    control={form.control}
                    name="eligibilityCriteria.minSpend"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <Input 
                              type="number" 
                              placeholder="Valor (R$)" 
                              {...field} 
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                            <span className="text-muted-foreground">R$ / mês</span>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Valor mínimo que o cliente precisa gastar mensalmente
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="minServices" 
                    checked={showMinServices}
                    onCheckedChange={(checked) => setShowMinServices(checked as boolean)}
                  />
                  <label htmlFor="minServices" className="text-sm font-medium">
                    Serviços mínimos
                  </label>
                </div>

                {showMinServices && (
                  <FormField
                    control={form.control}
                    name="eligibilityCriteria.minServices"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <Input 
                              type="number" 
                              placeholder="Quantidade" 
                              {...field} 
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                            <span className="text-muted-foreground">serviços / mês</span>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Número mínimo de serviços que o cliente precisa contratar mensalmente
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="visitsPerMonth" 
                    checked={showVisitsPerMonth}
                    onCheckedChange={(checked) => setShowVisitsPerMonth(checked as boolean)}
                  />
                  <label htmlFor="visitsPerMonth" className="text-sm font-medium">
                    Visitas mensais
                  </label>
                </div>

                {showVisitsPerMonth && (
                  <FormField
                    control={form.control}
                    name="eligibilityCriteria.visitsPerMonth"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <Input 
                              type="number" 
                              placeholder="Quantidade" 
                              {...field} 
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                            <span className="text-muted-foreground">visitas / mês</span>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Número mínimo de visitas que o cliente precisa fazer mensalmente
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="referrals" 
                    checked={showReferrals}
                    onCheckedChange={(checked) => setShowReferrals(checked as boolean)}
                  />
                  <label htmlFor="referrals" className="text-sm font-medium">
                    Indicações
                  </label>
                </div>

                {showReferrals && (
                  <FormField
                    control={form.control}
                    name="eligibilityCriteria.referrals"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <Input 
                              type="number" 
                              placeholder="Quantidade" 
                              {...field} 
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                            <span className="text-muted-foreground">indicações</span>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Número mínimo de clientes indicados pelo cliente
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>

            <div className="space-y-4">
              <FormLabel>Benefícios VIP</FormLabel>
              <FormDescription>
                Adicione os benefícios que os clientes VIP receberão
              </FormDescription>

              <div className="flex flex-wrap gap-2 my-2">
                {form.watch("benefits").map((benefit) => (
                  <Badge key={benefit.id} variant="secondary" className="p-2 gap-2 text-xs">
                    <span>{benefit.name}</span>
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="sm" 
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => removeBenefit(benefit.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>

              <div className="space-y-2">
                <div className="grid gap-2">
                  <Input 
                    placeholder="Nome do benefício" 
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                  />
                  <Input 
                    placeholder="Descrição (opcional)" 
                    value={newBenefitDesc}
                    onChange={(e) => setNewBenefitDesc(e.target.value)}
                  />
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addBenefit}
                  className="gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Adicionar Benefício
                </Button>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button 
                variant="outline" 
                type="button" 
                onClick={onCancel}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="gap-2"
              >
                <Users className="h-4 w-4" />
                Criar Programa VIP
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
