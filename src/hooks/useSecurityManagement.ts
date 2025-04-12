import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/use-toast";

export const useSecurityManagement = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [devices, setDevices] = useState<any[]>([]);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  const { toast } = useToast();

  // Função para alterar a senha
  const handleChangePassword = async () => {
    try {
      if (newPassword !== confirmPassword) {
        toast({
          title: "Erro",
          description: "As senhas não coincidem.",
          variant: "destructive"
        });
        return;
      }

      if (newPassword.length < 6) {
        toast({
          title: "Erro",
          description: "A senha deve ter pelo menos 6 caracteres.",
          variant: "destructive"
        });
        return;
      }

      setIsChangingPassword(true);

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      // Limpar campos e mostrar mensagem de sucesso
      setNewPassword("");
      setConfirmPassword("");
      toast({
        title: "Senha alterada",
        description: "Sua senha foi atualizada com sucesso."
      });

      // Atualizar a lista de dispositivos após alterar a senha
      await fetchDevices();

    } catch (error: any) {
      console.error("Erro ao alterar senha:", error);
      toast({
        title: "Erro ao alterar senha",
        description: error.message || "Não foi possível alterar a senha.",
        variant: "destructive"
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Função para identificar informações do dispositivo a partir do user agent
  const getDeviceInfo = (userAgent: string) => {
    const ua = userAgent.toLowerCase();

    // Detectar tipo de dispositivo
    let type = 'desktop';
    if (/(android|webos|iphone|ipad|ipod|blackberry|windows phone)/i.test(ua)) {
      type = 'mobile';
      if (/(ipad|tablet|playbook|silk)|(android(?!.*mobile))/i.test(ua)) {
        type = 'tablet';
      }
    }

    // Detectar sistema operacional
    let os = 'Desconhecido';
    if (/(windows)/i.test(ua)) os = 'Windows';
    else if (/(macintosh|mac os x)/i.test(ua)) os = 'macOS';
    else if (/(linux)/i.test(ua)) os = 'Linux';
    else if (/(android)/i.test(ua)) os = 'Android';
    else if (/(iphone|ipad|ipod)/i.test(ua)) os = 'iOS';

    // Detectar navegador
    let browser = 'Desconhecido';
    if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('edg')) browser = 'Edge';
    else if (ua.includes('chrome')) browser = 'Chrome';
    else if (ua.includes('safari')) browser = 'Safari';
    else if (ua.includes('opr') || ua.includes('opera')) browser = 'Opera';

    // Criar nome do dispositivo
    let name = `${os} - ${browser}`;
    if (type === 'mobile') {
      name = `Smartphone ${os}`;
    } else if (type === 'tablet') {
      name = `Tablet ${os}`;
    }

    return {
      type,
      os,
      browser,
      name
    };
  };

  // Função para buscar os dispositivos conectados
  const fetchDevices = async () => {
    try {
      setIsLoadingDevices(true);
      
      // Obter o usuário atual
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData?.user) {
        console.error("Erro ao obter usuário:", userError);
        return;
      }
      
      // Buscar o perfil do usuário
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("devices")
        .eq("id", userData.user.id)
        .single();
      
      if (profileError) {
        console.error("Erro ao buscar dispositivos:", profileError);
        return;
      }
      
      // Se não houver dispositivos, inicializar array vazio
      if (!profileData || !profileData.devices) {
        setDevices([]);
        return;
      }
      
      // Processar dados de dispositivos
      let processedDevices = profileData.devices.map((device: any) => {
        // Extrair informações do user agent
        const deviceInfo = getDeviceInfo(device.userAgent || '');
        
        return {
          ...device,
          ...deviceInfo
        };
      });
      
      // Ordenar por último acesso (mais recente primeiro)
      processedDevices.sort((a: any, b: any) => {
        return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
      });
      
      setDevices(processedDevices);
      
    } catch (error) {
      console.error("Erro ao buscar dispositivos:", error);
      toast({
        title: "Erro ao carregar dispositivos",
        description: "Não foi possível obter a lista de dispositivos conectados.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingDevices(false);
    }
  };

  // Função para desconectar todos os dispositivos
  const handleLogoutAllDevices = async () => {
    try {
      setIsLoadingDevices(true);
      
      // Primeiro, verificamos o usuário atual
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData?.user) {
        throw new Error("Erro ao verificar usuário");
      }
      
      // Atualizar o perfil para remover todos os dispositivos
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ devices: [] })
        .eq("id", userData.user.id);
      
      if (updateError) {
        throw updateError;
      }
      
      // Deslogar de todas as sessões (deixar apenas a atual)
      await supabase.auth.signOut({ scope: 'others' });
      
      // Atualizar a interface
      setDevices([]);
      
      toast({
        title: "Dispositivos desconectados",
        description: "Todos os outros dispositivos foram desconectados com sucesso."
      });
      
    } catch (error: any) {
      console.error("Erro ao desconectar dispositivos:", error);
      toast({
        title: "Erro ao desconectar dispositivos",
        description: error.message || "Não foi possível desconectar os dispositivos.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingDevices(false);
    }
  };

  return {
    newPassword,
    confirmPassword,
    setNewPassword,
    setConfirmPassword,
    isChangingPassword,
    handleChangePassword,
    devices,
    isLoadingDevices,
    fetchDevices,
    handleLogoutAllDevices,
  };
};
