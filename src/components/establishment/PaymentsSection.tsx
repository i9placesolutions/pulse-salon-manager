import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CreditCard, 
  DollarSign, 
  Wallet, 
  BanknoteIcon, 
  Save, 
  CheckCircle2, 
  Percent, 
  CalendarRange, 
  BadgePercent, 
  Calculator, 
  CreditCardIcon,
  BarChart3,
  ToggleRight,
  Smartphone,
  Banknote,
  Receipt
} from "lucide-react";
import { useEstablishmentConfigs } from "@/hooks/useEstablishmentConfigs";
import { Card, CardContent } from "@/components/ui/card";
import { ConfigPagamentos } from "@/components/configuracoes/ConfigPagamentos";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PaymentsSectionProps {
  profile?: any;
}

export const PaymentsSection: React.FC<PaymentsSectionProps> = ({ profile }) => {
  const { paymentConfig, isLoading, savePaymentConfig } = useEstablishmentConfigs();
  const [saving, setSaving] = useState(false);
  const [methods, setMethods] = useState(paymentConfig.methods);
  const [parcelamento, setParcelamento] = useState(paymentConfig.parcelamento);
  const [activeTab, setActiveTab] = useState<string>("methods");

  // Atualizar estados locais quando os dados do banco forem carregados
  useEffect(() => {
    if (!isLoading) {
      setMethods(paymentConfig.methods);
      setParcelamento(paymentConfig.parcelamento);
    }
  }, [paymentConfig, isLoading]);

  // Função para atualizar um método de pagamento
  const updateMethod = (id: string, field: string, value: any) => {
    setMethods(prevMethods => 
      prevMethods.map(method => 
        method.id === id ? { ...method, [field]: value } : method
      )
    );
  };

  // Função para atualizar a taxa de uma bandeira
  const updateBandeira = (methodId: string, bandeiraName: string, value: number) => {
    setMethods(prevMethods => 
      prevMethods.map(method => {
        if (method.id === methodId && method.bandeiras) {
          return {
            ...method,
            bandeiras: method.bandeiras.map(bandeira => 
              bandeira.nome === bandeiraName ? { ...bandeira, taxa: value } : bandeira
            )
          };
        }
        return method;
      })
    );
  };

  // Salvar configurações
  const handleSave = async () => {
    setSaving(true);
    try {
      await savePaymentConfig({
        methods,
        parcelamento
      });
    } finally {
      setSaving(false);
    }
  };

  // Obter a cor baseada na aba ativa
  const getHeaderGradient = () => {
    if (activeTab === "methods") {
      return "from-emerald-400 via-emerald-500 to-teal-600";
    } else {
      return "from-teal-400 via-teal-500 to-green-600";
    }
  };

  const getHeaderBgGradient = () => {
    if (activeTab === "methods") {
      return "from-emerald-50 via-emerald-100 to-emerald-50";
    } else {
      return "from-teal-50 via-teal-100 to-teal-50";
    }
  };

  const getHeaderTextColor = () => {
    if (activeTab === "methods") {
      return "text-emerald-700";
    } else {
      return "text-teal-700";
    }
  };

  const getHeaderIconColor = () => {
    if (activeTab === "methods") {
      return "text-emerald-600";
    } else {
      return "text-teal-600";
    }
  };

  // Obter ícone do método de pagamento
  const getPaymentMethodIcon = (metodo: string) => {
    switch (metodo.toLowerCase()) {
      case 'credito':
      case 'crédito':
        return <CreditCard className="h-5 w-5 text-emerald-600" />;
      case 'debito':
      case 'débito':
        return <CreditCardIcon className="h-5 w-5 text-blue-600" />;
      case 'dinheiro':
        return <Banknote className="h-5 w-5 text-green-600" />;
      case 'pix':
        return <Receipt className="h-5 w-5 text-purple-600" />;
      default:
        return <Wallet className="h-5 w-5 text-gray-600" />;
    }
  };

  // Obter cor do método de pagamento
  const getPaymentMethodColor = (metodo: string) => {
    switch (metodo.toLowerCase()) {
      case 'credito':
      case 'crédito':
        return 'bg-emerald-100 border-emerald-200 text-emerald-700';
      case 'debito':
      case 'débito':
        return 'bg-blue-100 border-blue-200 text-blue-700';
      case 'dinheiro':
        return 'bg-green-100 border-green-200 text-green-700';
      case 'pix':
        return 'bg-purple-100 border-purple-200 text-purple-700';
      default:
        return 'bg-gray-100 border-gray-200 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center p-12 bg-white rounded-lg border shadow-md">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600 mb-4"></div>
        <p className="text-emerald-700 font-medium">Carregando configurações de pagamento...</p>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden border-emerald-200 shadow-md">
      <div className={`h-1 w-full bg-gradient-to-r ${getHeaderGradient()}`}></div>
      <div className={`py-3 px-6 bg-gradient-to-r ${getHeaderBgGradient()} border-b border-emerald-200`}>
        <h2 className={`text-lg font-medium ${getHeaderTextColor()} flex items-center`}>
          <DollarSign className={`h-5 w-5 mr-2 ${getHeaderIconColor()}`} />
          Configurações de Pagamento
        </h2>
      </div>
      
      <CardContent className="p-6">
        <Tabs 
          defaultValue="methods" 
          className="w-full"
          onValueChange={(value) => setActiveTab(value)}
        >
          <TabsList className="w-full mb-6 bg-emerald-50 p-1 border border-emerald-200 rounded-lg">
            <TabsTrigger 
              value="methods" 
              className="flex-1 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm py-2 gap-2"
            >
              <CreditCard className="h-4 w-4" />
              <span>Métodos de Pagamento</span>
            </TabsTrigger>
            <TabsTrigger 
              value="parcelamento" 
              className="flex-1 data-[state=active]:bg-white data-[state=active]:text-teal-700 data-[state=active]:shadow-sm py-2 gap-2"
            >
              <CalendarRange className="h-4 w-4" />
              <span>Parcelamento</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="methods" className="space-y-6 relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {methods.map((method) => (
                <div key={method.id} className="border rounded-lg shadow-sm bg-white overflow-hidden">
                  <div className={`p-3 flex justify-between items-center ${getPaymentMethodColor(method.metodo || method.id)}`}>
                    <div className="flex items-center gap-2">
                      {getPaymentMethodIcon(method.metodo || method.id)}
                      <h3 className="font-medium">{method.metodo || method.id}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Switch 
                              checked={method.ativo} 
                              onCheckedChange={(checked) => updateMethod(method.id, 'ativo', checked)}
                              className="data-[state=checked]:bg-emerald-600"
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{method.ativo ? 'Desativar' : 'Ativar'} método de pagamento</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-4">
                    {method.id === 'credito' && method.bandeiras && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-emerald-700 flex items-center gap-1.5">
                          <BadgePercent className="h-4 w-4" />
                          Taxas por Bandeira
                        </h4>
                        <div className="grid grid-cols-1 gap-3 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                          {method.bandeiras.map((bandeira, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-white p-2 rounded border border-emerald-100 shadow-sm">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-white font-normal">
                                  {bandeira.nome}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1">
                                <Input 
                                  type="number" 
                                  min="0" 
                                  max="100" 
                                  step="0.1"
                                  value={bandeira.taxa} 
                                  onChange={(e) => updateBandeira(method.id, bandeira.nome, parseFloat(e.target.value) || 0)}
                                  className="w-20 h-8 py-1 text-right border-emerald-200"
                                />
                                <span className="text-emerald-700 font-medium">%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`taxa-${method.id}`} className="text-sm text-emerald-700 flex items-center gap-1.5">
                          <Percent className="h-3.5 w-3.5" />
                          Taxa Padrão (%)
                        </Label>
                        <div className="flex items-center">
                          <Input 
                            id={`taxa-${method.id}`}
                            type="number" 
                            min="0" 
                            max="100" 
                            step="0.1"
                            value={method.taxa || 0} 
                            onChange={(e) => updateMethod(method.id, 'taxa', parseFloat(e.target.value) || 0)}
                            className="border-emerald-200"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`prazo-${method.id}`} className="text-sm text-emerald-700 flex items-center gap-1.5">
                          <CalendarRange className="h-3.5 w-3.5" />
                          Prazo de Recebimento (dias)
                        </Label>
                        <Input 
                          id={`prazo-${method.id}`}
                          type="number" 
                          min="0" 
                          value={method.prazo || 0} 
                          onChange={(e) => updateMethod(method.id, 'prazo', parseInt(e.target.value) || 0)}
                          className="border-emerald-200"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <Button 
              onClick={handleSave}
              disabled={saving}
              className="w-full gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-sm hover:shadow"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Salvar Métodos de Pagamento</span>
                </>
              )}
            </Button>
          </TabsContent>
          
          <TabsContent value="parcelamento" className="space-y-6">
            <div className="p-5 border rounded-lg shadow-sm space-y-5 bg-white">
              <div className="flex items-start gap-3 mb-4 bg-teal-50 p-4 rounded-lg border border-teal-100">
                <BarChart3 className="h-5 w-5 text-teal-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-teal-700 mb-1">Configurações de Parcelamento</h3>
                  <p className="text-sm text-teal-600">Defina como os pagamentos parcelados serão processados em seu estabelecimento.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 bg-white p-4 rounded-lg border border-teal-200 shadow-sm">
                  <Label htmlFor="max-parcelas" className="text-teal-700 flex items-center gap-1.5">
                    <CalendarRange className="h-4 w-4" />
                    Número Máximo de Parcelas
                  </Label>
                  <Input 
                    id="max-parcelas"
                    type="number" 
                    min="1"
                    max="12"
                    value={parcelamento.numeroMaximoParcelas}
                    onChange={(e) => setParcelamento({
                      ...parcelamento,
                      numeroMaximoParcelas: parseInt(e.target.value) || 1
                    })}
                    className="border-teal-200"
                  />
                  <p className="text-xs text-gray-500 italic">Limite máximo de parcelas que seus clientes poderão utilizar.</p>
                </div>
                
                <div className="space-y-2 bg-white p-4 rounded-lg border border-teal-200 shadow-sm">
                  <Label htmlFor="valor-minimo" className="text-teal-700 flex items-center gap-1.5">
                    <Calculator className="h-4 w-4" />
                    Valor Mínimo por Parcela (R$)
                  </Label>
                  <Input 
                    id="valor-minimo"
                    type="number" 
                    min="0"
                    step="0.01"
                    value={parcelamento.valorMinimo}
                    onChange={(e) => setParcelamento({
                      ...parcelamento,
                      valorMinimo: parseFloat(e.target.value) || 0
                    })}
                    className="border-teal-200"
                  />
                  <p className="text-xs text-gray-500 italic">Valor mínimo que cada parcela precisará ter para ser válida.</p>
                </div>
              </div>
              
              <Separator className="my-4 bg-teal-100" />
              
              <div className="bg-white p-4 rounded-lg border border-teal-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BadgePercent className="h-5 w-5 text-teal-600" />
                    <Label htmlFor="cobrar-juros" className="font-medium text-teal-700">
                      Cobrar Juros em Parcelamentos
                    </Label>
                  </div>
                  <Switch 
                    id="cobrar-juros"
                    checked={parcelamento.cobrarJuros}
                    onCheckedChange={(checked) => setParcelamento({
                      ...parcelamento,
                      cobrarJuros: checked
                    })}
                    className="data-[state=checked]:bg-teal-600"
                  />
                </div>
                
                {parcelamento.cobrarJuros && (
                  <div className="pt-2 pl-7">
                    <Label htmlFor="taxa-juros" className="text-teal-700 mb-1.5 block">Taxa de Juros Mensal (%)</Label>
                    <div className="flex items-center">
                      <Input 
                        id="taxa-juros"
                        type="number" 
                        min="0"
                        step="0.01"
                        value={parcelamento.taxaJuros}
                        onChange={(e) => setParcelamento({
                          ...parcelamento,
                          taxaJuros: parseFloat(e.target.value) || 0
                        })}
                        className="border-teal-200"
                      />
                      <span className="ml-2 text-teal-700 font-medium">% ao mês</span>
                    </div>
                    <p className="text-xs text-gray-500 italic mt-1">
                      Esta taxa será aplicada nas parcelas a partir da segunda parcela.
                    </p>
                  </div>
                )}
                
                {!parcelamento.cobrarJuros && (
                  <div className="pl-7">
                    <p className="text-sm text-teal-600">
                      O parcelamento será oferecido sem acréscimo de juros.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <Button 
              onClick={handleSave}
              disabled={saving}
              className="w-full gap-2 bg-gradient-to-r from-teal-500 to-green-600 hover:from-teal-600 hover:to-green-700 text-white shadow-sm hover:shadow"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Salvar Configurações de Parcelamento</span>
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
