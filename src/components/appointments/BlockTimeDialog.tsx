
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, AlertCircle, X, Ban, CheckCircle2, Calendar as CalendarIcon, User, Plus, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

export interface BlockTimeData {
  id?: number;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  reason?: string;
  professionalId?: number | null;
  blockFullDay: boolean;
}

interface BlockTimeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (blockData: BlockTimeData) => void;
  professionals?: { id: number; name: string }[];
  existingBlocks?: BlockTimeData[];
  onDeleteBlock?: (id: number) => void;
}

export const BlockTimeDialog = ({ 
  open, 
  onOpenChange, 
  onConfirm,
  professionals = [],
  existingBlocks = [],
  onDeleteBlock
}: BlockTimeDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<BlockTimeData>({
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    startTime: "09:00",
    endTime: "18:00",
    reason: "",
    professionalId: null,
    blockFullDay: false
  });
  
  // Adicionei bloqueios temporários para salvar múltiplos bloqueios
  const [temporaryBlocks, setTemporaryBlocks] = useState<BlockTimeData[]>([]);
  
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
        reason: "",
        professionalId: null,
        blockFullDay: false
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
      setTemporaryBlocks([]);
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
        if (formData.blockFullDay) return "";
        return value ? "" : "Horário inicial é obrigatório";
      case "endTime":
        if (formData.blockFullDay) return "";
        if (!value) return "Horário final é obrigatório";
        if (formData.startDate === formData.endDate && value <= formData.startTime) {
          return "Horário final deve ser posterior ao horário inicial";
        }
        return "";
      default:
        return "";
    }
  };
  
  const handleFieldChange = (field: keyof BlockTimeData, value: any) => {
    // Atualiza o estado do formulário
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Se estamos alterando o blockFullDay, precisamos atualizar a validação dos horários
    if (field === "blockFullDay") {
      // Se vamos bloquear o dia todo, removemos os erros dos campos de horário
      if (value === true) {
        setFormErrors(prev => ({ ...prev, startTime: "", endTime: "" }));
      } else {
        // Se não vamos mais bloquear o dia todo, precisamos revalidar os horários
        const startTimeError = validateField("startTime", formData.startTime);
        const endTimeError = validateField("endTime", formData.endTime);
        setFormErrors(prev => ({ 
          ...prev, 
          startTime: startTimeError, 
          endTime: endTimeError 
        }));
      }
      return;
    }
    
    // Marca o campo como tocado
    if (field in touched && !touched[field as keyof typeof touched]) {
      setTouched(prev => ({ ...prev, [field]: true }));
    }
    
    // Valida o campo
    if (field in formErrors) {
      const error = validateField(field as keyof typeof formErrors, String(value));
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
    // Se blockFullDay é true, não precisamos validar os horários
    if (formData.blockFullDay) {
      return !formErrors.startDate && !formErrors.endDate;
    }
    
    return !formErrors.startDate && 
           !formErrors.endDate && 
           !formErrors.startTime && 
           !formErrors.endTime;
  };

  const addTemporaryBlock = () => {
    // Validação básica antes de adicionar
    if (!isFormValid()) {
      // Marcar todos os campos como tocados para mostrar erros
      setTouched({
        startDate: true,
        endDate: true,
        startTime: true,
        endTime: true
      });
      return;
    }
    
    // Adicionar o bloco atual à lista temporária
    const newBlock: BlockTimeData = {
      ...formData,
      id: Date.now() // ID temporário
    };
    
    setTemporaryBlocks(prev => [...prev, newBlock]);
    
    // Resetar o formulário para um novo bloqueio
    setFormData({
      startDate: format(new Date(), "yyyy-MM-dd"),
      endDate: format(new Date(), "yyyy-MM-dd"),
      startTime: "09:00",
      endTime: "18:00",
      reason: "",
      professionalId: null,
      blockFullDay: false
    });
    
    setTouched({
      startDate: false,
      endDate: false,
      startTime: false,
      endTime: false
    });
    
    toast({
      title: "Horário adicionado",
      description: "O bloqueio foi adicionado à lista. Você pode adicionar mais ou salvar.",
    });
  };
  
  const removeTemporaryBlock = (id: number) => {
    setTemporaryBlocks(prev => prev.filter(block => block.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Se temos bloqueios temporários, vamos salvar todos eles
    if (temporaryBlocks.length > 0) {
      setIsSubmitting(true);
      
      // Simulando uma chamada API para cada bloco
      await Promise.all(temporaryBlocks.map(block => 
        new Promise(resolve => setTimeout(() => {
          onConfirm(block);
          resolve(null);
        }, 300))
      ));
      
      setIsSubmitting(false);
      onOpenChange(false);
      return;
    }
    
    // Se não temos bloqueios temporários, validamos o formulário atual
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
    
    let startTimeError = "";
    let endTimeError = "";
    
    if (!formData.blockFullDay) {
      startTimeError = validateField("startTime", formData.startTime);
      endTimeError = validateField("endTime", formData.endTime);
    }
    
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
  
  // Formatar o nome do profissional de acordo com o ID
  const getProfessionalName = (id: number | null | undefined) => {
    if (!id) return "Bloqueio Geral";
    const professional = professionals.find(p => p.id === id);
    return professional ? professional.name : "Profissional Desconhecido";
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
              Selecione o período em que não aceitará agendamentos.
            </SheetDescription>
          </SheetHeader>
        </div>
        
        {/* Conteúdo rolável */}
        <ScrollArea className="flex-1 overflow-y-auto bg-white p-6">
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            {/* Tipo de bloqueio: Geral ou Profissional específico */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Tipo de Bloqueio <span className="text-destructive">*</span>
                </Label>
                <Select 
                  value={formData.professionalId ? String(formData.professionalId) : "geral"}
                  onValueChange={(value) => {
                    const professionalId = value === "geral" ? null : Number(value);
                    handleFieldChange("professionalId", professionalId);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o tipo de bloqueio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="geral">Bloqueio Geral</SelectItem>
                    {professionals.map((professional) => (
                      <SelectItem key={professional.id} value={String(professional.id)}>
                        {professional.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

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

              {/* Opção para bloquear o dia todo */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="block-all-day"
                  checked={formData.blockFullDay}
                  onCheckedChange={(checked) => handleFieldChange("blockFullDay", checked)}
                />
                <Label htmlFor="block-all-day" className="cursor-pointer">
                  Bloquear o dia todo
                </Label>
              </div>

              {/* Horários - apenas exibidos se não estiver bloqueando o dia todo */}
              {!formData.blockFullDay && (
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
                        required={!formData.blockFullDay}
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
                        required={!formData.blockFullDay}
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
              )}

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
              
              {/* Botão para adicionar mais um bloqueio */}
              <Button
                type="button"
                variant="outline"
                onClick={addTemporaryBlock}
                disabled={!isFormValid()}
                className="w-full mt-4 gap-2"
              >
                <Plus className="h-4 w-4" />
                Adicionar este bloqueio à lista
              </Button>
            </div>
            
            {/* Lista de bloqueios temporários */}
            {temporaryBlocks.length > 0 && (
              <div className="space-y-4 mt-6">
                <h3 className="text-lg font-medium border-b pb-2">Bloqueios a serem salvos</h3>
                <div className="space-y-3">
                  {temporaryBlocks.map((block) => (
                    <Card key={block.id} className="p-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="font-medium">{getProfessionalName(block.professionalId)}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(block.startDate), "dd/MM/yyyy")}
                            {block.startDate !== block.endDate && ` até ${format(new Date(block.endDate), "dd/MM/yyyy")}`}
                          </div>
                          {block.blockFullDay ? (
                            <div className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 inline-block">
                              Dia inteiro
                            </div>
                          ) : (
                            <div className="text-sm">
                              {block.startTime} - {block.endTime}
                            </div>
                          )}
                          {block.reason && <div className="text-sm italic">"{block.reason}"</div>}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-destructive"
                          onClick={() => block.id && removeTemporaryBlock(block.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {/* Lista de bloqueios existentes */}
            {existingBlocks && existingBlocks.length > 0 && (
              <div className="space-y-4 mt-6">
                <h3 className="text-lg font-medium border-b pb-2">Bloqueios Existentes</h3>
                <div className="space-y-3">
                  {existingBlocks.map((block) => (
                    <Card key={block.id} className="p-3 bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="font-medium">{getProfessionalName(block.professionalId)}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(block.startDate), "dd/MM/yyyy")}
                            {block.startDate !== block.endDate && ` até ${format(new Date(block.endDate), "dd/MM/yyyy")}`}
                          </div>
                          {block.blockFullDay ? (
                            <div className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 inline-block">
                              Dia inteiro
                            </div>
                          ) : (
                            <div className="text-sm">
                              {block.startTime} - {block.endTime}
                            </div>
                          )}
                          {block.reason && <div className="text-sm italic">"{block.reason}"</div>}
                        </div>
                        {onDeleteBlock && block.id && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-destructive"
                            onClick={() => onDeleteBlock(block.id!)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </form>
        </ScrollArea>
        
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
              disabled={temporaryBlocks.length === 0 && !isFormValid() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                  Processando...
                </>
              ) : (
                <>
                  <Ban className="h-4 w-4" />
                  Confirmar Bloqueio{temporaryBlocks.length > 0 ? "s" : ""}
                </>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
