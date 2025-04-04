import { useState, forwardRef, useImperativeHandle } from "react";
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Clock, 
  PlusCircle, 
  MinusCircle, 
  Coffee, 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Image,
  Download,
  Upload,
  Calendar,
  Clock12,
  AlertCircle,
  Database,
  Save,
  RotateCcw,
  Navigation,
  Asterisk
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

interface DiaConfig {
  ativo: boolean;
  inicio: string;
  fim: string;
  temIntervalo: boolean;
  intervaloInicio: string;
  intervaloFim: string;
}

interface EstabelecimentoInfo {
  nome: string;
  cnpj: string;
  telefone: string;
  whatsapp: string;
  email: string;
  website: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  latitude: string;
  longitude: string;
  descricao: string;
  logo: string;
}

// Lista de estados brasileiros
const estados = [
  { sigla: "AC", nome: "Acre" },
  { sigla: "AL", nome: "Alagoas" },
  { sigla: "AP", nome: "Amapá" },
  { sigla: "AM", nome: "Amazonas" },
  { sigla: "BA", nome: "Bahia" },
  { sigla: "CE", nome: "Ceará" },
  { sigla: "DF", nome: "Distrito Federal" },
  { sigla: "ES", nome: "Espírito Santo" },
  { sigla: "GO", nome: "Goiás" },
  { sigla: "MA", nome: "Maranhão" },
  { sigla: "MT", nome: "Mato Grosso" },
  { sigla: "MS", nome: "Mato Grosso do Sul" },
  { sigla: "MG", nome: "Minas Gerais" },
  { sigla: "PA", nome: "Pará" },
  { sigla: "PB", nome: "Paraíba" },
  { sigla: "PR", nome: "Paraná" },
  { sigla: "PE", nome: "Pernambuco" },
  { sigla: "PI", nome: "Piauí" },
  { sigla: "RJ", nome: "Rio de Janeiro" },
  { sigla: "RN", nome: "Rio Grande do Norte" },
  { sigla: "RS", nome: "Rio Grande do Sul" },
  { sigla: "RO", nome: "Rondônia" },
  { sigla: "RR", nome: "Roraima" },
  { sigla: "SC", nome: "Santa Catarina" },
  { sigla: "SP", nome: "São Paulo" },
  { sigla: "SE", nome: "Sergipe" },
  { sigla: "TO", nome: "Tocantins" }
];

interface ConfigGeralProps {
  isFirstLogin?: boolean;
}

