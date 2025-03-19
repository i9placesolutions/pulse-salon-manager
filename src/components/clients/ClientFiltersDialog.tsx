import { useState } from "react";
import { ClientFilters } from "@/types/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CalendarIcon, X } from "lucide-react";

interface ClientFiltersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialFilters: ClientFilters;
  onApplyFilters: (filters: ClientFilters) => void;
  availableTags: string[];
}

export function ClientFiltersDialog({
  isOpen,
  onClose,
  initialFilters,
  onApplyFilters,
  availableTags,
}: ClientFiltersDialogProps) {
  const [filters, setFilters] = useState<ClientFilters>(initialFilters);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialFilters.tags || []);
  const [tagInput, setTagInput] = useState("");

  // Valores predefinidos para o seletor de gastos
  const spendingRanges = [
    { min: null, max: 500, label: "Até R$ 500" },
    { min: 500, max: 1000, label: "R$ 500 - R$ 1.000" },
    { min: 1000, max: 3000, label: "R$ 1.000 - R$ 3.000" },
    { min: 3000, max: 5000, label: "R$ 3.000 - R$ 5.000" },
    { min: 5000, max: null, label: "Acima de R$ 5.000" },
  ];

  const handleStatusChange = (value: string) => {
    setFilters({ ...filters, status: value === "all" ? [] : [value] });
  };

  const handleStartDateChange = (date: Date | undefined) => {
    const endDate = filters.lastVisitRange?.[1] || null;
    setFilters({
      ...filters,
      lastVisitRange: [date || null, endDate],
    });
  };

  const handleEndDateChange = (date: Date | undefined) => {
    const startDate = filters.lastVisitRange?.[0] || null;
    setFilters({
      ...filters,
      lastVisitRange: [startDate, date || null],
    });
  };

  const handleSpendingRangeChange = (index: number) => {
    const range = spendingRanges[index];
    setFilters({
      ...filters,
      spendingRange: [range.min, range.max],
    });
  };

  const handleTagAdd = () => {
    if (tagInput && !selectedTags.includes(tagInput)) {
      const newTags = [...selectedTags, tagInput];
      setSelectedTags(newTags);
      setFilters({ ...filters, tags: newTags });
      setTagInput("");
    }
  };

  const handleTagSelect = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      const newTags = [...selectedTags, tag];
      setSelectedTags(newTags);
      setFilters({ ...filters, tags: newTags });
    }
  };

  const handleTagRemove = (tag: string) => {
    const newTags = selectedTags.filter((t) => t !== tag);
    setSelectedTags(newTags);
    setFilters({ ...filters, tags: newTags.length > 0 ? newTags : undefined });
  };

  const handleToggleFilter = (key: keyof ClientFilters, value: boolean) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleResetFilters = () => {
    setFilters({
      status: [],
      minVisits: undefined,
      hasCashback: false,
      usedCoupons: false,
      joinedCampaigns: false,
      tags: [],
      dateRange: null,
      lastVisitRange: [null, null],
      spendingRange: [null, null],
      hasWhatsApp: false,
      hasBirthday: false,
    });
    setSelectedTags([]);
    onApplyFilters({
      status: [],
      minVisits: undefined,
      hasCashback: false,
      usedCoupons: false,
      joinedCampaigns: false,
      tags: [],
      dateRange: null,
      lastVisitRange: [null, null],
      spendingRange: [null, null],
      hasWhatsApp: false,
      hasBirthday: false,
    });
    onClose();
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  };

  const isFilterActive = () => {
    return (
      !!filters.status?.length ||
      !!filters.tags?.length ||
      !!filters.lastVisitRange?.[0] ||
      !!filters.lastVisitRange?.[1] ||
      !!filters.spendingRange?.[0] ||
      !!filters.spendingRange?.[1] ||
      !!filters.hasWhatsApp ||
      !!filters.hasBirthday
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filtros Avançados</DialogTitle>
          <DialogDescription>
            Filtre os clientes usando múltiplos critérios.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Status do cliente */}
          <div className="space-y-2">
            <Label htmlFor="status">Status do Cliente</Label>
            <Select
              value={filters.status && filters.status.length > 0 ? filters.status[0] : "all"}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Período da última visita */}
          <div className="space-y-2">
            <Label>Período da Última Visita</Label>
            <div className="flex flex-col space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <span className="text-xs text-gray-500">Data inicial</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !filters.lastVisitRange?.[0] && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.lastVisitRange?.[0]
                          ? formatDate(filters.lastVisitRange[0])
                          : "Selecionar"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.lastVisitRange?.[0] || undefined}
                        onSelect={handleStartDateChange}
                        initialFocus
                        disabled={(date) =>
                          filters.lastVisitRange?.[1]
                            ? date > filters.lastVisitRange[1]
                            : false
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex flex-col space-y-1">
                  <span className="text-xs text-gray-500">Data final</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !filters.lastVisitRange?.[1] && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.lastVisitRange?.[1]
                          ? formatDate(filters.lastVisitRange[1])
                          : "Selecionar"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.lastVisitRange?.[1] || undefined}
                        onSelect={handleEndDateChange}
                        initialFocus
                        disabled={(date) =>
                          filters.lastVisitRange?.[0]
                            ? date < filters.lastVisitRange[0]
                            : false
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </div>

          {/* Faixa de gastos */}
          <div className="space-y-2">
            <Label>Faixa de Gastos Totais</Label>
            <Select
              value={
                filters.spendingRange
                  ? spendingRanges.findIndex(
                      (range) =>
                        range.min === filters.spendingRange?.[0] &&
                        range.max === filters.spendingRange?.[1]
                    ).toString()
                  : "all"
              }
              onValueChange={(value) =>
                value === "all" 
                  ? setFilters({ ...filters, spendingRange: undefined })
                  : handleSpendingRangeChange(parseInt(value))
              }
            >
              <SelectTrigger id="spending">
                <SelectValue placeholder="Todos os valores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os valores</SelectItem>
                {spendingRanges.map((range, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex space-x-2">
              <Input
                placeholder="Adicionar tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleTagAdd();
                  }
                }}
              />
              <Button type="button" onClick={handleTagAdd} size="sm">
                Adicionar
              </Button>
            </div>

            {/* Mostrar tags disponíveis */}
            {availableTags.length > 0 && (
              <div className="mt-2">
                <span className="text-xs text-gray-500">Tags disponíveis:</span>
                <div className="flex flex-wrap mt-1 gap-1">
                  {availableTags
                    .filter((tag) => !selectedTags.includes(tag))
                    .map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary/10"
                        onClick={() => handleTagSelect(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                </div>
              </div>
            )}

            {/* Mostrar tags selecionadas */}
            {selectedTags.length > 0 && (
              <div className="mt-2">
                <span className="text-xs text-gray-500">Tags selecionadas:</span>
                <div className="flex flex-wrap mt-1 gap-1">
                  {selectedTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="pr-1 flex items-center gap-1"
                    >
                      {tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 rounded-full hover:bg-secondary-foreground/20"
                        onClick={() => handleTagRemove(tag)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Opções adicionais */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Opções adicionais</h4>

            <div className="flex items-center space-x-2">
              <Switch
                id="hasWhatsApp"
                checked={!!filters.hasWhatsApp}
                onCheckedChange={(checked) =>
                  handleToggleFilter("hasWhatsApp", checked)
                }
              />
              <Label htmlFor="hasWhatsApp">Apenas com WhatsApp</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="hasBirthday"
                checked={!!filters.hasBirthday}
                onCheckedChange={(checked) =>
                  handleToggleFilter("hasBirthday", checked)
                }
              />
              <Label htmlFor="hasBirthday">
                Apenas com data de aniversário
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleResetFilters}
            className="border-destructive text-destructive hover:bg-destructive/10"
          >
            Limpar Filtros
          </Button>
          <Button
            type="button"
            onClick={handleApplyFilters}
            className="bg-primary hover:bg-primary/90"
            disabled={!isFilterActive()}
          >
            Aplicar Filtros
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 