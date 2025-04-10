import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, AlertCircle, X, Ban, CheckCircle2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetClose
} from "@/components/ui/sheet";

export interface BlockTimeFormData {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  reason?: string;
}

interface BlockTimeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (blockData: BlockTimeFormData) => void;
}

export const BlockTimeDialog = ({ open, onOpenChange, onConfirm }: BlockTimeDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<BlockTimeFormData>({
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    startTime: "09:00",
    endTime: "18:00",
    reason: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Validação dos campos
  const [formErrors, setFormErrors] = useState({
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: ""
  });
  
  // Estado para controlar se os campos foram tocados
  const [touched, setTouched] = useState({
    startDate: false,
    endDate: false,
    startTime: false,
    endTime: false
  });
  
  // Resetar o formulário quando o modal é aberto
  useEffect(() => {
    if (open) {
      setFormData({
        startDate: format(new Date(), "yyyy-MM-dd"),
        endDate: format(new Date(), "yyyy-MM-dd"),
        startTime: "09:00",
        endTime: "18:00",
        reason: ""
      });
      setFormErrors({
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: ""
      });
      setTouched({
        startDate: false,
        endDate: false,
        startTime: false,
        endTime: false
      });
      setIsSubmitting(false);
    }
  }, [open]);
  
  const validateField = (field: keyof typeof formErrors, value: string): string => {
    switch (field) {
      case "startDate":
        return value ? "" : "Data inicial é obrigatória";
      case "endDate":
        if (!value) return "Data final é obrigatória";
        if (value < formData.startDate) return "Data final deve ser posterior à data inicial";
        return "";
      case "startTime":
        return value ? "" : "Horário inicial é obrigatório";
      case "endTime":
        if (!value) return "Horário final é obrigatório";
        if (formData.startDate === formData.endDate && value <= formData.startTime) {
          return "Horário final deve ser posterior ao horário inicial";
        }
        return "";
      default:
        return "";
    }
  };
  
  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    // Atualiza o estado do formulário
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Marca o campo como tocado
    if (!touched[field as keyof typeof touched]) {
      setTouched(prev => ({ ...prev, [field]: true }));
    }
    
    // Valida o campo
    if (field in formErrors) {
      const error = validateField(field as keyof typeof formErrors, value);
      setFormErrors(prev => ({ ...prev, [field]: error }));
      
      // Se estamos alterando datas ou horários, revalidar também os campos relacionados
      if (field === "startDate" && formData.endDate) {
        const endDateError = validateField("endDate", formData.endDate);
        setFormErrors(prev => ({ ...prev, endDate: endDateError }));
      } else if (field === "startTime" && formData.endTime) {
        const endTimeError = validateField("endTime", formData.endTime);
        setFormErrors(prev => ({ ...prev, endTime: endTimeError }));
      }
    }
  };
  
  const isFormValid = (): boolean => {
    return !formErrors.startDate && 
           !formErrors.endDate && 
           !formErrors.startTime && 
           !formErrors.endTime;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validar todos os campos
    const allTouched = {
      startDate: true,
      endDate: true,
      startTime: true,
      endTime: true
    };
    setTouched(allTouched);
    
    // Validações básicas
    const startDateError = validateField("startDate", formData.startDate);
    const endDateError = validateField("endDate", formData.endDate);
    const startTimeError = validateField("startTime", formData.startTime);
    const endTimeError = validateField("endTime", formData.endTime);
    
    setFormErrors({
      startDate: startDateError,
      endDate: endDateError,
      startTime: startTimeError,
      endTime: endTimeError
    });
    
    if (startDateError || endDateError || startTimeError || endTimeError) {
      setIsSubmitting(false);
      return;
    }

    // Simulando uma chamada API
    await new Promise(resolve => setTimeout(resolve, 800));
    
    onConfirm(formData);
    setIsSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="p-0 w-full max-w-full sm:max-w-2xl border-l flex flex-col h-[100dvh] bg-white">
        {/* Cabeçalho fixo */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-indigo-600 border-b">
          <SheetHeader className="p-6">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl flex items-center gap-2 text-white">
                <Ban className="h-5 w-5 text-white" />
                Bloquear Horários
              </SheetTitle>
              <SheetClose className="rounded-full opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-white">
                <X className="h-4 w-4" />
                <span className="sr-only">Fechar</span>
              </SheetClose>
            </div>
            <SheetDescription className="text-blue-100">
              Selecione o período em que o salão não aceitará agendamentos.
            </SheetDescription>
          </SheetHeader>
        </div>
        
        {/* Conteúdo rolável */}
        <div className="flex-1 overflow-y-auto bg-white p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Período do Bloqueio <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Data Inicial</Label>
                    <Input
                      type="date"
                      className={cn(
                        touched.startDate && formErrors.startDate ? "border-destructive" : "",
                        touched.startDate && !formErrors.startDate ? "border-green-500" : ""
                      )}
                      value={formData.startDate}
                      min={format(new Date(), "yyyy-MM-dd")}
                      onChange={(e) => handleFieldChange("startDate", e.target.value)}
                      required
                    />
                    {touched.startDate && formErrors.startDate && (
                      <div className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {formErrors.startDate}
                      </div>
                    )}
                    {touched.startDate && !formErrors.startDate && (
                      <div className="text-xs text-green-500 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Data válida
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Data Final</Label>
                    <Input
                      type="date"
                      className={cn(
                        touched.endDate && formErrors.endDate ? "border-destructive" : "",
                        touched.endDate && !formErrors.endDate ? "border-green-500" : ""
                      )}
                      value={formData.endDate}
                      min={formData.startDate}
                      onChange={(e) => handleFieldChange("endDate", e.target.value)}
                      required
                    />
                    {touched.endDate && formErrors.endDate && (
                      <div className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {formErrors.endDate}
                      </div>
                    )}
                    {touched.endDate && !formErrors.endDate && (
                      <div className="text-xs text-green-500 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Data válida
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Horário do Bloqueio <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Horário Inicial</Label>
                    <Input
                      type="time"
                      className={cn(
                        touched.startTime && formErrors.startTime ? "border-destructive" : "",
                        touched.startTime && !formErrors.startTime ? "border-green-500" : ""
                      )}
                      value={formData.startTime}
                      onChange={(e) => handleFieldChange("startTime", e.target.value)}
                      required
                    />
                    {touched.startTime && formErrors.startTime && (
                      <div className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {formErrors.startTime}
                      </div>
                    )}
                    {touched.startTime && !formErrors.startTime && (
                      <div className="text-xs text-green-500 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Horário válido
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Horário Final</Label>
                    <Input
                      type="time"
                      className={cn(
                        touched.endTime && formErrors.endTime ? "border-destructive" : "",
                        touched.endTime && !formErrors.endTime ? "border-green-500" : ""
                      )}
                      value={formData.endTime}
                      onChange={(e) => handleFieldChange("endTime", e.target.value)}
                      required
                    />
                    {touched.endTime && formErrors.endTime && (
                      <div className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {formErrors.endTime}
                      </div>
                    )}
                    {touched.endTime && !formErrors.endTime && (
                      <div className="text-xs text-green-500 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Horário válido
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  Motivo do Bloqueio (Opcional)
                </Label>
                <textarea
                  className="min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Descreva o motivo do bloqueio..."
                  value={formData.reason || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                />
              </div>
            </div>
          </form>
        </div>
        
        {/* Rodapé fixo */}
        <div className="sticky bottom-0 mt-auto p-6 border-t bg-white shadow-sm">
          <div className="flex flex-row gap-3 w-full justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="gap-2"
              disabled={isSubmitting}
            >
              <X className="h-4 w-4" />
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="gap-2"
              onClick={handleSubmit}
              disabled={!isFormValid() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                  Processando...
                </>
              ) : (
                <>
                  <Ban className="h-4 w-4" />
                  Confirmar Bloqueio
                </>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};