export const ConfigGeral = forwardRef<any, ConfigGeralProps>((props, ref) => {
  const { isFirstLogin = false } = props;
  
  // Estado para informações do estabelecimento
  const [estabelecimentoInfo, setEstabelecimentoInfo] = useState<EstabelecimentoInfo>({
    nome: "",
    cnpj: "",
    telefone: "",
    whatsapp: "",
    email: "",
    website: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    latitude: "",
    longitude: "",
    descricao: "",
    logo: "/logorosa.png"
  });
  
  // Carregar dados do estabelecimento existente
  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Obter o usuário atual
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;
        
        // Buscar dados do perfil
        const { data: profileData } = await supabase
          .from('profiles')
          .select('establishment_name')
          .eq('id', user.id)
          .single();
          
        // Buscar dados detalhados do estabelecimento
        const { data: estabelecimentoData } = await supabase
          .from('establishment_details')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profileData) {
          setEstabelecimentoInfo(prev => ({
            ...prev,
            nome: profileData.establishment_name
          }));
        }
        
        if (estabelecimentoData) {
          setEstabelecimentoInfo(prev => ({
            ...prev,
            cnpj: estabelecimentoData.document_number || '',
            email: estabelecimentoData.email || '',
            whatsapp: estabelecimentoData.whatsapp || '',
            endereco: estabelecimentoData.address_street || '',
            cidade: estabelecimentoData.address_city || '',
            estado: estabelecimentoData.address_state || '',
            cep: estabelecimentoData.address_zipcode || '',
            descricao: estabelecimentoData.description || '',
            website: estabelecimentoData.instagram || '',
            telefone: estabelecimentoData.responsible_phone || '',
            latitude: estabelecimentoData.address_latitude || '',
            longitude: estabelecimentoData.address_longitude || ''
          }));
        }
      } catch (error) {
        console.error("Erro ao carregar dados do estabelecimento:", error);
      }
    };
    
    carregarDados();
  }, []);

  // Expor o método para obter dados do formulário via ref
  useImperativeHandle(ref, () => ({
    getFormData: () => ({
      // Dados básicos
      nome: estabelecimentoInfo.nome,
      cnpj: estabelecimentoInfo.cnpj,
      telefone: estabelecimentoInfo.telefone,
      whatsapp: estabelecimentoInfo.whatsapp,
      email: estabelecimentoInfo.email,
      website: estabelecimentoInfo.website,
      endereco: estabelecimentoInfo.endereco,
      cidade: estabelecimentoInfo.cidade,
      estado: estabelecimentoInfo.estado,
      cep: estabelecimentoInfo.cep,
      latitude: estabelecimentoInfo.latitude,
      longitude: estabelecimentoInfo.longitude,
      descricao: estabelecimentoInfo.descricao,
      logo: estabelecimentoInfo.logo,
      
      // Configurações de horário
      horarios: diasConfig,
      
      // Configurações regionais
      configRegionais: configRegionais,
      
      // Configurações de notificações
      configNotificacoes: configNotificacoes
    })
  }));

  // Funções para aplicar máscaras
  const aplicarMascaraCNPJ = (valor: string) => {
    // Remove tudo que não é número
    valor = valor.replace(/\D/g, '');
    
    // Aplica a máscara do CNPJ: 00.000.000/0000-00
    valor = valor.replace(/^(\d{2})(\d)/, '$1.$2');
    valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    valor = valor.replace(/\.(\d{3})(\d)/, '.$1/$2');
    valor = valor.replace(/(\d{4})(\d)/, '$1-$2');
    
    return valor.substring(0, 18);
  };
  
  const aplicarMascaraTelefone = (valor: string) => {
    // Remove tudo que não é número
    valor = valor.replace(/\D/g, '');
    
    // Aplica a máscara de telefone: (00) 00000-0000 ou (00) 0000-0000
    if (valor.length <= 10) {
      // Telefone fixo
      valor = valor.replace(/^(\d{2})(\d)/, '($1) $2');
      valor = valor.replace(/(\d{4})(\d)/, '$1-$2');
    } else {
      // Celular
      valor = valor.replace(/^(\d{2})(\d)/, '($1) $2');
      valor = valor.replace(/(\d{5})(\d)/, '$1-$2');
    }
    
    return valor.substring(0, 15);
  };
  
  const aplicarMascaraCEP = (valor: string) => {
    // Remove tudo que não é número
    valor = valor.replace(/\D/g, '');
    
    // Aplica a máscara de CEP: 00000-000
    valor = valor.replace(/^(\d{5})(\d)/, '$1-$2');
    
    return valor.substring(0, 9);
  };

  // Função atualizada para aplicar máscaras durante a atualização
  const handleEstabelecimentoChange = (campo: keyof EstabelecimentoInfo, valor: string) => {
    let valorFormatado = valor;
    
    // Aplica máscaras específicas conforme o campo
    if (campo === 'cnpj') {
      valorFormatado = aplicarMascaraCNPJ(valor);
    } else if (campo === 'telefone' || campo === 'whatsapp') {
      valorFormatado = aplicarMascaraTelefone(valor);
    } else if (campo === 'cep') {
      valorFormatado = aplicarMascaraCEP(valor);
    }
    
    setEstabelecimentoInfo(prev => ({
      ...prev,
      [campo]: valorFormatado
    }));
  };

  // Componente para campo obrigatório
  const ObrigatorioIcon = () => (
    <Asterisk className="h-2 w-2 text-red-500 inline" />
  );

  // Estado para configurações de horário
  const [diasConfig, setDiasConfig] = useState<Record<string, DiaConfig>>({
    'Segunda': { ativo: true, inicio: '08:00', fim: '18:00', temIntervalo: false, intervaloInicio: '12:00', intervaloFim: '13:00' },
    'Terça': { ativo: true, inicio: '08:00', fim: '18:00', temIntervalo: false, intervaloInicio: '12:00', intervaloFim: '13:00' },
    'Quarta': { ativo: true, inicio: '08:00', fim: '18:00', temIntervalo: false, intervaloInicio: '12:00', intervaloFim: '13:00' },
    'Quinta': { ativo: true, inicio: '08:00', fim: '18:00', temIntervalo: false, intervaloInicio: '12:00', intervaloFim: '13:00' },
    'Sexta': { ativo: true, inicio: '08:00', fim: '18:00', temIntervalo: false, intervaloInicio: '12:00', intervaloFim: '13:00' },
    'Sábado': { ativo: true, inicio: '08:00', fim: '14:00', temIntervalo: false, intervaloInicio: '12:00', intervaloFim: '13:00' },
    'Domingo': { ativo: false, inicio: '08:00', fim: '12:00', temIntervalo: false, intervaloInicio: '12:00', intervaloFim: '13:00' },
  });

  const handleDiaAtivo = (dia: string, ativo: boolean) => {
    setDiasConfig(prev => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        ativo
      }
    }));
  };

  const handleTempoChange = (dia: string, campo: keyof DiaConfig, valor: string) => {
    setDiasConfig(prev => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        [campo]: valor
      }
    }));
  };

  const toggleIntervalo = (dia: string) => {
    setDiasConfig(prev => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        temIntervalo: !prev[dia].temIntervalo
      }
    }));
  };

  // Estado para configurações regionais
  const [configRegionais, setConfigRegionais] = useState({
    fusoHorario: "America/Sao_Paulo",
    formatoData: "DD/MM/YYYY",
    formatoHora: "24h",
    moeda: "BRL",
    idiomaSistema: "pt-BR"
  });
  
  // Estado para configurações de notificações
  const [configNotificacoes, setConfigNotificacoes] = useState({
    emailNovoAgendamento: true,
    emailCancelamento: true,
    emailLembrete: true,
    emailRelatorio: true,
    emailAniversario: true,
    notificacaoDesktop: true,
    lembreteAntecedencia: 24 // horas
  });
  
  // Função para atualizar configurações regionais
  const handleRegionalChange = (campo: keyof typeof configRegionais, valor: string) => {
    setConfigRegionais(prev => ({
      ...prev,
      [campo]: valor
    }));
  };
  
  // Função para atualizar configurações de notificações
  const handleNotificacaoChange = (campo: keyof typeof configNotificacoes, valor: boolean | number) => {
    setConfigNotificacoes(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  return (
    <div className="space-y-8">
      {isFirstLogin && (
        <Alert className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
          <AlertCircle className="h-4 w-4 text-orange-500" />
          <AlertDescription className="ml-2">
            <p className="text-sm font-medium text-orange-800">
              Complete as informações obrigatórias (campos com <ObrigatorioIcon />) para continuar usando o sistema
            </p>
          </AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center text-blue-700">
            <Building className="h-5 w-5 mr-2 text-blue-500" /> 
            Informações do Estabelecimento
          </CardTitle>
          <CardDescription>
            Dados básicos do seu salão ou barbearia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nome" className="text-sm font-medium flex items-center">
                Nome do Estabelecimento {isFirstLogin && <ObrigatorioIcon />}
              </Label>
              <Input 
                id="nome" 
                value={estabelecimentoInfo.nome} 
                onChange={(e) => handleEstabelecimentoChange('nome', e.target.value)}
                placeholder="Ex: Salão Beleza Total"
                className={isFirstLogin && !estabelecimentoInfo.nome ? "border-red-300" : ""}
              />
              {isFirstLogin && !estabelecimentoInfo.nome && (
                <p className="text-xs text-red-500">Este campo é obrigatório</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cnpj" className="text-sm font-medium">
                CNPJ
              </Label>
              <Input 
                id="cnpj" 
                value={estabelecimentoInfo.cnpj} 
                onChange={(e) => handleEstabelecimentoChange('cnpj', e.target.value)}
                placeholder="Ex: 00.000.000/0000-00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone" className="text-sm font-medium">
                Telefone
              </Label>
              <Input 
                id="telefone" 
                value={estabelecimentoInfo.telefone} 
                onChange={(e) => handleEstabelecimentoChange('telefone', e.target.value)}
                placeholder="Ex: (00) 0000-0000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="text-sm font-medium flex items-center">
                WhatsApp {isFirstLogin && <ObrigatorioIcon />}
              </Label>
              <Input 
                id="whatsapp" 
                value={estabelecimentoInfo.whatsapp} 
                onChange={(e) => handleEstabelecimentoChange('whatsapp', e.target.value)}
                placeholder="Ex: (00) 00000-0000"
                className={isFirstLogin && !estabelecimentoInfo.whatsapp ? "border-red-300" : ""}
              />
              {isFirstLogin && !estabelecimentoInfo.whatsapp && (
                <p className="text-xs text-red-500">Este campo é obrigatório</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email de Contato
              </Label>
              <Input 
                id="email" 
                type="email" 
                value={estabelecimentoInfo.email} 
                onChange={(e) => handleEstabelecimentoChange('email', e.target.value)}
                placeholder="Ex: contato@seusalao.com.br"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website" className="text-sm font-medium">
                Website
              </Label>
              <Input 
                id="website" 
                value={estabelecimentoInfo.website} 
                onChange={(e) => handleEstabelecimentoChange('website', e.target.value)}
                placeholder="Ex: www.seusalao.com.br"
              />
            </div>
          </div>
          
          <Separator className="my-6 bg-blue-100" />
          
          <div className="space-y-4">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-blue-500" />
              <h3 className="text-lg font-medium text-blue-700">Endereço</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="endereco" className="text-sm font-medium flex items-center">
                  Endereço Completo {isFirstLogin && <ObrigatorioIcon />}
                </Label>
                <Input 
                  id="endereco" 
                  value={estabelecimentoInfo.endereco} 
                  onChange={(e) => handleEstabelecimentoChange('endereco', e.target.value)}
                  placeholder="Ex: Av. Brasil, 1000, Sala 123"
                  className={isFirstLogin && !estabelecimentoInfo.endereco ? "border-red-300" : ""}
                />
                {isFirstLogin && !estabelecimentoInfo.endereco && (
                  <p className="text-xs text-red-500">Este campo é obrigatório</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="cidade" className="text-sm font-medium flex items-center">
                  Cidade {isFirstLogin && <ObrigatorioIcon />}
                </Label>
                <Input 
                  id="cidade" 
                  value={estabelecimentoInfo.cidade} 
                  onChange={(e) => handleEstabelecimentoChange('cidade', e.target.value)}
                  placeholder="Ex: São Paulo"
                  className={isFirstLogin && !estabelecimentoInfo.cidade ? "border-red-300" : ""}
                />
                {isFirstLogin && !estabelecimentoInfo.cidade && (
                  <p className="text-xs text-red-500">Este campo é obrigatório</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado" className="text-sm font-medium flex items-center">
                  Estado {isFirstLogin && <ObrigatorioIcon />}
                </Label>
                <select 
                  id="estado" 
                  value={estabelecimentoInfo.estado} 
                  onChange={(e) => handleEstabelecimentoChange('estado', e.target.value)}
                  className={`w-full rounded-md border ${isFirstLogin && !estabelecimentoInfo.estado ? "border-red-300" : "border-gray-300"} py-2 px-3 text-sm`}
                >
                  <option value="">Selecione um estado</option>
                  {estados.map(estado => (
                    <option key={estado.sigla} value={estado.sigla}>
                      {estado.nome} ({estado.sigla})
                    </option>
                  ))}
                </select>
                {isFirstLogin && !estabelecimentoInfo.estado && (
                  <p className="text-xs text-red-500">Este campo é obrigatório</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="cep" className="text-sm font-medium flex items-center">
                  CEP {isFirstLogin && <ObrigatorioIcon />}
                </Label>
                <Input 
                  id="cep" 
                  value={estabelecimentoInfo.cep} 
                  onChange={(e) => handleEstabelecimentoChange('cep', e.target.value)}
                  placeholder="Ex: 00000-000"
                  className={isFirstLogin && !estabelecimentoInfo.cep ? "border-red-300" : ""}
                />
                {isFirstLogin && !estabelecimentoInfo.cep && (
                  <p className="text-xs text-red-500">Este campo é obrigatório</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="space-y-2">
                <Label htmlFor="latitude" className="text-sm font-medium flex items-center gap-1">
                  <Navigation className="h-3 w-3 rotate-45" />
                  Latitude
                </Label>
                <Input 
                  id="latitude" 
                  value={estabelecimentoInfo.latitude}
                  onChange={(e) => handleEstabelecimentoChange('latitude', e.target.value)}
                  placeholder="-23.5505"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude" className="text-sm font-medium flex items-center gap-1">
                  <Navigation className="h-3 w-3 rotate-[135deg]" />
                  Longitude
                </Label>
                <Input 
                  id="longitude" 
                  value={estabelecimentoInfo.longitude}
                  onChange={(e) => handleEstabelecimentoChange('longitude', e.target.value)}
                  placeholder="-46.6333"
                />
              </div>
            </div>
            
            <div className="pt-3">
              <Label htmlFor="descricao" className="text-sm font-medium">
                Descrição do Estabelecimento
              </Label>
              <Textarea 
                id="descricao" 
                value={estabelecimentoInfo.descricao} 
                onChange={(e) => handleEstabelecimentoChange('descricao', e.target.value)}
                placeholder="Descreva brevemente seu salão, serviços oferecidos, diferenciais, etc."
                className="h-24 mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card de Horário de Funcionamento */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center text-blue-700">
            <Clock className="h-5 w-5 mr-2 text-blue-500" /> 
            Horário de Funcionamento
          </CardTitle>
          <CardDescription>
            Configure os horários de atendimento do seu salão, incluindo intervalos se necessário
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(diasConfig).map(([dia, config]) => (
              <Collapsible key={dia} className="border rounded-md p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch 
                      id={`dia-${dia}`} 
                      checked={config.ativo}
                      onCheckedChange={(checked) => handleDiaAtivo(dia, checked)}
                    />
                    <Label htmlFor={`dia-${dia}`} className={`font-medium ${!config.ativo ? 'text-gray-400' : ''}`}>
                      {dia}
                      {config.temIntervalo && config.ativo && (
                        <Badge variant="outline" className="ml-2 text-xs bg-amber-50 text-amber-700 border-amber-200">
                          <Coffee className="h-3 w-3 mr-1" />
                          Intervalo
                        </Badge>
                      )}
                    </Label>
                  </div>

                  {config.ativo ? (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Input 
                          type="time" 
                          className="w-24" 
                          value={config.inicio}
                          onChange={(e) => handleTempoChange(dia, 'inicio', e.target.value)}
                          disabled={!config.ativo}
                        />
                        <span className={`mx-1 ${!config.ativo ? 'text-gray-400' : ''}`}>às</span>
                        <Input 
                          type="time" 
                          className="w-24"
                          value={config.fim}
                          onChange={(e) => handleTempoChange(dia, 'fim', e.target.value)}
                          disabled={!config.ativo}
                        />
                      </div>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="px-2">
                          {config.temIntervalo ? (
                            <MinusCircle className="h-4 w-4 text-amber-600" />
                          ) : (
                            <PlusCircle className="h-4 w-4 text-blue-600" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">Fechado</span>
                  )}
                </div>
                
                <CollapsibleContent className="pt-3">
                  <div className="flex items-center gap-2 pt-3 border-t mt-3">
                    <div className="flex items-center gap-2">
                      <Coffee className="h-4 w-4 text-amber-600" />
                      <span className="text-sm">Intervalo:</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Input 
                        type="time" 
                        className="w-24" 
                        value={config.intervaloInicio}
                        onChange={(e) => handleTempoChange(dia, 'intervaloInicio', e.target.value)}
                        disabled={!config.ativo}
                      />
                      <span className="mx-1">às</span>
                      <Input 
                        type="time" 
                        className="w-24"
                        value={config.intervaloFim}
                        onChange={(e) => handleTempoChange(dia, 'intervaloFim', e.target.value)}
                        disabled={!config.ativo}
                      />
                    </div>
                    <Button 
                      variant={config.temIntervalo ? "default" : "outline"} 
                      size="sm"
                      className={`ml-2 ${config.temIntervalo ? "bg-amber-600 hover:bg-amber-700" : "text-amber-600 border-amber-200 hover:bg-amber-50"}`}
                      onClick={() => toggleIntervalo(dia)}
                      disabled={!config.ativo}
                    >
                      {config.temIntervalo ? "Remover" : "Adicionar"} Intervalo
                    </Button>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
          
          <div className="mt-6 bg-blue-50 p-3 rounded-md border border-blue-100">
            <div className="flex gap-2 text-sm text-blue-700">
              <Clock className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">Configuração de Intervalo</p>
                <p className="mt-1 text-blue-600">
                  O intervalo define um período em que o estabelecimento estará fechado para novos agendamentos (ex: horário de almoço). 
                  Durante esse período não serão exibidos horários disponíveis na agenda online.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card de Configurações Regionais */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center text-blue-700">
            <Globe className="h-5 w-5 mr-2 text-blue-500" /> 
            Configurações Regionais
          </CardTitle>
          <CardDescription>
            Configure o fuso horário, formato de data e moeda para o seu estabelecimento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fuso-horario">Fuso Horário</Label>
              <select 
                id="fuso-horario" 
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={configRegionais.fusoHorario}
                onChange={(e) => handleRegionalChange('fusoHorario', e.target.value)}
              >
                <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
                <option value="America/Manaus">Manaus (GMT-4)</option>
                <option value="America/Belem">Belém (GMT-3)</option>
                <option value="America/Bahia">Salvador (GMT-3)</option>
                <option value="America/Cuiaba">Cuiabá (GMT-4)</option>
                <option value="America/Fortaleza">Fortaleza (GMT-3)</option>
                <option value="America/Recife">Recife (GMT-3)</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="formato-data">Formato de Data</Label>
              <select 
                id="formato-data" 
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={configRegionais.formatoData}
                onChange={(e) => handleRegionalChange('formatoData', e.target.value)}
              >
                <option value="DD/MM/YYYY">DD/MM/AAAA (31/12/2023)</option>
                <option value="MM/DD/YYYY">MM/DD/AAAA (12/31/2023)</option>
                <option value="YYYY-MM-DD">AAAA-MM-DD (2023-12-31)</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="formato-hora">Formato de Hora</Label>
              <select 
                id="formato-hora" 
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={configRegionais.formatoHora}
                onChange={(e) => handleRegionalChange('formatoHora', e.target.value)}
              >
                <option value="24h">24 horas (14:30)</option>
                <option value="12h">12 horas (2:30 PM)</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="moeda">Moeda</Label>
              <select 
                id="moeda" 
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={configRegionais.moeda}
                onChange={(e) => handleRegionalChange('moeda', e.target.value)}
              >
                <option value="BRL">Real Brasileiro (R$)</option>
                <option value="USD">Dólar Americano ($)</option>
                <option value="EUR">Euro (€)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
