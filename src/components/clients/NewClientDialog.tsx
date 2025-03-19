import { useState, useEffect } from "react";
import { Client } from "@/types/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/components/ui/use-toast";
import { CalendarIcon, CheckCircle2, UserPlus, X, AlertTriangle } from "lucide-react";
import { format, isValid, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose
} from "@/components/ui/sheet";

interface NewClientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Partial<Client>) => void;
}

export function NewClientDialog({ isOpen, onClose, onSave }: NewClientDialogProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  // Estados para validação
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [birthDateError, setBirthDateError] = useState("");
  const [formValid, setFormValid] = useState(false);
  
  // Estados de feedback visual
  const [nameTouched, setNameTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [birthDateTouched, setBirthDateTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resetar o formulário quando abrir/fechar o modal
  useEffect(() => {
    if (isOpen) {
      setName("");
      setPhone("");
      setBirthDate(undefined);
      setNameError("");
      setPhoneError("");
      setBirthDateError("");
      setNameTouched(false);
      setPhoneTouched(false);
      setBirthDateTouched(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Validar o formulário sempre que os valores mudarem
  useEffect(() => {
    validateName(name);
    validatePhone(phone);
    validateBirthDate(birthDate);
    
    const formIsValid = name.trim().length >= 3 && 
      phone.replace(/\D/g, "").length >= 11 && 
      birthDate !== undefined && isValid(birthDate);
    
    setFormValid(formIsValid);
  }, [name, phone, birthDate]);

  // Funções de validação
  const validateName = (value: string) => {
    if (value.trim().length === 0 && nameTouched) {
      setNameError("Nome é obrigatório");
      return false;
    } else if (value.trim().length < 3 && nameTouched) {
      setNameError("Nome deve ter pelo menos 3 caracteres");
      return false;
    } else {
      setNameError("");
      return true;
    }
  };

  const validatePhone = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "");
    if (digitsOnly.length === 0 && phoneTouched) {
      setPhoneError("Telefone é obrigatório");
      return false;
    } else if (digitsOnly.length < 11 && phoneTouched) {
      setPhoneError("Telefone inválido");
      return false;
    } else {
      setPhoneError("");
      return true;
    }
  };

  const validateBirthDate = (value: Date | undefined) => {
    if (!value && birthDateTouched) {
      setBirthDateError("Data de nascimento é obrigatória");
      return false;
    } else if (value && value > new Date() && birthDateTouched) {
      setBirthDateError("Data não pode ser futura");
      return false;
    } else {
      setBirthDateError("");
      return true;
    }
  };

  // Aplicar máscara ao telefone
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    
    if (value.length <= 11) {
      // Formatar como (XX) XXXXX-XXXX
      if (value.length > 0) {
        value = `(${value.slice(0, 2)}${value.length > 2 ? `) ${value.slice(2, 7)}` : ""}${
          value.length > 7 ? `-${value.slice(7, 11)}` : ""
        }`;
      }
      setPhone(value);
    }
  };

  // Manipular seleção de data
  const handleDateSelect = (date: Date | undefined) => {
    setBirthDate(date);
    setBirthDateTouched(true);
    setCalendarOpen(false);
  };

  // Manipular envio do formulário
  const handleSubmit = () => {
    if (!formValid) return;
    
    setIsSubmitting(true);
    
    // Formatando a data para string no formato YYYY-MM-DD
    const formattedDate = birthDate ? format(birthDate, "yyyy-MM-dd") : "";
    
    // Preparando o objeto cliente para salvar
    const newClient: Partial<Client> = {
      name,
      phone,
      birthDate: formattedDate,
      status: "active",
      points: 0,
      cashback: 0,
      totalSpent: 0,
      visitsCount: 0,
      firstVisit: format(new Date(), "yyyy-MM-dd")
    };
    
    // Simular um pequeno delay para mostrar o estado de submissão
    setTimeout(() => {
      onSave(newClient);
      setIsSubmitting(false);
      
      toast({
        title: "Cliente cadastrado com sucesso!",
        description: `${name} foi adicionado à sua base de clientes.`,
      });
      
      onClose();
    }, 500);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="p-0 w-full max-w-full sm:max-w-2xl border-l flex flex-col h-[100dvh] bg-white">
        {/* Cabeçalho fixo */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-indigo-600 border-b">
          <SheetHeader className="p-6">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl flex items-center gap-2 text-white">
                <UserPlus className="h-5 w-5 text-white" />
                Novo Cliente
              </SheetTitle>
              <SheetClose className="rounded-full opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-white">
                <X className="h-4 w-4" />
                <span className="sr-only">Fechar</span>
              </SheetClose>
            </div>
            <SheetDescription className="text-blue-100">
              Cadastre um novo cliente com poucos dados. Complete o perfil mais tarde se necessário.
            </SheetDescription>
          </SheetHeader>
        </div>

        {/* Conteúdo rolável */}
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="p-6 space-y-6">
            {/* Nome completo */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nome completo <span className="text-red-500">*</span>
                </Label>
                {nameTouched && !nameError && (
                  <div className="flex items-center text-green-600 text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    <span>Válido</span>
                  </div>
                )}
              </div>
              <div className="relative">
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setNameTouched(true)}
                  placeholder="Digite o nome do cliente"
                  className={cn(
                    "transition-all pr-8",
                    nameTouched && nameError 
                      ? "border-red-400 focus-visible:ring-red-400" 
                      : nameTouched && !nameError 
                      ? "border-green-400 focus-visible:ring-green-400" 
                      : ""
                  )}
                />
                {nameTouched && (nameError ? (
                  <AlertTriangle className="h-4 w-4 text-red-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-green-600 absolute right-3 top-1/2 transform -translate-y-1/2" />
                ))}
              </div>
              {nameError && (
                <p className="text-xs text-red-500 mt-1">{nameError}</p>
              )}
            </div>

            {/* WhatsApp */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="phone" className="text-sm font-medium">
                  WhatsApp <span className="text-red-500">*</span>
                </Label>
                {phoneTouched && !phoneError && (
                  <div className="flex items-center text-green-600 text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    <span>Válido</span>
                  </div>
                )}
              </div>
              <div className="relative">
                <Input
                  id="phone"
                  value={phone}
                  onChange={handlePhoneChange}
                  onBlur={() => setPhoneTouched(true)}
                  placeholder="(00) 00000-0000"
                  className={cn(
                    "transition-all pr-8",
                    phoneTouched && phoneError 
                      ? "border-red-400 focus-visible:ring-red-400" 
                      : phoneTouched && !phoneError 
                      ? "border-green-400 focus-visible:ring-green-400" 
                      : ""
                  )}
                />
                {phoneTouched && (phoneError ? (
                  <AlertTriangle className="h-4 w-4 text-red-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-green-600 absolute right-3 top-1/2 transform -translate-y-1/2" />
                ))}
              </div>
              {phoneError && (
                <p className="text-xs text-red-500 mt-1">{phoneError}</p>
              )}
            </div>

            {/* Data de Nascimento */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="birthdate" className="text-sm font-medium">
                  Data de Nascimento <span className="text-red-500">*</span>
                </Label>
                {birthDateTouched && !birthDateError && birthDate && (
                  <div className="flex items-center text-green-600 text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    <span>Válido</span>
                  </div>
                )}
              </div>
              <div className="relative">
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <div className="relative">
                      <Button
                        variant="outline"
                        onClick={() => setCalendarOpen(true)}
                        className={cn(
                          "w-full justify-start text-left font-normal pr-8",
                          !birthDate && "text-muted-foreground",
                          birthDateTouched && birthDateError 
                            ? "border-red-400 focus-visible:ring-red-400" 
                            : birthDateTouched && !birthDateError && birthDate
                            ? "border-green-400 focus-visible:ring-green-400" 
                            : ""
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {birthDate ? (
                          format(birthDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                        ) : (
                          <span>Selecionar data</span>
                        )}
                      </Button>
                      {birthDateTouched && (birthDateError ? (
                        <AlertTriangle className="h-4 w-4 text-red-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
                      ) : birthDate && (
                        <CheckCircle2 className="h-4 w-4 text-green-600 absolute right-3 top-1/2 transform -translate-y-1/2" />
                      ))}
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={birthDate}
                      onSelect={handleDateSelect}
                      onDayClick={() => setBirthDateTouched(true)}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {birthDateError && (
                <p className="text-xs text-red-500 mt-1">{birthDateError}</p>
              )}
            </div>

            <div className="my-6">
              <p className="text-sm text-muted-foreground italic">
                Todos os campos marcados com <span className="text-red-500">*</span> são obrigatórios. 
                Informações adicionais podem ser preenchidas posteriormente.
              </p>
            </div>
          </div>
        </div>
        
        {/* Rodapé fixo */}
        <div className="sticky bottom-0 mt-auto p-6 border-t bg-white shadow-sm">
          <div className="flex flex-row gap-3 w-full justify-end">
            <Button 
              variant="outline" 
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button 
              variant="pink"
              onClick={handleSubmit}
              disabled={!formValid || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2"></span>
                  Cadastrando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Salvar Cliente
                </>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
} 