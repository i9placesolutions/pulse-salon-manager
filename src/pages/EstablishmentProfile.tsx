import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { MapPin, Phone, Mail, Instagram, Facebook, MessageSquare, Upload, Copy, QrCode, Eye, MessageCircle, Building, Building2, MapPinned, Clock, Plus, Trash2 } from "lucide-react";
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { supabase } from "@/lib/supabaseClient";
import { ProfileForm } from "@/components/establishment/ProfileForm";
import { WorkingHoursSection } from "@/components/establishment/WorkingHoursSection";
import { SecuritySection } from "@/components/establishment/SecuritySection";
import { BookingSection } from "@/components/establishment/BookingSection";
import { WhatsAppSection } from "@/components/establishment/WhatsAppSection";
import { PaymentsSection } from "@/components/establishment/PaymentsSection";

interface EstablishmentProfile {
  name: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
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
  workingHours: {
    dayOfWeek: string;
    openTime: string;
    closeTime: string;
    hasBreak: boolean;
    breakStart: string;
    breakEnd: string;
  }[];
}

const defaultProfile: EstablishmentProfile = {
  name: "Meu Salão",
  address: {
    street: "Rua Exemplo",
    number: "123",
    complement: "Sala 101",
    neighborhood: "Centro",
    city: "São Paulo",
    state: "SP",
    zipCode: "01001-000"
  },
  whatsapp: "(11) 99999-9999",
  email: "contato@meusalao.com.br",
  instagram: "meusalao",
  facebook: "meusalao",
  tiktok: "meusalao",
  logo: "",
  description: "Bem-vindo ao nosso salão! Oferecemos serviços de alta qualidade para cuidar da sua beleza.",
  customUrl: "meu-salao",
  primaryColor: "#1e40af",
  workingHours: [
    {
      dayOfWeek: "Segunda-feira",
      openTime: "09:00",
      closeTime: "18:00",
      hasBreak: true,
      breakStart: "12:00",
      breakEnd: "13:00"
    },
    {
      dayOfWeek: "Terça-feira",
      openTime: "09:00",
      closeTime: "18:00",
      hasBreak: true,
      breakStart: "12:00",
      breakEnd: "13:00"
    },
    {
      dayOfWeek: "Quarta-feira",
      openTime: "09:00",
      closeTime: "18:00",
      hasBreak: true,
      breakStart: "12:00",
      breakEnd: "13:00"
    },
    {
      dayOfWeek: "Quinta-feira",
      openTime: "09:00",
      closeTime: "18:00",
      hasBreak: true,
      breakStart: "12:00",
      breakEnd: "13:00"
    },
    {
      dayOfWeek: "Sexta-feira",
      openTime: "09:00",
      closeTime: "18:00",
      hasBreak: true,
      breakStart: "12:00",
      breakEnd: "13:00"
    },
    {
      dayOfWeek: "Sábado",
      openTime: "09:00",
      closeTime: "13:00",
      hasBreak: false,
      breakStart: "",
      breakEnd: ""
    }
  ]
};

