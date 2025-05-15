import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Mail, Instagram, Facebook, MessageCircle, Upload, Building, Building2, MapPinned } from "lucide-react";

interface ProfileFormProps {
  profile: any;
  logoPreview: string;
  isLoading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleLogoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleWhatsAppChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddressChange: (field: string, value: string) => void;
  handleSave: () => void;
  handleChange: (field: string, value: string) => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  profile,
  logoPreview,
  isLoading,
  fileInputRef,
  handleLogoUpload,
  handleWhatsAppChange,
  handleAddressChange,
  handleSave,
  handleChange
}) => {
  return (
    <>
      {/* Logo e Informações Básicas */}
      <Card className="mb-6 border-blue-200 shadow-md overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-blue-400 to-blue-600"></div>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <div className="mb-3">
                <Label htmlFor="logo" className="text-blue-700 font-medium">Logo do Estabelecimento</Label>
              </div>
              <div 
                className="w-32 h-32 border-2 border-dashed border-blue-300 rounded-lg flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-colors relative cursor-pointer overflow-hidden shadow-inner"
                onClick={() => fileInputRef.current?.click()}
              >
                {logoPreview ? (
                  <img 
                    src={logoPreview} 
                    alt="Logo Preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-blue-500 p-4">
                    <Upload className="mb-2 h-6 w-6" />
                    <span className="text-xs text-center">Clique para enviar</span>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  id="logo"
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>
            
            <div className="flex-grow grid gap-4">
              <div>
                <Label htmlFor="name">Nome do Estabelecimento</Label>
                <div className="relative">
                  <Input 
                    id="name"
                    placeholder="Nome do seu estabelecimento"
                    value={profile.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="pl-10"
                  />
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea 
                  id="description"
                  placeholder="Uma breve descrição sobre seu estabelecimento"
                  value={profile.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Endereço */}
      <Card className="mb-6 border-indigo-200 shadow-md overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-indigo-400 to-indigo-600"></div>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4 flex items-center text-indigo-700">
            <MapPin className="mr-2 h-5 w-5 text-indigo-600" />
            Endereço
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1">
              <Label htmlFor="street">Rua</Label>
              <div className="relative">
                <Input 
                  id="street"
                  placeholder="Nome da rua"
                  value={profile.address.street}
                  onChange={(e) => handleAddressChange('street', e.target.value)}
                  className="pl-10"
                />
                <MapPinned className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="number">Número</Label>
                <Input 
                  id="number"
                  placeholder="Número"
                  value={profile.address.number}
                  onChange={(e) => handleAddressChange('number', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="complement">Complemento</Label>
                <Input 
                  id="complement"
                  placeholder="Sala, Andar, etc."
                  value={profile.address.complement || ''}
                  onChange={(e) => handleAddressChange('complement', e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input 
                id="neighborhood"
                placeholder="Bairro"
                value={profile.address.neighborhood}
                onChange={(e) => handleAddressChange('neighborhood', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="zipCode">CEP</Label>
              <Input 
                id="zipCode"
                placeholder="00000-000"
                value={profile.address.zipCode}
                onChange={(e) => handleAddressChange('zipCode', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="city">Cidade</Label>
              <Input 
                id="city"
                placeholder="Cidade"
                value={profile.address.city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="state">Estado</Label>
              <Input 
                id="state"
                placeholder="Estado"
                value={profile.address.state}
                onChange={(e) => handleAddressChange('state', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Contato */}
      <Card className="mb-6 border-emerald-200 shadow-md overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4 flex items-center text-emerald-700">
            <Phone className="mr-2 h-5 w-5 text-emerald-600" />
            Contato
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <div className="relative">
                <Input 
                  id="whatsapp"
                  placeholder="(00) 00000-0000"
                  value={profile.whatsapp}
                  onChange={handleWhatsAppChange}
                  className="pl-10"
                />
                <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
              </div>
              <p className="text-xs text-emerald-600 mt-1">
                Utilizado para contato e para os clientes enviarem mensagem diretamente.
              </p>
            </div>
            
            <div>
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Input 
                  id="email"
                  placeholder="contato@exemplo.com.br"
                  value={profile.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="pl-10"
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
              </div>
            </div>
            
            <div>
              <Label htmlFor="instagram">Instagram</Label>
              <div className="relative">
                <Input 
                  id="instagram"
                  placeholder="@seu_instagram"
                  value={profile.instagram}
                  onChange={(e) => handleChange('instagram', e.target.value)}
                  className="pl-10"
                />
                <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-pink-500" />
              </div>
            </div>
            
            <div>
              <Label htmlFor="facebook">Facebook</Label>
              <div className="relative">
                <Input 
                  id="facebook"
                  placeholder="@sua_pagina"
                  value={profile.facebook}
                  onChange={(e) => handleChange('facebook', e.target.value)}
                  className="pl-10"
                />
                <Facebook className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-600" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={isLoading}
          className="px-6 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
        >
          {isLoading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </>
  );
};
