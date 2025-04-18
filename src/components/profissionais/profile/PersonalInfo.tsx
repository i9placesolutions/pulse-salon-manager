import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2 } from "lucide-react";
import { FormCard } from "@/components/shared/FormCard";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/use-toast";

export function PersonalInfo() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    birthDate: "",
    address: "",
    profileImage: ""
  });
  const [userId, setUserId] = useState<string | null>(null);
  const professionalChannelRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfessionalData();

    return () => {
      // Limpar a inscrição ao desmontar o componente
      if (professionalChannelRef.current) {
        supabase.removeChannel(professionalChannelRef.current);
      }
    };
  }, []);

  const setupRealtimeSubscription = (userId: string) => {
    // Inscrever-se para atualizações em tempo real na tabela professionals
    const professionalChannel = supabase
      .channel('professionals-changes')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'professionals',
          filter: `auth_id=eq.${userId}`
        }, 
        (payload) => {
          console.log('Atualização em tempo real recebida:', payload);
          
          // Atualizar os dados quando houver mudanças
          setProfileData({
            name: payload.new.name || "",
            email: payload.new.email || "",
            phone: payload.new.phone || "",
            birthDate: payload.new.hiring_date ? new Date(payload.new.hiring_date).toISOString().split('T')[0] : "",
            address: payload.new.address || "", 
            profileImage: payload.new.profile_image || payload.new.avatar || ""
          });
          
          toast({
            title: "Dados atualizados",
            description: "Seus dados foram atualizados em tempo real",
            variant: "default"
          });
        }
      )
      .subscribe();
    
    // Armazenar a referência para limpeza posterior
    professionalChannelRef.current = professionalChannel;
  };

  const fetchProfessionalData = async () => {
    setIsLoading(true);
    try {
      // Obter ID do usuário autenticado
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Usuário não autenticado");
      
      // Armazenar o ID do usuário para a assinatura realtime
      setUserId(user.id);

      // Buscar dados do profissional pelo auth_id
      const { data: professionalData, error } = await supabase
        .from("professionals")
        .select("*")
        .eq("auth_id", user.id)
        .single();

      if (error) throw error;

      if (professionalData) {
        setProfileData({
          name: professionalData.name || "",
          email: professionalData.email || "",
          phone: professionalData.phone || "",
          birthDate: professionalData.hiring_date ? new Date(professionalData.hiring_date).toISOString().split('T')[0] : "",
          address: professionalData.address || "",
          profileImage: professionalData.profile_image || professionalData.avatar || ""
        });
      }
      
      // Configurar a assinatura realtime após obter os dados
      setupRealtimeSubscription(user.id);
      
    } catch (error) {
      console.error("Erro ao carregar dados do profissional:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar seus dados. Por favor, tente novamente."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      // Verificar se temos o ID do usuário
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");
        setUserId(user.id);
      }

      // Atualizar dados do profissional
      const { error } = await supabase
        .from("professionals")
        .update({
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
          hiring_date: profileData.birthDate ? new Date(profileData.birthDate) : null,
          address: profileData.address
        })
        .eq("auth_id", userId);

      if (error) throw error;

      toast({
        title: "Alterações salvas",
        description: "Seus dados foram atualizados com sucesso.",
        variant: "success"
      });
    } catch (error) {
      console.error("Erro ao salvar alterações:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível salvar suas alterações. Por favor, tente novamente."
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <FormCard 
      title="Informações Pessoais"
      footer={
        <Button onClick={handleSaveChanges} disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          Salvar Alterações
        </Button>
      }
    >
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-8">
        <div className="flex flex-col items-center gap-2 mb-4 sm:mb-0">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profileData.profileImage || "/placeholder.svg"} />
            <AvatarFallback>{profileData.name ? profileData.name.charAt(0) : "P"}</AvatarFallback>
          </Avatar>
          <Button variant="outline" size="sm">
            <Camera className="h-4 w-4 mr-2" />
            Alterar Foto
          </Button>
        </div>
        
        <div className="grid gap-4 w-full">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input 
                id="name" 
                placeholder="Seu nome" 
                value={profileData.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="seu@email.com" 
                value={profileData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input 
                id="phone" 
                placeholder="(00) 00000-0000" 
                value={profileData.phone}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthDate">Data de Nascimento</Label>
              <Input 
                id="birthDate" 
                type="date" 
                value={profileData.birthDate}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Endereço</Label>
              <Input 
                id="address" 
                placeholder="Seu endereço completo" 
                value={profileData.address}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
      </div>
    </FormCard>
  );
}