export default function EstablishmentProfile() {
  const [profile, setProfile] = useState<EstablishmentProfile>(defaultProfile);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Estados para a seção de segurança
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [devices, setDevices] = useState<any[]>([]);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);

  // Função para processar os dados do perfil
  const processProfileData = (profileData: any) => {
    // Converter dados do banco para o formato da interface
    const formattedProfile: EstablishmentProfile = {
      name: profileData.establishment || profileData.name || defaultProfile.name,
      address: {
        street: profileData.address_street || defaultProfile.address.street,
        number: profileData.address_number || defaultProfile.address.number,
        complement: profileData.address_complement || defaultProfile.address.complement,
        neighborhood: profileData.address_neighborhood || defaultProfile.address.neighborhood,
        city: profileData.address_city || defaultProfile.address.city,
        state: profileData.address_state || defaultProfile.address.state,
        zipCode: profileData.address_cep || defaultProfile.address.zipCode
      },
      whatsapp: profileData.whatsapp || defaultProfile.whatsapp,
      email: profileData.email || defaultProfile.email,
      instagram: profileData.instagram || defaultProfile.instagram,
      facebook: profileData.facebook || defaultProfile.facebook,
      tiktok: profileData.tiktok || defaultProfile.tiktok,
      logo: profileData.logo_url || defaultProfile.logo,
      description: profileData.description || defaultProfile.description,
      customUrl: profileData.custom_url || defaultProfile.customUrl,
      primaryColor: profileData.primary_color || defaultProfile.primaryColor,
      workingHours: profileData.working_hours || defaultProfile.workingHours
    };
    
    setProfile(formattedProfile);
    
    // Definir o preview da logo se existir
    if (profileData.logo_url) {
      setLogoPreview(profileData.logo_url);
    }
    
    // Buscar os dispositivos conectados
    fetchDevices();
  };

  // Buscar os dados do perfil do usuário logado
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        
        // Verificar o usuário logado
        const { data: authData, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error("Erro ao obter usuário autenticado:", authError);
          toast({
            title: "Erro de autenticação",
            description: authError.message || "Não foi possível verificar sua identidade.",
            variant: "destructive"
          });
          return;
        }
        
        if (!authData || !authData.user) {
          console.error("Usuário não encontrado ou não autenticado");
          toast({
            title: "Erro ao carregar perfil",
            description: "Você precisa estar logado para acessar esta página.",
            variant: "destructive"
          });
          return;
        }
        
        const userId = authData.user.id;
        console.log("ID do usuário autenticado:", userId);
        
        // Buscar os dados do perfil com mais detalhes de erro
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (profileError) {
          console.error("Erro detalhado ao buscar perfil:", profileError);
          console.error("Código:", profileError.code);
          console.error("Mensagem:", profileError.message);
          console.error("Detalhes:", profileError.details);
          
          // Tentar verificar se o perfil existe
          const { count, error: countError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('id', userId);
            
          if (countError) {
            console.error("Erro ao verificar existência do perfil:", countError);
          } else {
            console.log("Perfil encontrado na contagem:", count);
          }
          
          toast({
            title: "Erro ao carregar perfil",
            description: `Erro: ${profileError.message}. Por favor, contate o suporte.`,
            variant: "destructive"
          });
          
          // Se o perfil não existir, tentar criar um novo
          if (profileError.code === "PGRST116") {
            console.log("Perfil não encontrado, tentando criar um novo...");
            
            const newProfile = {
              id: userId,
              name: authData.user.user_metadata?.name || "Meu Estabelecimento",
              email: authData.user.email,
              role: "user",
              created_at: new Date().toISOString()
            };
            
            const { error: insertError } = await supabase
              .from('profiles')
              .insert(newProfile);
              
            if (insertError) {
              console.error("Erro ao criar perfil:", insertError);
            } else {
              console.log("Novo perfil criado com sucesso");
              // Tentar buscar novamente após criar
              const { data: newProfileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
                
              if (newProfileData) {
                console.log("Perfil recém-criado carregado com sucesso");
                processProfileData(newProfileData);
              }
            }
          }
        }
        
        if (profileData) {
          console.log("Dados do perfil carregados:", profileData);
          processProfileData(profileData);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do perfil:", error);
        toast({
          title: "Erro ao carregar perfil",
          description: "Ocorreu um erro ao buscar os dados do seu estabelecimento.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileData();
  }, [toast]);

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

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatWhatsApp(e.target.value);
    setProfile({ ...profile, whatsapp: formatted });
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.match('image.*')) {
        toast({
          variant: "destructive",
          title: "Tipo de arquivo inválido",
          description: "Por favor, selecione uma imagem (JPG, PNG, GIF)."
        });
        return;
      }

      try {
        setIsLoading(true);
        
        // Preview da imagem
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        
        // Obter o usuário atual
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast({
            title: "Erro ao enviar logo",
            description: "Você precisa estar logado para realizar esta ação.",
            variant: "destructive"
          });
          return;
        }
        
        // Criar um nome único para o arquivo
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}_${Date.now()}.${fileExt}`;
        const filePath = `logos/${fileName}`;
        
        // Upload da imagem para o Storage
        const { error: uploadError } = await supabase.storage
          .from('logos')
          .upload(filePath, file, {
            upsert: true
          });
          
        if (uploadError) {
          throw new Error(`Erro ao fazer upload da logo: ${uploadError.message}`);
        }
        
        // Obter a URL pública da imagem
        const { data: urlData } = await supabase.storage
          .from('logos')
          .getPublicUrl(filePath);
          
        const logoUrl = urlData.publicUrl;
        
        // Atualizar o estado do perfil e o preview
        setProfile({
          ...profile,
          logo: logoUrl
        });
        
        // Atualizar o campo logo_url no banco de dados
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ logo_url: logoUrl })
          .eq('id', user.id);
          
        if (updateError) {
          throw updateError;
        }
        
        toast({
          title: "Logo atualizada com sucesso!",
          description: "A logo do seu estabelecimento foi atualizada.",
          variant: "success"
        });
      } catch (error) {
        console.error("Erro ao fazer upload da logo:", error);
        toast({
          variant: "destructive",
          title: "Erro ao fazer upload",
          description: error.message || "Ocorreu um erro ao enviar a logo. Tente novamente."
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // Obter o usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro ao salvar perfil",
          description: "Você precisa estar logado para realizar esta ação.",
          variant: "destructive"
        });
        return;
      }
      
      // Preparar os dados para salvar no banco (incluindo redes sociais e horários)
      const profileUpdate = {
        name: profile.name,
        establishment: profile.name,
        address_street: profile.address.street,
        address_number: profile.address.number,
        address_complement: profile.address.complement,
        address_neighborhood: profile.address.neighborhood,
        address_city: profile.address.city,
        address_state: profile.address.state,
        address_cep: profile.address.zipCode,
        whatsapp: profile.whatsapp,
        email: profile.email,
        // Redes sociais
        instagram: profile.instagram,
        facebook: profile.facebook,
        tiktok: profile.tiktok,
        description: profile.description,
        // Horários de funcionamento
        working_hours: profile.workingHours
      };
      
      console.log("Dados a serem salvos:", profileUpdate);
      
      // Atualizar o perfil no banco
      const { error } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', user.id);
        
      if (error) {
        console.error("Erro retornado pelo Supabase:", error);
        throw error;
      }
      
      toast({
        title: "Perfil salvo com sucesso!",
        description: "As informações do seu estabelecimento foram atualizadas.",
        variant: "success"
      });
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      toast({
        title: "Erro ao salvar perfil",
        description: "Ocorreu um erro ao salvar os dados do seu estabelecimento.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addWorkingHour = () => {
    const newWorkingHour = {
      dayOfWeek: "Domingo",
      openTime: "09:00",
      closeTime: "18:00",
      hasBreak: false,
      breakStart: "",
      breakEnd: ""
    };
    setProfile({
      ...profile,
      workingHours: [...profile.workingHours, newWorkingHour]
    });
  };

  const removeWorkingHour = (index: number) => {
    const updatedHours = [...profile.workingHours];
    updatedHours.splice(index, 1);
    setProfile({
      ...profile,
      workingHours: updatedHours
    });
  };

  const updateWorkingHour = (index: number, field: string, value: string | boolean) => {
    const updatedHours = [...profile.workingHours];
    updatedHours[index] = {
      ...updatedHours[index],
      [field]: value
    };
    setProfile({
      ...profile,
      workingHours: updatedHours
    });
  };

  const copyBookingLink = () => {
    const link = `https://pulse-salon.com.br/${profile.customUrl}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copiado!",
      description: "O link de agendamento foi copiado para a área de transferência.",
    });
  };

  const openWhatsApp = () => {
    window.open(`https://wa.me/${profile.whatsapp.replace(/\D/g, '')}`, '_blank');
  };

  const handleAddressChange = (field: keyof EstablishmentProfile['address'], value: string) => {
    setProfile({
      ...profile,
      address: {
        ...profile.address,
        [field]: value
      }
    });
  };

  const getFullAddress = () => {
    const { street, number, complement, neighborhood, city, state, zipCode } = profile.address;
    return `${street}, ${number}${complement ? `, ${complement}` : ''} - ${neighborhood} - ${city}/${state} - CEP: ${zipCode}`;
  };

  // Função para alterar a senha
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "A nova senha e a confirmação devem ser iguais.",
        variant: "destructive"
      });
      return;
    }
    
    if (newPassword.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsChangingPassword(true);
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast({
        title: "Senha alterada com sucesso!",
        description: "Sua senha foi atualizada com segurança.",
        variant: "success"
      });
      
      // Limpar campos após alteração bem-sucedida
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      toast({
        title: "Erro ao alterar senha",
        description: error.message || "Ocorreu um erro ao alterar sua senha.",
        variant: "destructive"
      });
    } finally {
      setIsChangingPassword(false);
    }
  };
  
  // Função para buscar os dispositivos conectados
  const fetchDevices = async () => {
    try {
      setIsLoadingDevices(true);
      
      // Obter o usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("Usuário não encontrado");
        return;
      }
      
      // Tentar buscar histórico de dispositivos da tabela profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('devices')
        .eq('id', user.id)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.error("Erro ao buscar histórico de dispositivos:", profileError);
      }
      
      // Na versão atual do Supabase, não existe uma API específica para listar sessões/dispositivos
      // Então vamos simular com dados do navegador atual e armazenar na tabela profiles
      const userAgent = navigator.userAgent;
      const deviceInfo = getDeviceInfo(userAgent);
      
      // Estruturar o dispositivo atual
      const currentDevice = {
        id: crypto.randomUUID(),
        type: deviceInfo.type,
        name: deviceInfo.name,
        os: deviceInfo.os,
        browser: deviceInfo.browser,
        lastActive: new Date().toISOString()
      };
      
      // Verificar se já temos dispositivos armazenados
      let devicesList = [];
      if (profileData && profileData.devices && Array.isArray(profileData.devices)) {
        devicesList = profileData.devices;
        
        // Verificar se o dispositivo atual já está na lista
        const existingDeviceIndex = devicesList.findIndex(device => 
          device.browser === currentDevice.browser && 
          device.os === currentDevice.os && 
          device.type === currentDevice.type
        );
        
        if (existingDeviceIndex >= 0) {
          // Atualizar último acesso
          devicesList[existingDeviceIndex].lastActive = currentDevice.lastActive;
        } else {
          // Adicionar novo dispositivo à lista
          devicesList.push(currentDevice);
        }
      } else {
        // Primeira vez, criar lista com dispositivo atual
        devicesList = [currentDevice];
      }
      
      // Atualizar a tabela profiles com a lista de dispositivos
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ devices: devicesList })
        .eq('id', user.id);
      
      if (updateError) {
        console.error("Erro ao atualizar lista de dispositivos:", updateError);
      }
      
      setDevices(devicesList);
    } catch (error) {
      console.error("Erro ao buscar dispositivos:", error);
    } finally {
      setIsLoadingDevices(false);
    }
  };
  
  // Função para identificar informações do dispositivo a partir do user agent
  const getDeviceInfo = (userAgent) => {
    let deviceType = "desktop";
    let deviceName = "Computador";
    let deviceOS = "Desconhecido";
    let deviceBrowser = "Navegador";
    
    // Detectar o dispositivo
    if (/iPad/i.test(userAgent)) {
      deviceType = "tablet";
      deviceName = "iPad";
      deviceOS = "iOS";
    } else if (/iPhone/i.test(userAgent)) {
      deviceType = "mobile";
      deviceName = "iPhone";
      deviceOS = "iOS";
    } else if (/Android/i.test(userAgent)) {
      if (/Tablet|SM-T|Tab/i.test(userAgent)) {
        deviceType = "tablet";
        deviceName = "Tablet Android";
      } else {
        deviceType = "mobile";
        deviceName = "Smartphone Android";
      }
      deviceOS = "Android";
    } else if (/Windows Phone/i.test(userAgent)) {
      deviceType = "mobile";
      deviceName = "Windows Phone";
      deviceOS = "Windows Mobile";
    } else if (/Mac OS X/i.test(userAgent)) {
      if (/iPad|iPhone|iPod/.test(userAgent)) {
        deviceType = "mobile";
        deviceName = "Dispositivo iOS";
        deviceOS = "iOS";
      } else {
        deviceType = "desktop";
        deviceName = "MacBook";
        deviceOS = "macOS";
      }
    } else if (/Windows/i.test(userAgent)) {
      deviceType = "desktop";
      deviceName = "PC Windows";
      deviceOS = "Windows";
    } else if (/Linux/i.test(userAgent)) {
      deviceType = "desktop";
      deviceName = "Linux";
      deviceOS = "Linux";
    }
    
    // Detectar o navegador
    if (/Chrome/i.test(userAgent) && !/Chromium|OPR|Edge|Edg/i.test(userAgent)) {
      deviceBrowser = "Chrome";
    } else if (/Firefox/i.test(userAgent)) {
      deviceBrowser = "Firefox";
    } else if (/Safari/i.test(userAgent) && !/Chrome|Chromium|OPR|Edge|Edg/i.test(userAgent)) {
      deviceBrowser = "Safari";
    } else if (/MSIE|Trident/i.test(userAgent)) {
      deviceBrowser = "Internet Explorer";
    } else if (/Edge|Edg/i.test(userAgent)) {
      deviceBrowser = "Microsoft Edge";
    } else if (/OPR/i.test(userAgent)) {
      deviceBrowser = "Opera";
    }
    
    return {
      type: deviceType,
      name: deviceName,
      os: deviceOS,
      browser: deviceBrowser
    };
  };

  // Função para desconectar todos os dispositivos
  const handleLogoutAllDevices = async () => {
    try {
      setIsLoadingDevices(true);
      
      // Obter o usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro ao desconectar dispositivos",
          description: "Usuário não encontrado",
          variant: "destructive"
        });
        return;
      }
      
      // Apagar a lista de dispositivos na tabela profiles
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ devices: [] })
        .eq('id', user.id);
      
      if (updateError) {
        console.error("Erro ao limpar lista de dispositivos:", updateError);
      }
      
      // Fazer logout global com o Supabase
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) throw error;
      
      toast({
        title: "Todos os dispositivos foram desconectados",
        description: "Você precisará fazer login novamente.",
        variant: "success"
      });
      
      // Redirecionar para a página de login após alguns segundos
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error) {
      console.error("Erro ao desconectar dispositivos:", error);
      toast({
        title: "Erro ao desconectar dispositivos",
        description: error.message || "Ocorreu um erro ao tentar desconectar todos os dispositivos.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingDevices(false);
    }
  };

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
            className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
          >
            Salvar Alterações
          </Button>
        }
      />

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-100 p-1 rounded-lg">
          <TabsTrigger 
            value="profile" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            Perfil
          </TabsTrigger>
          <TabsTrigger 
            value="booking" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-700 data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            Agenda Online
          </TabsTrigger>
          <TabsTrigger 
            value="hours" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-indigo-700 data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            Horário de Funcionamento
          </TabsTrigger>
          <TabsTrigger 
            value="whatsapp" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-700 data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            WhatsApp
          </TabsTrigger>
          <TabsTrigger 
            value="payments" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-emerald-700 data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            Pagamentos
          </TabsTrigger>
          <TabsTrigger 
            value="security" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-600 data-[state=active]:to-rose-700 data-[state=active]:text-white data-[state=active]:shadow-md"
            onClick={() => {
              if (devices.length === 0) {
                fetchDevices();
              }
            }}
          >
            Segurança
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <ProfileForm 
            profile={profile}
            logoPreview={logoPreview}
            isLoading={isLoading}
            fileInputRef={fileInputRef}
            handleLogoUpload={handleLogoUpload}
            handleWhatsAppChange={handleWhatsAppChange}
            handleAddressChange={handleAddressChange}
            handleSave={handleSave}
            handleChange={(field, value) => {
              setProfile(prev => ({
                ...prev,
                [field]: value
              }));
            }}
          />
        </TabsContent>

        <TabsContent value="booking" className="space-y-4">
          <BookingSection
            profile={profile}
            copyBookingLink={copyBookingLink}
            openWhatsApp={openWhatsApp}
          />
        </TabsContent>

        <TabsContent value="hours" className="space-y-4">
          <WorkingHoursSection 
            workingHours={profile.workingHours} 
            addWorkingHour={addWorkingHour} 
            removeWorkingHour={removeWorkingHour} 
            updateWorkingHour={updateWorkingHour} 
          />
        </TabsContent>

        <TabsContent value="whatsapp" className="space-y-4">
          <WhatsAppSection />
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <PaymentsSection />
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <SecuritySection 
            newPassword={newPassword} 
            confirmPassword={confirmPassword} 
            setNewPassword={setNewPassword} 
            setConfirmPassword={setConfirmPassword} 
            isChangingPassword={isChangingPassword} 
            handleChangePassword={handleChangePassword} 
            isLoadingDevices={isLoadingDevices} 
            devices={devices} 
            handleLogoutAllDevices={handleLogoutAllDevices} 
          />
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}