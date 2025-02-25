
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CampaignCard } from "@/components/marketing/CampaignCard";
import { campaignTypes } from "./marketingConstants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import type { CampaignFormData } from "@/types/marketing";
import type { Client, CampaignHistory } from "@/types/client";

interface CampaignTypesSectionProps {
  selectedType: string | null;
  onTypeSelect: (type: string) => void;
}

export function CampaignTypesSection({ selectedType, onTypeSelect }: CampaignTypesSectionProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<CampaignFormData>({
    name: "",
    audience: "all",
    startDate: "",
    endDate: "",
    discount: {
      type: "percentage",
      value: 0
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Aqui você integraria com sua API/backend
      const campaignData = { type: selectedType, ...formData };
      console.log("Dados da campanha:", campaignData);

      // Simula o registro da campanha para um cliente
      const mockClient: Client = {
        id: 1,
        name: "Cliente Teste",
        email: "teste@email.com",
        phone: "11999999999",
        birthDate: "1990-01-01",
        firstVisit: "2024-01-01",
        status: "active",
        points: 100,
        balance: {
          cashback: 0,
          vipBonus: 0
        },
        campaignHistory: [],
        appointmentHistory: [], // Adicionado
        paymentHistory: [], // Adicionado
        couponHistory: [] // Adicionado
      };

      // Cria o registro no histórico
      const campaignHistory: CampaignHistory = {
        id: Date.now(),
        clientId: mockClient.id,
        campaignId: Date.now(),
        campaignType: selectedType || "",
        date: new Date().toISOString(),
        description: formData.name,
        value: formData.discount?.value || 0,
        status: 'active',
        expirationDate: formData.endDate,
      };

      // Atualiza o saldo do cliente baseado no tipo de campanha
      if (selectedType === 'cashback') {
        mockClient.balance.cashback += formData.discount?.value || 0;
      } else if (selectedType === 'vip') {
        mockClient.balance.vipBonus += formData.discount?.value || 0;
      }

      // Adiciona ao histórico
      mockClient.campaignHistory.push(campaignHistory);

      // Simula o salvamento
      console.log("Cliente atualizado:", mockClient);

      toast({
        title: "Campanha criada com sucesso!",
        description: `A campanha foi registrada para o cliente ${mockClient.name}`,
      });

      // Limpa o formulário
      setFormData({
        name: "",
        audience: "all",
        startDate: "",
        endDate: "",
        discount: {
          type: "percentage",
          value: 0
        }
      });
    } catch (error) {
      toast({
        title: "Erro ao criar campanha",
        description: "Ocorreu um erro ao registrar a campanha.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Nova Campanha</CardTitle>
          <CardDescription>
            Selecione o tipo de campanha e configure seus detalhes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {campaignTypes.map((type) => (
              <CampaignCard
                key={type.id}
                {...type}
                isSelected={selectedType === type.type}
                onClick={() => onTypeSelect(type.type)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedType && (
        <Card>
          <CardHeader>
            <CardTitle>Configurar Campanha</CardTitle>
            <CardDescription>
              Preencha os detalhes da sua campanha
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Campanha</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Digite o nome da campanha"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="audience">Público-alvo</Label>
                  <Select 
                    value={formData.audience}
                    onValueChange={(value: any) => setFormData({ ...formData, audience: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o público-alvo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Clientes</SelectItem>
                      <SelectItem value="vip">Clientes VIP</SelectItem>
                      <SelectItem value="inactive">Clientes Inativos</SelectItem>
                      <SelectItem value="new">Novos Clientes</SelectItem>
                      <SelectItem value="birthday">Aniversariantes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Data de Início</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Data de Término</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>

                {(selectedType === 'discount' || selectedType === 'coupon') && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="discountType">Tipo de Desconto</Label>
                      <Select
                        value={formData.discount?.type}
                        onValueChange={(value: 'percentage' | 'fixed' | 'service') => 
                          setFormData({
                            ...formData,
                            discount: { ...formData.discount, type: value }
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo de desconto" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                          <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                          <SelectItem value="service">Serviço Gratuito</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {formData.discount?.type !== 'service' && (
                      <div className="space-y-2">
                        <Label htmlFor="discountValue">
                          {formData.discount?.type === 'percentage' ? 'Porcentagem de Desconto' : 'Valor do Desconto'}
                        </Label>
                        <Input
                          id="discountValue"
                          type="number"
                          min={0}
                          max={formData.discount?.type === 'percentage' ? 100 : undefined}
                          value={formData.discount?.value}
                          onChange={(e) => setFormData({
                            ...formData,
                            discount: { ...formData.discount, value: Number(e.target.value) }
                          })}
                          placeholder={formData.discount?.type === 'percentage' ? "Ex: 10" : "Ex: 50"}
                        />
                      </div>
                    )}
                  </>
                )}

                {selectedType === 'cashback' && (
                  <div className="space-y-2">
                    <Label htmlFor="cashbackValue">Valor do Cashback (%)</Label>
                    <Input
                      id="cashbackValue"
                      type="number"
                      min={0}
                      max={100}
                      value={formData.discount?.value}
                      onChange={(e) => setFormData({
                        ...formData,
                        discount: { type: 'percentage', value: Number(e.target.value) }
                      })}
                      placeholder="Ex: 5"
                    />
                  </div>
                )}

                {selectedType === 'vip' && (
                  <div className="space-y-2">
                    <Label htmlFor="messageTemplate">Descrição dos Benefícios VIP</Label>
                    <Textarea
                      id="messageTemplate"
                      rows={4}
                      value={formData.messageTemplate}
                      onChange={(e) => setFormData({ ...formData, messageTemplate: e.target.value })}
                      placeholder="Descreva os benefícios exclusivos para clientes VIP"
                    />
                  </div>
                )}

                {selectedType === 'whatsapp' && (
                  <div className="space-y-2">
                    <Label htmlFor="messageTemplate">Mensagem</Label>
                    <Textarea
                      id="messageTemplate"
                      rows={4}
                      value={formData.messageTemplate}
                      onChange={(e) => setFormData({ ...formData, messageTemplate: e.target.value })}
                      placeholder="Digite a mensagem da campanha"
                    />
                  </div>
                )}

                <div className="pt-4">
                  <Button type="submit" className="w-full">
                    Criar Campanha
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
