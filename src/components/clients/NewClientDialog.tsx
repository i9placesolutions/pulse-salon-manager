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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
        <DialogHeader className="bg-gradient-to-r from-primary/30 to-primary/10 p-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <UserPlus className="h-4 w-4 text-primary-dark" />
            </div>
            <DialogTitle className="text-xl">Novo Cliente</DialogTitle>
          </div>
          <DialogDescription>
            Cadastre um novo cliente com poucos dados. 
            Complete o perfil mais tarde se necessário.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-5">
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
                    : phoneTouched && !phoneError && phone.length > 0
                    ? "border-green-400 focus-visible:ring-green-400" 
                    : ""
                )}
              />
              {phoneTouched && (phoneError ? (
                <AlertTriangle className="h-4 w-4 text-red-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
              ) : phone.length > 0 && (
                <CheckCircle2 className="h-4 w-4 text-green-600 absolute right-3 top-1/2 transform -translate-y-1/2" />
              ))}
            </div>
            {phoneError ? (
              <p className="text-xs text-red-500 mt-1">{phoneError}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Formato: (00) 00000-0000
              </p>
            )}
          </div>

          {/* Data de nascimento */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="birthDate" className="text-sm font-medium">
                Data de nascimento <span className="text-red-500">*</span>
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
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !birthDate && "text-muted-foreground",
                      birthDateTouched && birthDateError 
                        ? "border-red-400" 
                        : birthDateTouched && !birthDateError && birthDate
                        ? "border-green-400" 
                        : ""
                    )}
                    onClick={() => setBirthDateTouched(true)}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {birthDate ? (
                      format(birthDate, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecione a data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    captionLayout="dropdown-buttons"
                    selected={birthDate}
                    onSelect={handleDateSelect}
                    disabled={(date) => date > new Date()}
                    initialFocus
                    fromYear={1920}
                    toYear={new Date().getFullYear()}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
              {birthDateTouched && birthDate && !birthDateError && (
                <CheckCircle2 className="h-4 w-4 text-green-600 absolute right-3 top-1/2 transform -translate-y-1/2" />
              )}
            </div>
            {birthDateError && (
              <p className="text-xs text-red-500 mt-1">{birthDateError}</p>
            )}
          </div>
        </div>

        <DialogFooter className="p-6 pt-0">
          <div className="w-full space-y-2">
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={!formValid || isSubmitting}
              className={cn(
                "w-full rounded-full bg-primary hover:bg-primary-dark h-10 transition-all duration-200",
                !formValid && "opacity-50 cursor-not-allowed"
              )}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Salvando...
                </div>
              ) : (
                "Salvar Cliente"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full rounded-full border-gray-300 text-neutral"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>

            <div className="text-center mt-3">
              <p className="text-xs text-muted-foreground">
                <span className="text-red-500">*</span> Campos obrigatórios
              </p>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 