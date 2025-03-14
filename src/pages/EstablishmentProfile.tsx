import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { MapPin, Phone, Mail, Instagram, Facebook, MessageSquare, Upload, Copy, QrCode, Eye, MessageCircle } from "lucide-react";

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
  primaryColor: "#dc8c95"
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral">Perfil do Estabelecimento</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie as informações e a identidade visual do seu salão
        </p>
      </div>

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="branding">Identidade Visual</TabsTrigger>
          <TabsTrigger value="booking">Link de Agendamento</TabsTrigger>
          <TabsTrigger value="social">Redes Sociais</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Estabelecimento</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Nome do seu salão"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Endereço
                  </div>
                </Label>
                <Input
                  id="address"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  placeholder="Endereço completo"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      WhatsApp
                    </div>
                  </Label>
                  <Input
                    id="whatsapp"
                    value={profile.whatsapp}
                    onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })}
                    placeholder="+55 11 99999-9999"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      E-mail
                    </div>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    placeholder="contato@seusalao.com.br"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição do Estabelecimento</Label>
                <Textarea
                  id="description"
                  value={profile.description}
                  onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                  placeholder="Descreva seu estabelecimento..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Identidade Visual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <Label>Logo do Estabelecimento</Label>
                <div className="flex items-center gap-4">
                  {logoPreview && (
                    <div className="h-24 w-24 rounded-lg border overflow-hidden">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <Button variant="outline" className="gap-2" onClick={() => document.getElementById('logo-upload')?.click()}>
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
                <Label htmlFor="primary-color">Cor Principal</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="primary-color"
                    type="color"
                    value={profile.primaryColor}
                    onChange={(e) => setProfile({ ...profile, primaryColor: e.target.value })}
                    className="w-20 h-10 p-1"
                  />
                  <span className="text-sm text-muted-foreground">
                    {profile.primaryColor}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="booking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Link de Agendamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="custom-url">URL Personalizada</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">pulse-salon.com.br/</span>
                  <Input
                    id="custom-url"
                    value={profile.customUrl}
                    onChange={(e) => setProfile({ ...profile, customUrl: e.target.value })}
                    placeholder="meu-salao"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="gap-2" onClick={copyBookingLink}>
                  <Copy className="h-4 w-4" />
                  Copiar Link
                </Button>
                <Button variant="outline" className="gap-2">
                  <QrCode className="h-4 w-4" />
                  Gerar QR Code
                </Button>
                <Button variant="outline" className="gap-2">
                  <Eye className="h-4 w-4" />
                  Visualizar Página
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Redes Sociais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="instagram">
                    <div className="flex items-center gap-2">
                      <Instagram className="h-4 w-4" />
                      Instagram
                    </div>
                  </Label>
                  <Input
                    id="instagram"
                    value={profile.instagram}
                    onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                    placeholder="@seusalao"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facebook">
                    <div className="flex items-center gap-2">
                      <Facebook className="h-4 w-4" />
                      Facebook
                    </div>
                  </Label>
                  <Input
                    id="facebook"
                    value={profile.facebook}
                    onChange={(e) => setProfile({ ...profile, facebook: e.target.value })}
                    placeholder="/seusalao"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tiktok">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      TikTok
                    </div>
                  </Label>
                  <Input
                    id="tiktok"
                    value={profile.tiktok}
                    onChange={(e) => setProfile({ ...profile, tiktok: e.target.value })}
                    placeholder="@seusalao"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="gap-2" onClick={openWhatsApp}>
                  <MessageCircle className="h-4 w-4" />
                  Abrir WhatsApp
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => window.open(`https://instagram.com/${profile.instagram}`, '_blank')}
                >
                  <Instagram className="h-4 w-4" />
                  Acessar Instagram
                </Button>
                <Button
                  variant="outline"
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

      <div className="flex justify-end gap-2">
        <Button onClick={handleSave}>Salvar Alterações</Button>
      </div>
    </div>
  );
}