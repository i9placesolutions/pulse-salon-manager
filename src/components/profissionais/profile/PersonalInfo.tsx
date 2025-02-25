
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";

export function ProfessionalInfo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações Pessoais</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center gap-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback>JP</AvatarFallback>
          </Avatar>
          <Button variant="outline" size="sm">
            <Camera className="h-4 w-4 mr-2" />
            Alterar Foto
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input id="name" placeholder="Seu nome completo" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="specialty">Especialidade</Label>
            <Input id="specialty" placeholder="Ex: Cabeleireiro, Barbeiro" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" placeholder="seu@email.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" placeholder="(00) 00000-0000" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="birthDate">Data de Nascimento</Label>
            <Input id="birthDate" type="date" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hiringDate">Data de Contratação</Label>
            <Input id="hiringDate" type="date" readOnly />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Biografia Profissional</Label>
          <textarea 
            id="bio" 
            className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            placeholder="Conte um pouco sobre sua experiência profissional..."
          />
        </div>

        <Button>Salvar Alterações</Button>
      </CardContent>
    </Card>
  );
}
