import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { MapPin, Phone, Mail, Instagram, Facebook, MessageSquare, Upload, Copy, QrCode, Eye, MessageCircle } from "lucide-react";
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";

interface EstablishmentProfile {
  name: string;
  address: string;
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
  address: "Rua Exemplo, 123 - São Paulo, SP",
  whatsapp: "+5511999999999",
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
  const { toast } = useToast();

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        setProfile({ ...profile, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // Here would be the API call to save the profile
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
            value="booking" 
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Link de Agendamento
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

              <div className="space-y-2">
                <Label htmlFor="address" className="text-blue-700">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    Endereço
                  </div>
                </Label>
                <Input
                  id="address"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  placeholder="Endereço completo"
                  className="border-blue-200 focus:border-blue-400"
                />
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
                    onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })}
                    placeholder="+55 11 99999-9999"
                    className="border-blue-200 focus:border-blue-400"
                  />
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
                <div className="flex items-center gap-4">
                  {logoPreview && (
                    <div className="h-24 w-24 rounded-lg border border-blue-200 overflow-hidden">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <Button variant="dashboard-outline" className="gap-2" onClick={() => document.getElementById('logo-upload')?.click()}>
                    <Upload className="h-4 w-4" />
                    Upload Logo
                  </Button>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
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

        <TabsContent value="booking" className="space-y-4">
          <Card className="border-blue-100">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-100">
              <CardTitle className="text-blue-700">Link de Agendamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="space-y-2">
                <Label htmlFor="custom-url" className="text-blue-700">URL Personalizada</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-blue-600">pulse-salon.com.br/</span>
                  <Input
                    id="custom-url"
                    value={profile.customUrl}
                    onChange={(e) => setProfile({ ...profile, customUrl: e.target.value })}
                    placeholder="meu-salao"
                    className="flex-1 border-blue-200 focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="dashboard-outline" className="gap-2" onClick={copyBookingLink}>
                  <Copy className="h-4 w-4" />
                  Copiar Link
                </Button>
                <Button variant="dashboard-outline" className="gap-2">
                  <QrCode className="h-4 w-4" />
                  Gerar QR Code
                </Button>
                <Button variant="dashboard-outline" className="gap-2">
                  <Eye className="h-4 w-4" />
                  Visualizar Página
                </Button>
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