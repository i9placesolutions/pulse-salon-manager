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
import { CalendarIcon, Star, Users, DollarSign } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Schema para validação do formulário
const cashbackFormSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  cashbackPercentage: z.coerce.number().min(1, "Porcentagem deve ser maior que 0").max(100, "Porcentagem não pode ser maior que 100"),
  startDate: z.date({
    required_error: "Data de início é obrigatória",
  }),
  endDate: z.date({
    required_error: "Data de término é obrigatória",
  }).optional(),
  customerSegment: z.string(),
  minPurchaseValue: z.coerce.number().optional(),
  maxCashbackValue: z.coerce.number().optional(),
  isActive: z.boolean().default(true),
  expirationDays: z.coerce.number().min(1, "Prazo deve ser pelo menos 1 dia"),
  applicableToNextPurchase: z.boolean(),
});

type CashbackFormValues = z.infer<typeof cashbackFormSchema>;

interface CashbackFormProps {
  onSave: (data: CashbackFormValues) => void;
  onCancel: () => void;
}

export function CashbackForm({ onSave, onCancel }: CashbackFormProps) {
  const [hasMinPurchase, setHasMinPurchase] = useState(false);
  const [hasMaxCashback, setHasMaxCashback] = useState(false);
  
  const form = useForm<CashbackFormValues>({
    resolver: zodResolver(cashbackFormSchema),
    defaultValues: {
      name: "",
      description: "",
      cashbackPercentage: 5,
      customerSegment: "all",
      isActive: true,
      expirationDays: 30,
      applicableToNextPurchase: true,
    },
  });

  const onSubmit = (data: CashbackFormValues) => {
    toast({
      title: "Campanha de cashback criada!",
      description: "A campanha foi salva com sucesso.",
    });
    onSave(data);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          Campanha de Cashback
        </CardTitle>
        <CardDescription>
          Configure os detalhes da sua campanha de cashback para recompensar a fidelidade dos clientes
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
                    <FormLabel>Nome da Campanha</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Cashback Fidelidade" {...field} />
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
                      <FormLabel>Status da Campanha</FormLabel>
                      <FormDescription>
                        Ativar ou desativar campanha
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
                      placeholder="Descreva os detalhes da campanha" 
                      className="min-h-[80px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cashbackPercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Porcentagem de Cashback</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                      <span className="text-muted-foreground">%</span>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Porcentagem do valor da compra que será devolvida como cashback
                  </FormDescription>
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
                      Deixe em branco para campanhas sem data de expiração
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="customerSegment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Segmento de Clientes</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um segmento de clientes" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">Todos os clientes</SelectItem>
                      <SelectItem value="new">Novos clientes</SelectItem>
                      <SelectItem value="returning">Clientes recorrentes</SelectItem>
                      <SelectItem value="vip">Clientes VIP</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Escolha para qual grupo de clientes esta promoção será válida
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="hasMinPurchase" 
                  checked={hasMinPurchase}
                  onCheckedChange={setHasMinPurchase}
                />
                <label htmlFor="hasMinPurchase" className="text-sm font-medium">
                  Valor mínimo de compra
                </label>
              </div>

              {hasMinPurchase && (
                <FormField
                  control={form.control}
                  name="minPurchaseValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <Input 
                            type="number" 
                            placeholder="Valor mínimo (R$)" 
                            {...field} 
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                          <span className="text-muted-foreground">R$</span>
                        </div>
                      </FormControl>
                      <FormDescription>
                        O cliente precisa gastar pelo menos este valor para receber cashback
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="hasMaxCashback" 
                  checked={hasMaxCashback}
                  onCheckedChange={setHasMaxCashback}
                />
                <label htmlFor="hasMaxCashback" className="text-sm font-medium">
                  Limite máximo de cashback
                </label>
              </div>

              {hasMaxCashback && (
                <FormField
                  control={form.control}
                  name="maxCashbackValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <Input 
                            type="number" 
                            placeholder="Valor máximo (R$)" 
                            {...field} 
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                          <span className="text-muted-foreground">R$</span>
                        </div>
                      </FormControl>
                      <FormDescription>
                        O cashback não ultrapassará este valor, independente da porcentagem
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="expirationDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Validade do Cashback</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                        <span className="text-muted-foreground">dias</span>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Número de dias até o cashback expirar
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="applicableToNextPurchase"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0 rounded-md border p-4">
                    <div className="space-y-1">
                      <FormLabel>Uso na próxima compra</FormLabel>
                      <FormDescription>
                        O cliente pode usar o cashback na próxima compra
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
                <DollarSign className="h-4 w-4" />
                Criar Campanha
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
