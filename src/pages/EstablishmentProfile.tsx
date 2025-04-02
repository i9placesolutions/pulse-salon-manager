import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { MapPin, Phone, Mail, Instagram, Facebook, MessageSquare, Upload, Copy, QrCode, Eye, MessageCircle, Building, Building2, MapPinned } from "lucide-react";
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";

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
  primaryColor: "#1e40af"
};

export default function EstablishmentProfile() {
  const [profile, setProfile] = useState<EstablishmentProfile>(defaultProfile);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.match('image.*')) {
        toast({
          title: "Tipo de arquivo inválido",
          description: "Por favor, selecione apenas imagens.",
          variant: "destructive"
        });
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O tamanho máximo permitido é 2MB.",
          variant: "destructive"
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        setProfile({ ...profile, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    toast({
      title: "Perfil atualizado",
      description: "As informações do estabelecimento foram atualizadas com sucesso!",
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

  return (
    <PageLayout variant="blue">
      <PageHeader 
        title="Perfil do Estabelecimento" 
        subtitle="Gerencie as informações e a identidade visual do seu salão"
        variant="blue"
        badge="Identificação"
        action={
          <Button onClick={handleSave} variant="dashboard">Salvar Alterações</Button>
        }
      />

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

                <div className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-100">
                  <div className="flex items-center">
                    <MapPinned className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm text-blue-700 font-medium">Endereço Completo:</span>
                  </div>
                  <p className="text-sm mt-1 pl-6 text-blue-600">{getFullAddress()}</p>
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
                    onClick={() => fileInputRef.current?.click()}
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
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="h-3.5 w-3.5 mr-2" />
                      Selecionar arquivo
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="primary-color" className="text-blue-700">Cor Principal</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="primary-color"
                    type="color"
                    value={profile.primaryColor}
                    onChange={(e) => setProfile({ ...profile, primaryColor: e.target.value })}
                    className="w-20 h-10 p-1 border-blue-200"
                  />
                  <span className="text-sm text-blue-600">
                    {profile.primaryColor}
                  </span>
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