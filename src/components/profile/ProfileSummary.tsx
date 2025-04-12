import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Building2, MapPin, Phone, Mail } from "lucide-react";

interface ProfileData {
  id: string;
  name: string;
  establishment: string;
  cnpj: string;
  whatsapp: string;
  email: string;
  logo_url: string;
  address_street: string;
  address_number: string;
  address_complement: string;
  address_neighborhood: string;
  address_city: string;
  address_state: string;
  address_cep: string;
}

export function ProfileSummary() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        
        // Obter o usuário atual
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast({
            title: "Erro ao carregar perfil",
            description: "Você precisa estar logado para visualizar estas informações.",
            variant: "destructive"
          });
          return;
        }
        
        // Buscar os dados do perfil
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) {
          throw error;
        }
        
        setProfile(data);
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

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-32 text-gray-500">
            Nenhuma informação de perfil encontrada.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl text-blue-700">Dados do Estabelecimento</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Logo do estabelecimento */}
          <div className="flex-shrink-0">
            {profile.logo_url ? (
              <img 
                src={profile.logo_url} 
                alt={profile.establishment || profile.name} 
                className="w-24 h-24 object-cover rounded-md"
              />
            ) : (
              <div className="w-24 h-24 bg-blue-100 rounded-md flex items-center justify-center">
                <Building2 className="w-12 h-12 text-blue-400" />
              </div>
            )}
          </div>
          
          {/* Informações do estabelecimento */}
          <div className="flex-grow space-y-3">
            <h3 className="text-lg font-semibold text-blue-800">
              {profile.establishment || profile.name || "Meu Estabelecimento"}
            </h3>
            
            {profile.cnpj && (
              <p className="text-sm text-gray-600">
                CNPJ: {profile.cnpj}
              </p>
            )}
            
            {/* Endereço */}
            {(profile.address_street || profile.address_city) && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-600 mt-0.5" />
                <span className="text-sm text-gray-700">
                  {[
                    profile.address_street,
                    profile.address_number && `Nº ${profile.address_number}`,
                    profile.address_complement,
                    profile.address_neighborhood,
                    profile.address_city && profile.address_state && 
                      `${profile.address_city}, ${profile.address_state}`,
                    profile.address_cep
                  ].filter(Boolean).join(', ')}
                </span>
              </div>
            )}
            
            {/* Contatos */}
            {profile.whatsapp && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-700">{profile.whatsapp}</span>
              </div>
            )}
            
            {profile.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-700">{profile.email}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
