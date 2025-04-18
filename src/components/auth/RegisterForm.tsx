import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { 
  Mail, 
  Lock, 
  User, 
  Loader2, 
  Eye, 
  EyeOff, 
  UserPlus, 
  Building2, 
  FileText, 
  MapPin, 
  Phone, 
  Image, 
  CheckCircle,
  ArrowRight,
  ArrowLeft 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";
import { supabase } from "@/lib/supabaseClient";

const RegisterForm = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Etapa 1: Dados do estabelecimento
  const [estabelecimento, setEstabelecimento] = useState("");
  const [cnpj, setCnpj] = useState("");

  // Etapa 2: Endereço
  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [loadingCep, setLoadingCep] = useState(false);
  const [estados, setEstados] = useState<{id: number, nome: string, sigla: string}[]>([]);
  const [cidades, setCidades] = useState<{id: number, nome: string}[]>([]);
  const [estadoId, setEstadoId] = useState<number | null>(null);

  // Etapa 3: Dados de acesso
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Etapa 4: Contato e finalização
  const [whatsapp, setWhatsapp] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Buscar estados da API do IBGE
  useEffect(() => {
    const fetchEstados = async () => {
      try {
        const response = await axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
        setEstados(response.data);
      } catch (error) {
        console.error('Erro ao buscar estados:', error);
      }
    };

    fetchEstados();
  }, []);

  // Buscar cidades quando um estado for selecionado
  useEffect(() => {
    const fetchCidades = async () => {
      if (!estadoId) return;
      
      try {
        const response = await axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoId}/municipios?orderBy=nome`);
        setCidades(response.data);
      } catch (error) {
        console.error('Erro ao buscar cidades:', error);
      }
    };

    fetchCidades();
  }, [estadoId]);

  // Formatação de CNPJ
  const formatCNPJ = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 18);
  };

  // Formatação de CEP
  const formatCEP = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{5})(\d)/, '$1-$2')
      .slice(0, 9);
  };

  // Formatação de WhatsApp
  const formatWhatsApp = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d)(\d{4})$/, '$1-$2')
      .slice(0, 15);
  };

  // Buscar endereço pelo CEP
  const buscarCEP = async () => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    setLoadingCep(true);
    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      if (!response.data.erro) {
        setEndereco(response.data.logradouro);
        setBairro(response.data.bairro);
        setCidade(response.data.localidade);
        
        // Buscar ID do estado correspondente à UF retornada
        const estadoEncontrado = estados.find(estado => estado.sigla === response.data.uf);
        if (estadoEncontrado) {
          setEstado(estadoEncontrado.sigla);
          setEstadoId(estadoEncontrado.id);
        }
      } else {
        toast({
          variant: "destructive",
          title: "CEP não encontrado",
          description: "Verifique o CEP informado.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar CEP",
        description: "Ocorreu um erro ao buscar o endereço.",
      });
    } finally {
      setLoadingCep(false);
    }
  };

  // Validação de Email
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Verificar se a etapa atual está completa
  const isCurrentStepValid = () => {
    switch (activeStep) {
      case 1:
        return estabelecimento.length >= 3 && cnpj.replace(/\D/g, '').length === 14;
      case 2:
        return cep.replace(/\D/g, '').length === 8 && 
               endereco.length >= 3 && 
               numero.length >= 1 && 
               bairro.length >= 2 && 
               cidade.length >= 2 && 
               estado.length === 2;
      case 3:
        return validateEmail(email) && 
               password.length >= 6 && 
               password === confirmPassword;
      case 4:
        return whatsapp.replace(/\D/g, '').length >= 10 && acceptTerms;
      default:
        return false;
    }
  };

  // Avançar para próxima etapa
  const handleNextStep = () => {
    if (isCurrentStepValid() && activeStep < 4) {
      setActiveStep(activeStep + 1);
    }
  };

  // Voltar para etapa anterior
  const handlePreviousStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  // Manipular mudança do CNPJ
  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCnpj(formatCNPJ(e.target.value));
  };

  // Manipular mudança do CEP
  const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCep(formatCEP(e.target.value));
  };

  // Manipular mudança do WhatsApp
  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWhatsapp(formatWhatsApp(e.target.value));
  };

  // Manipular mudança do estado
  const handleEstadoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    const estadoSelecionado = estados.find(estado => estado.id === id);
    if (estadoSelecionado) {
      setEstado(estadoSelecionado.sigla);
      setEstadoId(id);
      setCidade('');
    }
  };

  // Manipular upload da logo
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submeter o formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCurrentStepValid()) {
      toast({
        variant: "destructive",
        title: "Formulário incompleto",
        description: "Por favor, preencha todos os campos obrigatórios.",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log("Iniciando processo de cadastro completo...");
      
      // Variável para armazenar a URL da logo
      let logoUrl = null;
      
      // Fazer upload da logo se existir
      if (logo) {
        try {
          console.log("Iniciando upload da logo...");
          
          // Criar um nome único para o arquivo
          const fileExt = logo.name.split('.').pop();
          const fileName = `${Date.now()}.${fileExt}`;
          const filePath = `${fileName}`;
          
          // Fazer upload da imagem para o bucket 'logos'
          console.log("Tentando fazer upload para:", filePath);
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('logos')
            .upload(filePath, logo, {
              cacheControl: '3600',
              upsert: true
            });
            
          if (uploadError) {
            console.error("Erro no upload da logo:", uploadError);
            throw new Error(`Erro no upload: ${uploadError.message}`);
          }
          
          console.log("Upload concluído com sucesso:", uploadData);
          
          // Obter a URL pública da imagem
          const { data: urlData } = await supabase.storage
            .from('logos')
            .getPublicUrl(filePath);
            
          logoUrl = urlData.publicUrl;
          console.log("URL pública da logo:", logoUrl);
        } catch (logoError) {
          console.error("Erro no processo de upload da logo:", logoError);
          toast({
            variant: "warning",
            title: "Aviso sobre a logo",
            description: "Não foi possível fazer o upload da logo, mas o cadastro continuará.",
          });
        }
      }
      
      // Preparar dados para o cadastro com a URL da logo
      const userData = {
        email,
        password,
        options: {
          data: {
            name: estabelecimento,
            cnpj: cnpj,
            whatsapp: whatsapp,
            logo_url: logoUrl, // Adicionar a URL da logo aos metadados
            address_cep: cep,
            address_street: endereco,
            address_number: numero,
            address_complement: complemento,
            address_neighborhood: bairro,
            address_city: cidade,
            address_state: estado
          },
        },
      };
      
      console.log("Enviando dados para registro:", {
        email: userData.email,
        metadataKeys: Object.keys(userData.options.data)
      });

      // Registrar o usuário no Supabase Auth
      const { data, error } = await supabase.auth.signUp(userData);

      if (error) {
        console.error("Erro detalhado ao registrar usuário:", error);
        throw error;
      }

      console.log("Usuário registrado com sucesso:", data?.user?.id);

      // Agora vamos garantir que a logo seja salva também no perfil
      if (data?.user && logoUrl) {
        try {
          // Aguardar um momento para que o perfil seja criado pelo trigger
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Atualizar o perfil com a URL da logo
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
              logo_url: logoUrl
            })
            .eq('id', data.user.id);
            
          if (updateError) {
            console.error("Erro ao atualizar logo no perfil:", updateError);
          } else {
            console.log("Logo atualizada no perfil com sucesso");
          }
        } catch (profileError) {
          console.error("Erro ao atualizar logo no perfil:", profileError);
        }
      }

      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Verifique seu e-mail para confirmar sua conta. Após confirmar, você poderá fazer login.",
        variant: "success"
      });
      
      // Limpar o formulário
      setEstabelecimento("");
      setCnpj("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setWhatsapp("");
      setLogo(null);
      setLogoPreview("");
      
      // Redirecionamento para a página de login
      setTimeout(() => {
        window.location.href = "/";
      }, 3000);
      
    } catch (error) {
      console.error("Erro completo no cadastro:", error);
      
      // Mensagens de erro mais descritivas baseadas no tipo de erro
      let errorMessage = "Por favor, tente novamente mais tarde.";
      
      if (error.message?.includes("row-level security policy")) {
        errorMessage = "Erro de permissão no servidor. Por favor, entre em contato com o suporte.";
      } else if (error.message?.includes("Database error")) {
        errorMessage = "Erro no banco de dados. Este email pode já estar em uso ou o servidor pode estar indisponível.";
      } else if (error.message?.includes("User already registered")) {
        errorMessage = "Este email já está registrado. Por favor, use a opção de recuperação de senha.";
      }
      
      toast({
        variant: "destructive",
        title: "Erro ao criar conta",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4 animate-fade-in">
      {/* Indicador de progresso */}
      <div className="flex justify-between items-center mb-4">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex flex-col items-center">
            <div 
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all text-sm",
                activeStep === step 
                  ? "bg-pink-500 text-white" 
                  : activeStep > step 
                    ? "bg-green-500 text-white" 
                    : "bg-gray-200 text-gray-500"
              )}
            >
              {activeStep > step ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                step
              )}
            </div>
            <div className="mt-1 text-xs text-center">
              {step === 1 && "Estabelecimento"}
              {step === 2 && "Endereço"}
              {step === 3 && "Acesso"}
              {step === 4 && "Finalizar"}
            </div>
          </div>
        ))}
      </div>

      <Card className="border border-gray-200">
        <CardContent className="pt-4">
          <form onSubmit={activeStep === 4 ? handleSubmit : (e) => e.preventDefault()}>
            {/* Etapa 1: Dados do estabelecimento */}
            {activeStep === 1 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold mb-2">Dados do Estabelecimento</h2>
                
                <div className="space-y-2">
                  <Label htmlFor="estabelecimento">Nome do Estabelecimento</Label>
                  <div className="relative group">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-500 transition-colors duration-200" size={18} />
                    <Input
                      id="estabelecimento"
                      type="text"
                      placeholder="Nome do seu salão ou barbearia"
                      value={estabelecimento}
                      onChange={(e) => setEstabelecimento(e.target.value)}
                      className="pl-10 border-gray-200 focus:border-pink-500 focus:ring-pink-200 transition-all duration-300"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <div className="relative group">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-500 transition-colors duration-200" size={18} />
                    <Input
                      id="cnpj"
                      type="text"
                      placeholder="00.000.000/0000-00"
                      value={cnpj}
                      onChange={handleCNPJChange}
                      className="pl-10 border-gray-200 focus:border-pink-500 focus:ring-pink-200 transition-all duration-300"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Etapa 2: Endereço */}
            {activeStep === 2 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold mb-2">Endereço</h2>
                
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <div className="flex gap-2">
                    <div className="relative group flex-1">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-500 transition-colors duration-200" size={18} />
                      <Input
                        id="cep"
                        type="text"
                        placeholder="00000-000"
                        value={cep}
                        onChange={handleCEPChange}
                        onBlur={buscarCEP}
                        className="pl-10 border-gray-200 focus:border-pink-500 focus:ring-pink-200 transition-all duration-300"
                        required
                      />
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={buscarCEP}
                      disabled={loadingCep || cep.replace(/\D/g, '').length !== 8}
                      className="w-20"
                    >
                      {loadingCep ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buscar"}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="endereco">Logradouro</Label>
                    <Input
                      id="endereco"
                      type="text"
                      placeholder="Rua, Avenida, etc."
                      value={endereco}
                      onChange={(e) => setEndereco(e.target.value)}
                      className="border-gray-200 focus:border-pink-500 focus:ring-pink-200 transition-all duration-300"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numero">Número</Label>
                    <Input
                      id="numero"
                      type="text"
                      placeholder="Número"
                      value={numero}
                      onChange={(e) => setNumero(e.target.value)}
                      className="border-gray-200 focus:border-pink-500 focus:ring-pink-200 transition-all duration-300"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="complemento">Complemento</Label>
                  <Input
                    id="complemento"
                    type="text"
                    placeholder="Sala, Conjunto, etc. (opcional)"
                    value={complemento}
                    onChange={(e) => setComplemento(e.target.value)}
                    className="border-gray-200 focus:border-pink-500 focus:ring-pink-200 transition-all duration-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input
                    id="bairro"
                    type="text"
                    placeholder="Bairro"
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                    className="border-gray-200 focus:border-pink-500 focus:ring-pink-200 transition-all duration-300"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <select
                      id="estado"
                      value={estadoId || ""}
                      onChange={handleEstadoChange}
                      className="w-full rounded-md border border-gray-200 py-2 px-3 focus:border-pink-500 focus:ring-pink-200 transition-all duration-300"
                      required
                    >
                      <option value="">Selecione o estado</option>
                      {estados.map(estado => (
                        <option key={estado.id} value={estado.id}>
                          {estado.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <select
                      id="cidade"
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                      className="w-full rounded-md border border-gray-200 py-2 px-3 focus:border-pink-500 focus:ring-pink-200 transition-all duration-300"
                      required
                    >
                      <option value="">Selecione a cidade</option>
                      {cidades.map(cidade => (
                        <option key={cidade.id} value={cidade.nome}>
                          {cidade.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Etapa 3: Dados de acesso */}
            {activeStep === 3 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold mb-2">Dados de Acesso</h2>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-500 transition-colors duration-200" size={18} />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu.email@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`pl-10 border-gray-200 focus:border-pink-500 focus:ring-pink-200 transition-all duration-300 ${
                        email && !validateEmail(email) ? "border-red-300 focus:border-red-500 focus:ring-red-200" : ""
                      }`}
                      required
                    />
                  </div>
                  {email && !validateEmail(email) && (
                    <p className="mt-1 text-xs text-red-500">
                      Digite um email válido
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-500 transition-colors duration-200" size={18} />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`pl-10 border-gray-200 focus:border-pink-500 focus:ring-pink-200 transition-all duration-300 ${
                        password && password.length < 6 ? "border-red-300 focus:border-red-500 focus:ring-red-200" : ""
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-500 transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {password && password.length < 6 && (
                    <p className="mt-1 text-xs text-red-500">
                      Senha deve ter pelo menos 6 caracteres
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirme sua senha</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-500 transition-colors duration-200" size={18} />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirme sua senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`pl-10 border-gray-200 focus:border-pink-500 focus:ring-pink-200 transition-all duration-300 ${
                        confirmPassword && confirmPassword !== password ? "border-red-300 focus:border-red-500 focus:ring-red-200" : ""
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-500 transition-colors duration-200"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== password && (
                    <p className="mt-1 text-xs text-red-500">
                      As senhas não conferem
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Etapa 4: Contato e finalização */}
            {activeStep === 4 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold mb-2">Contato e Identidade Visual</h2>
                
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <div className="relative group">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-500 transition-colors duration-200" size={18} />
                    <Input
                      id="whatsapp"
                      type="text"
                      placeholder="(00) 00000-0000"
                      value={whatsapp}
                      onChange={handleWhatsAppChange}
                      className="pl-10 border-gray-200 focus:border-pink-500 focus:ring-pink-200 transition-all duration-300"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="logo">Logo (opcional)</Label>
                  <div className="flex items-center gap-3">
                    {logoPreview && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                        <img 
                          src={logoPreview} 
                          alt="Logo preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        id="logo"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                        ref={fileInputRef}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border-dashed border-2 flex items-center justify-center gap-2 h-16"
                      >
                        <Image className="h-5 w-5" />
                        <span>{logo ? "Alterar imagem" : "Selecionar logo"}</span>
                      </Button>
                      <p className="text-xs text-gray-500 mt-1">
                        Formatos aceitos: JPG, PNG. Tamanho máximo: 2MB.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="terms"
                    className="mt-1 rounded border-gray-300 text-pink-500 focus:ring-pink-300"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    required
                  />
                  <label htmlFor="terms" className="text-sm text-neutral-soft">
                    Li e aceito os{" "}
                    <Link to="/terms" className="text-pink-600 hover:text-pink-700 transition-colors duration-200 hover:underline" target="_blank">
                      termos de uso
                    </Link>{" "}
                    e a{" "}
                    <Link to="/privacy" className="text-pink-600 hover:text-pink-700 transition-colors duration-200 hover:underline" target="_blank">
                      política de privacidade
                    </Link>
                  </label>
                </div>
              </div>
            )}

            {/* Botões de navegação */}
            <div className="flex justify-between mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handlePreviousStep}
                disabled={activeStep === 1}
                className="min-w-[80px]"
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
              </Button>

              {activeStep < 4 ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  disabled={!isCurrentStepValid()}
                  className="min-w-[80px] bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700"
                >
                  Avançar <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isLoading || !isCurrentStepValid()}
                  className="min-w-[80px] bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" /> Criar conta
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterForm;
