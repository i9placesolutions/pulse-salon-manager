import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

type Bandeira = {
  nome: string;
  taxa: number;
};

type MetodoPagamento = {
  id: string;
  metodo: string;
  taxa: number;
  ativo: boolean;
  bandeiras?: Bandeira[];
};

type ConfigParcelamento = {
  numeroMaximoParcelas: number;
  valorMinimo: number;
  cobrarJuros: boolean;
  taxaJuros: number;
};

export const ConfigPagamentos = forwardRef((props, ref) => {
  // Definir métodos de pagamento padrão
  const metodosPagamentoPadrao: MetodoPagamento[] = [
    { id: "dinheiro", metodo: "Dinheiro", taxa: 0, ativo: true },
    { 
      id: "debito", 
      metodo: "Cartão de Débito", 
      taxa: 2, 
      ativo: true,
      bandeiras: [
        { nome: "Visa", taxa: 1.5 },
        { nome: "Mastercard", taxa: 1.8 },
        { nome: "Elo", taxa: 2.0 },
      ] 
    },
    { 
      id: "credito", 
      metodo: "Cartão de Crédito", 
      taxa: 3, 
      ativo: true,
      bandeiras: [
        { nome: "Visa", taxa: 2.5 },
        { nome: "Mastercard", taxa: 2.9 },
        { nome: "Elo", taxa: 3.2 },
        { nome: "American Express", taxa: 3.5 },
      ] 
    },
    { id: "pix", metodo: "PIX", taxa: 1, ativo: true },
  ];

  const [loading, setLoading] = useState(false);
  const [metodosPagamento, setMetodosPagamento] = useState<MetodoPagamento[]>(metodosPagamentoPadrao);

  const [parcelamento, setParcelamento] = useState<ConfigParcelamento>({
    numeroMaximoParcelas: 6,
    valorMinimo: 50,
    cobrarJuros: true,
    taxaJuros: 2.99
  });

  const [editandoBandeira, setEditandoBandeira] = useState<{metodoId: string, bandeiraNome: string} | null>(null);

  // Carregar dados do Supabase
  useEffect(() => {
    const carregarConfiguracoes = async () => {
      try {
        setLoading(true);
        // Obter o usuário atual
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;
        
        // Buscar configurações do estabelecimento
        const { data, error } = await supabase
          .from('establishment_details')
          .select('payment_methods, installment_config')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          // Configurar métodos de pagamento
          if (data.payment_methods && Array.isArray(data.payment_methods) && data.payment_methods.length > 0) {
            // Verificar se os objetos têm a estrutura correta
            const metodosValidos = data.payment_methods.filter(
              (metodo: any) => metodo && metodo.id && metodo.metodo && typeof metodo.taxa === 'number' && typeof metodo.ativo === 'boolean'
            );
            
            if (metodosValidos.length > 0) {
              setMetodosPagamento(metodosValidos as MetodoPagamento[]);
            }
          } else if (data.payment_methods && typeof data.payment_methods === 'object' && Object.keys(data.payment_methods).length > 0) {
            const metodos = Object.values(data.payment_methods);
            const metodosValidos = metodos.filter(
              (metodo: any) => metodo && metodo.id && metodo.metodo && typeof metodo.taxa === 'number' && typeof metodo.ativo === 'boolean'
            );
            
            if (metodosValidos.length > 0) {
              setMetodosPagamento(metodosValidos as MetodoPagamento[]);
            }
          }
          
          // Configurar parcelamento
          if (data.installment_config) {
            setParcelamento(data.installment_config as ConfigParcelamento);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar configurações de pagamento:', error);
        toast({
          title: "Erro ao carregar configurações",
          description: "As configurações padrão de pagamento serão utilizadas.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    carregarConfiguracoes();
  }, []);

  const atualizarTaxa = (id: string, novaTaxa: number) => {
    setMetodosPagamento(metodos => 
      metodos.map(metodo => 
        metodo.id === id ? { ...metodo, taxa: novaTaxa } : metodo
      )
    );
  };

  const atualizarTaxaBandeira = (metodoId: string, bandeiraNome: string, novaTaxa: number) => {
    setMetodosPagamento(metodos => 
      metodos.map(metodo => {
        if (metodo.id === metodoId && metodo.bandeiras) {
          return {
            ...metodo,
            bandeiras: metodo.bandeiras.map(bandeira => 
              bandeira.nome === bandeiraNome ? { ...bandeira, taxa: novaTaxa } : bandeira
            )
          };
        }
        return metodo;
      })
    );
  };

  const alternarAtivacao = (id: string) => {
    setMetodosPagamento(metodos => 
      metodos.map(metodo => 
        metodo.id === id ? { ...metodo, ativo: !metodo.ativo } : metodo
      )
    );
  };

  const salvarConfiguracoes = async () => {
    try {
      setLoading(true);
      
      // Obter o usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro ao salvar",
          description: "Usuário não autenticado",
          variant: "destructive",
        });
        return;
      }
      
      // Atualizar no Supabase
      const { data, error } = await supabase
        .from('establishment_details')
        .update({
          payment_methods: metodosPagamento,
          installment_config: parcelamento
        })
        .eq('id', user.id)
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Configurações salvas",
        description: "As configurações de pagamento foram salvas com sucesso."
      });
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as configurações de pagamento.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Expor o método getFormData para o componente pai
  useImperativeHandle(ref, () => ({
    getFormData: () => ({
      metodosPagamento,
      parcelamento
    })
  }));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {loading && (
        <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
            <span>Carregando configurações...</span>
          </div>
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Métodos de Pagamento</CardTitle>
          <CardDescription>
            Configure as formas de pagamento aceitas e suas taxas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {metodosPagamento.map((pagamento) => (
            <div key={pagamento.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch 
                    id={`pagamento-${pagamento.id}`} 
                    checked={pagamento.ativo}
                    onCheckedChange={() => alternarAtivacao(pagamento.id)}
                  />
                  <div>
                    <Label htmlFor={`pagamento-${pagamento.id}`}>{pagamento.metodo}</Label>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm text-muted-foreground">Taxa:</Label>
                      <div className="flex items-center">
                        <Input 
                          type="number" 
                          value={pagamento.taxa} 
                          onChange={(e) => atualizarTaxa(pagamento.id, parseFloat(e.target.value) || 0)}
                          className="w-16 h-7 text-sm" 
                          step="0.1"
                          min="0"
                        />
                        <span className="ml-1 text-sm">%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {pagamento.bandeiras && (
                <div className="ml-8 mt-2">
                  <p className="text-sm font-medium mb-2">Bandeiras:</p>
                  <div className="space-y-2">
                    {pagamento.bandeiras.map((bandeira) => (
                      <div key={bandeira.nome} className="flex items-center justify-between">
                        <Badge variant="outline">{bandeira.nome}</Badge>
                        <div className="flex items-center">
                          <Label className="text-xs mr-2">Taxa:</Label>
                          <Input 
                            type="number" 
                            value={bandeira.taxa} 
                            onChange={(e) => atualizarTaxaBandeira(pagamento.id, bandeira.nome, parseFloat(e.target.value) || 0)}
                            className="w-16 h-7 text-sm" 
                            step="0.1"
                            min="0"
                          />
                          <span className="ml-1 text-sm">%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {pagamento !== metodosPagamento[metodosPagamento.length - 1] && (
                <Separator className="mt-3" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Parcelamento</CardTitle>
          <CardDescription>
            Configure as opções de parcelamento e juros
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Número máximo de parcelas</Label>
            <select 
              className="w-full p-2 border rounded-md"
              value={parcelamento.numeroMaximoParcelas}
              onChange={(e) => setParcelamento({...parcelamento, numeroMaximoParcelas: parseInt(e.target.value)})}
            >
              {[1, 2, 3, 4, 5, 6, 12].map(num => (
                <option key={num} value={num}>{num}x</option>
              ))}
            </select>
          </div>
          
          <div className="grid gap-2">
            <Label>Valor mínimo para parcelamento (R$)</Label>
            <Input 
              type="number" 
              value={parcelamento.valorMinimo} 
              onChange={(e) => setParcelamento({...parcelamento, valorMinimo: parseFloat(e.target.value) || 0})}
              placeholder="50,00"
              step="5"
              min="0"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Switch 
                id="juros" 
                checked={parcelamento.cobrarJuros}
                onCheckedChange={(checked) => setParcelamento({...parcelamento, cobrarJuros: checked})}
              />
              <Label htmlFor="juros">Cobrar juros no parcelamento</Label>
            </div>
            
            {parcelamento.cobrarJuros && (
              <div className="flex items-center gap-2 ml-8 mt-2">
                <Label className="text-sm">Taxa de juros ao mês:</Label>
                <div className="flex items-center">
                  <Input 
                    type="number" 
                    value={parcelamento.taxaJuros} 
                    onChange={(e) => setParcelamento({...parcelamento, taxaJuros: parseFloat(e.target.value) || 0})}
                    className="w-20 h-8" 
                    step="0.01"
                    min="0"
                  />
                  <span className="ml-1">%</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="pt-4">
            <Button 
              onClick={salvarConfiguracoes} 
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Configurações"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
