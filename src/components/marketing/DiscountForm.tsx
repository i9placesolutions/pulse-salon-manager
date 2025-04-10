import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardFooter, 
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
import { CalendarIcon, Tag, BadgePercent, PencilLine, Users } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "@/components/ui/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Schema para validação do formulário
const discountFormSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  discountType: z.enum(["percentage", "fixed"]),
  value: z.coerce.number().min(1, "Valor deve ser maior que 0"),
  startDate: z.date({
    required_error: "Data de início é obrigatória",
  }),
  endDate: z.date({
    required_error: "Data de término é obrigatória",
  }).optional(),
  customerSegment: z.string(),
  minPurchaseValue: z.coerce.number().optional(),
  maxDiscountValue: z.coerce.number().optional(),
  isActive: z.boolean().default(true),
  maxUsesTotal: z.coerce.number().optional(),
  maxUsesPerCustomer: z.coerce.number().optional(),
  services: z.array(z.string()).optional(),
});

type DiscountFormValues = z.infer<typeof discountFormSchema>;

interface DiscountFormProps {
  onSave: (data: DiscountFormValues) => void;
  onCancel: () => void;
}

export function DiscountForm({ onSave, onCancel }: DiscountFormProps) {
  const [isLimited, setIsLimited] = useState(false);
  const [hasMinPurchase, setHasMinPurchase] = useState(false);
  const [hasMaxDiscount, setHasMaxDiscount] = useState(false);
  
  const form = useForm<DiscountFormValues>({
    resolver: zodResolver(discountFormSchema),
    defaultValues: {
      name: "",
      description: "",
      discountType: "percentage",
      value: 10,
      customerSegment: "all",
      isActive: true,
    },
  });

  const onSubmit = (data: DiscountFormValues) => {
    toast({
      title: "Campanha de desconto criada!",
      description: "A campanha foi salva com sucesso.",
    });
    onSave(data);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BadgePercent className="h-5 w-5 text-primary" />
          Campanha de Desconto Direto
        </CardTitle>
        <CardDescription>
          Configure os detalhes da sua campanha de desconto para atrair mais clientes
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
                      <Input placeholder="Ex: Desconto de Verão" {...field} />
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

            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="discountType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Tipo de Desconto</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="percentage" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Porcentagem (%)
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="fixed" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Valor Fixo (R$)
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {form.watch("discountType") === "percentage" 
                        ? "Porcentagem de Desconto" 
                        : "Valor do Desconto (R$)"}
                    </FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                        <span className="text-muted-foreground">
                          {form.watch("discountType") === "percentage" ? "%" : "R$"}
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                      <SelectItem value="inactive">Clientes inativos</SelectItem>
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
                        O cliente precisa gastar pelo menos este valor para aplicar o desconto
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {form.watch("discountType") === "percentage" && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="hasMaxDiscount" 
                    checked={hasMaxDiscount}
                    onCheckedChange={setHasMaxDiscount}
                  />
                  <label htmlFor="hasMaxDiscount" className="text-sm font-medium">
                    Limite máximo de desconto
                  </label>
                </div>

                {hasMaxDiscount && (
                  <FormField
                    control={form.control}
                    name="maxDiscountValue"
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
                          O desconto não ultrapassará este valor, independente da porcentagem
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="isLimited" 
                  checked={isLimited}
                  onCheckedChange={setIsLimited}
                />
                <label htmlFor="isLimited" className="text-sm font-medium">
                  Limitar número de usos
                </label>
              </div>

              {isLimited && (
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="maxUsesTotal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Máximo de usos total</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Número máximo de vezes que esta promoção pode ser utilizada
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxUsesPerCustomer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Máximo por cliente</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Quantas vezes cada cliente pode usar esta promoção
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
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
                <Tag className="h-4 w-4" />
                Criar Campanha
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
