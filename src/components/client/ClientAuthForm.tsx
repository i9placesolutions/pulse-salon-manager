import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/components/ui/use-toast";
import { authenticateClient } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";

// Schema de validação
const authFormSchema = z.object({
  phone: z
    .string()
    .min(10, { message: "Telefone deve ter pelo menos 10 dígitos" })
    .max(15, { message: "Telefone não pode ter mais de 15 dígitos" }),
  birthDate: z.date({
    required_error: "Por favor, selecione sua data de nascimento",
  }),
});

// Tipo do formulário
type AuthFormValues = z.infer<typeof authFormSchema>;

// Props do componente
interface ClientAuthFormProps {
  onAuthenticated: (clientId: string) => void;
}

export function ClientAuthForm({ onAuthenticated }: ClientAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Configuração do formulário
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      phone: "",
    },
  });

  // Função para autenticar o cliente
  const handleAuthenticate = async (values: AuthFormValues) => {
    try {
      setIsLoading(true);

      // Formata a data para o formato YYYY-MM-DD
      const formattedDate = format(values.birthDate, "yyyy-MM-dd");

      // Tenta autenticar o cliente
      const client = await authenticateClient(values.phone, formattedDate);

      if (client) {
        toast({
          title: "Autenticação bem-sucedida",
          description: `Bem-vindo(a) ${client.name}!`,
        });
        onAuthenticated(client.id);
      } else {
        toast({
          title: "Falha na autenticação",
          description: "Telefone ou data de nascimento incorretos.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao autenticar:", error);
      toast({
        title: "Erro ao autenticar",
        description: "Ocorreu um erro ao verificar seus dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Acesso ao Cliente</CardTitle>
        <CardDescription>
          Acesse seu histórico de agendamentos usando seu telefone e data de nascimento.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={form.handleSubmit(handleAuthenticate)}>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone (WhatsApp)</Label>
            <Input
              id="phone"
              placeholder="(00) 00000-0000"
              {...form.register("phone")}
              disabled={isLoading}
            />
            {form.formState.errors.phone && (
              <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Data de Nascimento</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !form.getValues("birthDate") && "text-muted-foreground"
                  )}
                  disabled={isLoading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.getValues("birthDate") ? (
                    format(form.getValues("birthDate"), "PPP", { locale: ptBR })
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={form.getValues("birthDate")}
                  onSelect={(date) => date && form.setValue("birthDate", date)}
                  disabled={(date) => date > new Date()}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
            {form.formState.errors.birthDate && (
              <p className="text-sm text-red-500">{form.formState.errors.birthDate.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              "Acessar Histórico"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
