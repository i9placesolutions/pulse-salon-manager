import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { MapPin, Phone, Mail, Instagram, Facebook, MessageSquare, Upload, Building, Building2, MapPinned, User, AlertCircle, MessageCircle } from "lucide-react";
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAppState } from "@/contexts/AppStateContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

interface EstablishmentProfile {
  name: string;
  documentType: 'cnpj' | 'cpf';
  documentNumber: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    latitude?: string;
    longitude?: string;
  };
  whatsapp: string;
  email: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  logo: string;
  description: string;
  customUrl: string;
  primaryColor: string;
  responsible?: {
    name: string;
    phone: string;
    email: string;
  };
}

const defaultProfile: EstablishmentProfile = {
  name: "",
  documentType: 'cnpj',
  documentNumber: "",
  address: {
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
    latitude: "",
    longitude: ""
  },
  whatsapp: "",
  email: "",
  instagram: "",
  facebook: "",
  tiktok: "",
  logo: "",
  description: "",
  customUrl: "",
  primaryColor: "#1e40af",
  responsible: {
    name: "",
    phone: "",
    email: ""
  }
};

export default function EstablishmentProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<EstablishmentProfile>(defaultProfile);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { establishmentName, setEstablishmentName, profileState, updateProfileCompletion } = useAppState();
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Verificar usuário autenticado e buscar dados do perfil
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUserId(session.user.id);
        
        try {
          // Buscar dados do perfil básico
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileError) {
            console.error("Erro ao buscar perfil:", profileError);
            toast({
              variant: "destructive",
              title: "Erro ao carregar perfil",
              description: "Não foi possível carregar os dados do seu perfil.",
            });
          } else if (profileData) {
            // Atualizar informações básicas do perfil
            setProfile(prev => ({ 
              ...prev, 
              name: profileData.establishment_name 
            }));
            
            // Buscar detalhes do estabelecimento
            const { data: detailsData, error: detailsError } = await supabase
              .from('establishment_details')
              .select('*')
              .eq('id', session.user.id)
              .single();
              
            if (detailsError && detailsError.code !== 'PGRST116') {
              console.error("Erro ao buscar detalhes:", detailsError);
            } else if (detailsData) {
              // Preencher dados do formulário com os dados do banco
              setProfile(prev => ({
                ...prev,
                documentType: detailsData.document_type as 'cnpj' | 'cpf' || 'cnpj',
                documentNumber: detailsData.document_number || '',
                address: {
                  street: detailsData.address_street || '',
                  number: detailsData.address_number || '',
                  complement: detailsData.address_complement || '',
                  neighborhood: detailsData.address_neighborhood || '',
                  city: detailsData.address_city || '',
                  state: detailsData.address_state || '',
                  zipCode: detailsData.address_zipcode || '',
                  latitude: detailsData.address_latitude || '',
                  longitude: detailsData.address_longitude || ''
                },
                whatsapp: detailsData.whatsapp || '',
                email: detailsData.email || '',
                instagram: detailsData.instagram || '',
                facebook: detailsData.facebook || '',
                tiktok: detailsData.tiktok || '',
                logo: detailsData.logo_url || '',
                description: detailsData.description || '',
                customUrl: detailsData.custom_url || '',
                primaryColor: detailsData.primary_color || '#1e40af',
                responsible: {
                  name: detailsData.responsible_name || '',
                  phone: detailsData.responsible_phone || '',
                  email: detailsData.responsible_email || ''
                }
              }));
              
              // Se tiver logo, mostrar a preview
              if (detailsData.logo_url) {
                setLogoPreview(detailsData.logo_url);
              }
            }
          }
        } catch (error) {
          console.error("Erro ao processar perfil:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Usuário não está autenticado, redirecionar para login
        navigate("/");
        toast({
          variant: "destructive",
          title: "Sessão expirada",
          description: "Por favor, faça login para acessar esta página.",
        });
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate, toast]);

  // Atualizar o nome do estabelecimento a partir do contexto
  useEffect(() => {
    if (establishmentName && establishmentName !== profile.name) {
      setProfile(prev => ({ ...prev, name: establishmentName }));
    }
  }, [establishmentName]);

  // Verificar se o usuário está em primeiro login e não deve poder sair desta página
  useEffect(() => {
    if (profileState.isFirstLogin && !profileState.isProfileComplete) {
      // Impedir que o usuário saia da página
      window.onbeforeunload = (e) => {
        // Esta mensagem é ignorada por muitos navegadores
        const message = "Você precisa completar seu perfil antes de continuar.";
        e.returnValue = message;
        return message;
      };

      // Detectar tentativas de navegação
      const handleBeforeNavigate = (e: BeforeUnloadEvent) => {
        if (!profileState.isProfileComplete) {
          const message = "Você precisa completar seu perfil antes de continuar.";
          e.returnValue = message;
          return message;
        }
      };

      window.addEventListener('beforeunload', handleBeforeNavigate);
      return () => {
        window.removeEventListener('beforeunload', handleBeforeNavigate);
        window.onbeforeunload = null;
      };
    }
  }, [profileState.isFirstLogin, profileState.isProfileComplete]);

  // Checar se o perfil está completo
  const checkProfileCompletion = (): boolean => {
    const requiredFields: string[] = [];

    // Verificar campos obrigatórios
    if (!profile.name || profile.name.trim().length < 3) requiredFields.push("Nome do estabelecimento");
    if (!profile.documentNumber) requiredFields.push("Número do documento (CPF/CNPJ)");
    if (!profile.address.street) requiredFields.push("Rua/Avenida");
    if (!profile.address.number) requiredFields.push("Número");
    if (!profile.address.neighborhood) requiredFields.push("Bairro");
    if (!profile.address.city) requiredFields.push("Cidade");
    if (!profile.address.state) requiredFields.push("Estado");
    if (!profile.address.zipCode) requiredFields.push("CEP");
    if (!profile.whatsapp) requiredFields.push("WhatsApp");
    if (!profile.email) requiredFields.push("E-mail");
    if (!profile.responsible?.name) requiredFields.push("Nome do responsável");
    if (!profile.responsible?.phone) requiredFields.push("Telefone do responsável");
    if (!profile.responsible?.email) requiredFields.push("E-mail do responsável");

    setMissingFields(requiredFields);
    return requiredFields.length === 0;
  };

  const formatWhatsApp = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length <= 2) {
      return `(${numbers}`;
    }
    if (numbers.length <= 6) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    }
    if (numbers.length <= 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    }
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const formatDocument = (value: string, type: 'cnpj' | 'cpf') => {
    const numbers = value.replace(/\D/g, '');
    
    if (type === 'cpf') {
      // Formatar CPF: 000.000.000-00
      if (numbers.length <= 3) {
        return numbers;
      }
      if (numbers.length <= 6) {
        return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
      }
      if (numbers.length <= 9) {
        return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
      }
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
    } else {
      // Formatar CNPJ: 00.000.000/0000-00
      if (numbers.length <= 2) {
        return numbers;
      }
      if (numbers.length <= 5) {
        return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
      }
      if (numbers.length <= 8) {
        return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
      }
      if (numbers.length <= 12) {
        return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
      }
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDocument(e.target.value, profile.documentType);
    setProfile({ ...profile, documentNumber: formatted });
  };

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatWhatsApp(e.target.value);
    setProfile({ ...profile, whatsapp: formatted });
  };

  const handleResponsibleChange = (field: string, value: string) => {
    if (!profile.responsible) {
      setProfile({
        ...profile,
        responsible: {
          name: field === 'name' ? value : '',
          phone: field === 'phone' ? value : '',
          email: field === 'email' ? value : ''
        }
      });
      return;
    }

    setProfile({
      ...profile,
      responsible: {
        ...profile.responsible,
        [field]: value
      }
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getFullAddress = () => {
    const a = profile.address;
    const complement = a.complement ? `, ${a.complement}` : '';
    return `${a.street}, ${a.number}${complement} - ${a.neighborhood}, ${a.city}/${a.state} - CEP ${a.zipCode}`;
  };

  const openWhatsApp = () => {
    const number = profile.whatsapp.replace(/\D/g, '');
    window.open(`https://wa.me/55${number}`, '_blank');
  };

  // Função para fazer upload da logo
  const uploadLogo = async (userId: string): Promise<string | null> => {
    if (!logoFile) {
      // Se não tem novo arquivo, retorna a URL atual (pode ser vazia)
      return profile.logo;
    }
    
    try {
      // Criar nome único para o arquivo
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${userId}/${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      // Fazer upload do arquivo
      const { error: uploadError } = await supabase.storage
        .from('establishment_logos')
        .upload(filePath, logoFile);
        
      if (uploadError) throw uploadError;
      
      // Obter URL pública do arquivo
      const { data } = supabase.storage
        .from('establishment_logos')
        .getPublicUrl(filePath);
        
      return data.publicUrl;
    } catch (error) {
      console.error("Erro ao fazer upload da logo:", error);
      return null;
    }
  };

  const handleSave = async () => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Erro de autenticação",
        description: "Você precisa estar logado para salvar seu perfil.",
      });
      return;
    }
    
    const isComplete = checkProfileCompletion();
    
    if (!isComplete) {
      toast({
        variant: "destructive",
        title: "Perfil incompleto",
        description: "Por favor, preencha todos os campos obrigatórios.",
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Fazer upload da logo se houver
      const logoUrl = await uploadLogo(userId);
      
      // Atualizar os dados básicos do perfil
      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({
          establishment_name: profile.name,
          is_profile_complete: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateProfileError) throw updateProfileError;

      // Atualizar os detalhes do estabelecimento
      const { error: updateDetailsError } = await supabase
        .from('establishment_details')
        .update({
          document_type: profile.documentType,
          document_number: profile.documentNumber,
          address_street: profile.address.street,
          address_number: profile.address.number,
          address_complement: profile.address.complement,
          address_neighborhood: profile.address.neighborhood,
          address_city: profile.address.city,
          address_state: profile.address.state,
          address_zipcode: profile.address.zipCode,
          address_latitude: profile.address.latitude,
          address_longitude: profile.address.longitude,
          whatsapp: profile.whatsapp,
          email: profile.email,
          instagram: profile.instagram,
          facebook: profile.facebook,
          tiktok: profile.tiktok,
          logo_url: logoUrl,
          description: profile.description,
          custom_url: profile.customUrl,
          primary_color: profile.primaryColor,
          responsible_name: profile.responsible?.name,
          responsible_phone: profile.responsible?.phone,
          responsible_email: profile.responsible?.email,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateDetailsError) throw updateDetailsError;
      
      // Atualizar o nome do estabelecimento no contexto global
      setEstablishmentName(profile.name);
      
      // Marcar o perfil como completo
      updateProfileCompletion(true);
      
      // Mostrar mensagem de sucesso
      toast({
        title: "Perfil salvo com sucesso!",
        description: `Bem-vindo ao ${profile.name}! Você será redirecionado para o dashboard.`,
        duration: 5000,
      });
      
      // Redirecionar para o dashboard após um breve delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar perfil",
        description: error.message || "Ocorreu um erro ao salvar seu perfil. Tente novamente.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Função para atualizar campos de endereço
  const handleAddressChange = (field: keyof EstablishmentProfile['address'], value: string) => {
    setProfile({
      ...profile,
      address: {
        ...profile.address,
        [field]: value
      }
    });
  };

  if (isLoading) {
    return (
      <PageLayout variant="blue">
        <div className="flex items-center justify-center h-96">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-t-transparent"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout variant="blue">
      <PageHeader 
        title="Perfil do Estabelecimento" 
        subtitle="Gerencie as informações e a identidade visual do seu salão"
        variant="blue"
        badge="Identificação"
        action={
          <Button 
            onClick={handleSave} 
            variant="dashboard" 
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                Salvando...
              </>
            ) : (
              "Salvar Alterações"
            )}
          </Button>
        }
      />
      
      {/* Alerta se for primeiro login */}
      {profileState.isFirstLogin && !profileState.isProfileComplete && (
        <Alert variant="destructive" className="mb-4 border-red-300 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Atenção!</AlertTitle>
          <AlertDescription>
            É necessário completar seu perfil para continuar usando o sistema. 
            Preencha todos os campos obrigatórios e clique em "Salvar Alterações".
          </AlertDescription>
        </Alert>
      )}
      
      {/* Mostrar campos que faltam ser preenchidos */}
      {missingFields.length > 0 && (
        <Alert variant="warning" className="mb-4 border-yellow-300 bg-yellow-50">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Campos obrigatórios pendentes:</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
              {missingFields.map((field, index) => (
                <li key={index}>{field}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList className="bg-blue-50 border border-blue-100 p-1 rounded-lg">
          <TabsTrigger 
            value="info" 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Informações
          </TabsTrigger>
          <TabsTrigger 
            value="branding" 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Identidade Visual
          </TabsTrigger>
          <TabsTrigger 
            value="social" 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Redes Sociais
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <Card className="border-blue-100">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-100">
              <CardTitle className="text-blue-700">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-blue-700">Nome do Estabelecimento</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Nome do seu salão"
                  className="border-blue-200 focus:border-blue-400"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-blue-700">Tipo de Documento</Label>
                  <div className="bg-blue-50/80 p-3 rounded-md border border-blue-100 flex gap-6">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="doc-cnpj"
                        name="document-type"
                        checked={profile.documentType === 'cnpj'}
                        onChange={() => setProfile({ ...profile, documentType: 'cnpj', documentNumber: '' })}
                        className="hidden peer"
                      />
                      <label 
                        htmlFor="doc-cnpj" 
                        className="cursor-pointer flex items-center gap-2 text-sm font-medium text-blue-700 peer-checked:text-blue-700 peer-checked:font-semibold"
                      >
                        <div className="w-4 h-4 rounded-full border-2 border-blue-400 flex items-center justify-center peer-checked:border-blue-600">
                          <div className={`w-2 h-2 rounded-full ${profile.documentType === 'cnpj' ? 'bg-blue-600' : 'bg-transparent'}`}></div>
                        </div>
                        CNPJ
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="doc-cpf"
                        name="document-type"
                        checked={profile.documentType === 'cpf'}
                        onChange={() => setProfile({ ...profile, documentType: 'cpf', documentNumber: '' })}
                        className="hidden peer"
                      />
                      <label 
                        htmlFor="doc-cpf" 
                        className="cursor-pointer flex items-center gap-2 text-sm font-medium text-blue-700 peer-checked:text-blue-700 peer-checked:font-semibold"
                      >
                        <div className="w-4 h-4 rounded-full border-2 border-blue-400 flex items-center justify-center">
                          <div className={`w-2 h-2 rounded-full ${profile.documentType === 'cpf' ? 'bg-blue-600' : 'bg-transparent'}`}></div>
                        </div>
                        CPF
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="document-number" className="text-blue-700">
                    {profile.documentType === 'cnpj' ? 'CNPJ' : 'CPF'}
                  </Label>
                  <div className="relative">
                    <Input
                      id="document-number"
                      value={profile.documentNumber}
                      onChange={handleDocumentChange}
                      placeholder={profile.documentType === 'cnpj' ? '00.000.000/0000-00' : '000.000.000-00'}
                      className="border-blue-200 focus:border-blue-400 pl-10"
                      maxLength={profile.documentType === 'cnpj' ? 18 : 14}
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                        <path d="M16 2v5" />
                        <path d="M8 2v5" />
                        <path d="M3 10h18" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    Formato: {profile.documentType === 'cnpj' ? '00.000.000/0000-00' : '000.000.000-00'}
                  </p>
                </div>
              </div>

              <div className="space-y-3 mt-4">
                <Label className="text-blue-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  Endereço Completo
                </Label>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="street" className="text-sm text-blue-600">Rua/Avenida</Label>
                    <div className="flex items-center">
                      <Building className="h-4 w-4 text-gray-400 mr-2" />
                      <Input
                        id="street"
                        value={profile.address.street}
                        onChange={(e) => handleAddressChange('street', e.target.value)}
                        placeholder="Nome da rua"
                        className="border-blue-200 focus:border-blue-400"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="number" className="text-sm text-blue-600">Número</Label>
                    <Input
                      id="number"
                      value={profile.address.number}
                      onChange={(e) => handleAddressChange('number', e.target.value)}
                      placeholder="Número"
                      className="border-blue-200 focus:border-blue-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="complement" className="text-sm text-blue-600">Complemento</Label>
                    <Input
                      id="complement"
                      value={profile.address.complement || ''}
                      onChange={(e) => handleAddressChange('complement', e.target.value)}
                      placeholder="Sala, andar, etc. (opcional)"
                      className="border-blue-200 focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <Label htmlFor="neighborhood" className="text-sm text-blue-600">Bairro</Label>
                    <Input
                      id="neighborhood"
                      value={profile.address.neighborhood}
                      onChange={(e) => handleAddressChange('neighborhood', e.target.value)}
                      placeholder="Bairro"
                      className="border-blue-200 focus:border-blue-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="city" className="text-sm text-blue-600">Cidade</Label>
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                      <Input
                        id="city"
                        value={profile.address.city}
                        onChange={(e) => handleAddressChange('city', e.target.value)}
                        placeholder="Cidade"
                        className="border-blue-200 focus:border-blue-400"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="state" className="text-sm text-blue-600">Estado</Label>
                    <Input
                      id="state"
                      value={profile.address.state}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                      placeholder="UF"
                      maxLength={2}
                      className="border-blue-200 focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode" className="text-sm text-blue-600">CEP</Label>
                    <Input
                      id="zipCode"
                      value={profile.address.zipCode}
                      onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                      placeholder="00000-000"
                      className="border-blue-200 focus:border-blue-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div>
                    <Label htmlFor="latitude" className="text-sm text-blue-600 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                        <circle cx="12" cy="10" r="3" />
                        <path d="M12 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      </svg>
                      Latitude
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id="latitude"
                        value={profile.address.latitude || ''}
                        onChange={(e) => handleAddressChange('latitude', e.target.value)}
                        placeholder="Ex: -23.5505"
                        className="border-blue-200 focus:border-blue-400 pl-7"
                      />
                      <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-blue-400 text-xs font-mono">
                        Lat:
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="longitude" className="text-sm text-blue-600 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                        <path d="M12 2a10 10 0 1 0 10 10" />
                        <path d="M12 12H2" />
                        <path d="m2 9 3 3-3 3" />
                      </svg>
                      Longitude
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id="longitude"
                        value={profile.address.longitude || ''}
                        onChange={(e) => handleAddressChange('longitude', e.target.value)}
                        placeholder="Ex: -46.6333"
                        className="border-blue-200 focus:border-blue-400 pl-8"
                      />
                      <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-blue-400 text-xs font-mono">
                        Long:
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center mt-2">
                  <div className="flex-grow border-t border-blue-100"></div>
                  <div className="px-2 text-xs text-blue-400">Localização no Mapa</div>
                  <div className="flex-grow border-t border-blue-100"></div>
                </div>

                <div className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-100 flex items-start gap-3">
                  <div className="mt-0.5">
                    <MapPinned className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-sm text-blue-700 font-medium">Endereço Completo:</span>
                    <p className="text-sm mt-1 text-blue-600">{getFullAddress()}</p>
                    {profile.address.latitude && profile.address.longitude && (
                      <div className="mt-2">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${profile.address.latitude},${profile.address.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 py-1 px-2 rounded transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                          </svg>
                          Ver no Google Maps
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-md border border-b-0 border-blue-200 px-4 py-3 flex items-center justify-between">
                  <h3 className="text-blue-700 font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Contato do Responsável
                  </h3>
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">Principal</span>
                </div>
                <div className="border border-blue-200 rounded-b-md p-4 bg-white">
                  <div className="grid gap-5 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label 
                        htmlFor="responsible-name" 
                        className="text-sm text-blue-600 flex items-center gap-1.5"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        Nome Completo
                      </Label>
                      <div className="relative">
                        <Input
                          id="responsible-name"
                          value={profile.responsible?.name || ''}
                          onChange={(e) => handleResponsibleChange('name', e.target.value)}
                          placeholder="Nome do responsável"
                          className="border-blue-200 focus:border-blue-400 pl-8"
                        />
                        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-blue-400">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 0 1 0 7.75" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label 
                        htmlFor="responsible-phone" 
                        className="text-sm text-blue-600 flex items-center gap-1.5"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        Telefone
                      </Label>
                      <div className="relative">
                        <Input
                          id="responsible-phone"
                          value={profile.responsible?.phone || ''}
                          onChange={(e) => handleResponsibleChange('phone', e.target.value)}
                          placeholder="(00) 00000-0000"
                          className="border-blue-200 focus:border-blue-400 pl-8"
                        />
                        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-blue-400">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94m-1 7.98v3a1 1 0 0 1-.88 1 10.97 10.97 0 0 1-5.5-1.5 10.74 10.74 0 0 1-4.13-4.13A11 11 0 0 1 10 11V8a1 1 0 0 1 1-1h2.5" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label 
                        htmlFor="responsible-email" 
                        className="text-sm text-blue-600 flex items-center gap-1.5"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                        E-mail
                      </Label>
                      <div className="relative">
                        <Input
                          id="responsible-email"
                          type="email"
                          value={profile.responsible?.email || ''}
                          onChange={(e) => handleResponsibleChange('email', e.target.value)}
                          placeholder="contato@seusalao.com.br"
                          className="border-blue-200 focus:border-blue-400 pl-8"
                        />
                        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-blue-400">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="4" width="20" height="16" rx="2" />
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-blue-500 mt-4 italic">
                    Esta pessoa será contatada para assuntos administrativos e financeiros.
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="text-blue-700">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-blue-600" />
                      WhatsApp
                    </div>
                  </Label>
                  <Input
                    id="whatsapp"
                    value={profile.whatsapp}
                    onChange={handleWhatsAppChange}
                    placeholder="(00) 00000-0000"
                    className="border-blue-200 focus:border-blue-400"
                  />
                  <p className="text-xs text-blue-600 mt-1">
                    Formato: (64) 99618-5163
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-blue-700">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-600" />
                      E-mail
                    </div>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    placeholder="contato@seusalao.com.br"
                    className="border-blue-200 focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-blue-700">Descrição do Estabelecimento</Label>
                <Textarea
                  id="description"
                  value={profile.description}
                  onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                  placeholder="Descreva seu estabelecimento..."
                  rows={4}
                  className="border-blue-200 focus:border-blue-400"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-4">
          <Card className="border-blue-100">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-100">
              <CardTitle className="text-blue-700">Identidade Visual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="space-y-4">
                <Label className="text-blue-700">Logo do Estabelecimento</Label>
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div
                    className={`h-40 w-40 rounded-lg border-2 ${
                      logoPreview ? 'border-blue-200' : 'border-dashed border-blue-300'
                    } flex items-center justify-center overflow-hidden relative group cursor-pointer`}
                    onClick={triggerFileInput}
                  >
                    {logoPreview ? (
                      <>
                        <img
                          src={logoPreview}
                          alt="Logo do estabelecimento"
                          className="h-full w-full object-contain"
                        />
                        <div className="absolute inset-0 bg-blue-800/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Upload className="h-8 w-8 text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center text-blue-400">
                        <Upload className="h-10 w-10 mb-2" />
                        <span className="text-sm font-medium">Upload da Logo</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                  <div className="space-y-3">
                    <div className="text-sm text-blue-700">
                      <p className="font-medium mb-1">Recomendações:</p>
                      <ul className="space-y-1 text-blue-600">
                        <li className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 bg-blue-400 rounded-full"></span>
                          Formatos aceitos: PNG, JPG ou SVG
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 bg-blue-400 rounded-full"></span>
                          Tamanho máximo: 2MB
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 bg-blue-400 rounded-full"></span>
                          Resolução ideal: 400x400 pixels ou maior
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 bg-blue-400 rounded-full"></span>
                          Fundo transparente para melhor visualização
                        </li>
                      </ul>
                    </div>
                    <Button variant="outline" size="sm" onClick={triggerFileInput}>
                      <Upload className="h-3.5 w-3.5 mr-2" />
                      Selecionar arquivo
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <Card className="border-blue-100">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-100">
              <CardTitle className="text-blue-700">Redes Sociais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="instagram" className="text-blue-700">
                    <div className="flex items-center gap-2">
                      <Instagram className="h-4 w-4 text-blue-600" />
                      Instagram
                    </div>
                  </Label>
                  <Input
                    id="instagram"
                    value={profile.instagram}
                    onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                    placeholder="@seusalao"
                    className="border-blue-200 focus:border-blue-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facebook" className="text-blue-700">
                    <div className="flex items-center gap-2">
                      <Facebook className="h-4 w-4 text-blue-600" />
                      Facebook
                    </div>
                  </Label>
                  <Input
                    id="facebook"
                    value={profile.facebook}
                    onChange={(e) => setProfile({ ...profile, facebook: e.target.value })}
                    placeholder="/seusalao"
                    className="border-blue-200 focus:border-blue-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tiktok" className="text-blue-700">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                      TikTok
                    </div>
                  </Label>
                  <Input
                    id="tiktok"
                    value={profile.tiktok}
                    onChange={(e) => setProfile({ ...profile, tiktok: e.target.value })}
                    placeholder="@seusalao"
                    className="border-blue-200 focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="dashboard" className="gap-2" onClick={openWhatsApp}>
                  <MessageCircle className="h-4 w-4" />
                  Abrir WhatsApp
                </Button>
                <Button
                  variant="dashboard-outline"
                  className="gap-2"
                  onClick={() => window.open(`https://instagram.com/${profile.instagram}`, '_blank')}
                >
                  <Instagram className="h-4 w-4" />
                  Acessar Instagram
                </Button>
                <Button
                  variant="dashboard-outline"
                  className="gap-2"
                  onClick={() => window.open(`https://facebook.com/${profile.facebook}`, '_blank')}
                >
                  <Facebook className="h-4 w-4" />
                  Acessar Facebook
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}
