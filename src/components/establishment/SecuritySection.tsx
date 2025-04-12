import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Key, 
  Lock, 
  Smartphone, 
  Tablet, 
  Laptop, 
  LogOut, 
  AlertTriangle,
  ShieldCheck,
  CheckCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

interface SecuritySectionProps {
  newPassword: string;
  confirmPassword: string;
  setNewPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  isChangingPassword: boolean;
  handleChangePassword: () => void;
  isLoadingDevices: boolean;
  devices: any[];
  handleLogoutAllDevices: () => void;
}

export const SecuritySection: React.FC<SecuritySectionProps> = ({
  newPassword,
  confirmPassword,
  setNewPassword,
  setConfirmPassword,
  isChangingPassword,
  handleChangePassword,
  isLoadingDevices,
  devices,
  handleLogoutAllDevices
}) => {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Verificação de força da senha
  const calculatePasswordStrength = (password: string): number => {
    if (!password) return 0;
    
    let strength = 0;
    // Comprimento
    if (password.length >= 8) strength += 25;
    // Números
    if (/\d/.test(password)) strength += 25;
    // Letras maiúsculas e minúsculas
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    // Caracteres especiais
    if (/[^a-zA-Z0-9]/.test(password)) strength += 25;
    
    return strength;
  };

  const passwordStrength = calculatePasswordStrength(newPassword);
  
  const getStrengthLabel = (strength: number) => {
    if (strength === 0) return { label: "Nenhuma", color: "gray" };
    if (strength <= 25) return { label: "Fraca", color: "red" };
    if (strength <= 50) return { label: "Moderada", color: "orange" };
    if (strength <= 75) return { label: "Boa", color: "yellow" };
    return { label: "Forte", color: "green" };
  };
  
  const strengthInfo = getStrengthLabel(passwordStrength);
  const passwordsMatch = newPassword === confirmPassword;

  return (
    <>
      <Card className="mb-6 border-indigo-200 shadow-md overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-purple-400 to-purple-600"></div>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4 flex items-center text-purple-700">
            <Key className="mr-2 h-5 w-5 text-purple-600" />
            Alterar Senha
          </h3>
          
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-100 mb-4">
            <div className="flex items-start gap-3">
              <div className="bg-purple-100 p-1.5 rounded-full mt-0.5">
                <ShieldCheck className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-purple-700 mb-1">Recomendações de segurança</h4>
                <ul className="text-xs text-purple-700 space-y-1 pl-5 list-disc">
                  <li>Use pelo menos 8 caracteres</li>
                  <li>Combine letras maiúsculas e minúsculas</li>
                  <li>Inclua números e símbolos</li>
                  <li>Evite informações pessoais facilmente identificáveis</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label htmlFor="newPassword" className="text-purple-700 mb-1.5 block">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite a nova senha"
                  className="border-purple-200 focus:ring-purple-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-purple-600"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              {newPassword && (
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium" style={{ color: `var(--${strengthInfo.color}-600)` }}>
                      Força: {strengthInfo.label}
                    </span>
                    <span className="text-xs text-purple-600">{passwordStrength}%</span>
                  </div>
                  <Progress value={passwordStrength} max={100} className="h-1.5" 
                    style={{ 
                      backgroundColor: 'var(--purple-100)',
                      '--progress-color': `var(--${strengthInfo.color}-500)`
                    } as React.CSSProperties}
                  />
                </div>
              )}
            </div>
            
            <div>
              <Label htmlFor="confirmPassword" className="text-purple-700 mb-1.5 block">Confirmar Senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme a nova senha"
                  className={`border-purple-200 focus:ring-purple-500 pr-10 ${
                    confirmPassword && !passwordsMatch ? 'border-red-300 focus:ring-red-500' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-purple-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              {confirmPassword && (
                <div className="mt-1">
                  {passwordsMatch ? (
                    <div className="flex items-center text-green-600 gap-1 text-xs mt-1">
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>As senhas coincidem</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600 gap-1 text-xs mt-1">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>As senhas não coincidem</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <Button
              onClick={handleChangePassword}
              disabled={isChangingPassword || !newPassword || !passwordsMatch}
              className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white shadow-sm hover:shadow gap-2"
            >
              <Lock className="h-4 w-4" />
              {isChangingPassword ? 'Alterando...' : 'Alterar Senha'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6 border-indigo-200 shadow-md overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-indigo-400 to-purple-600"></div>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4 flex items-center text-indigo-700">
            <Shield className="mr-2 h-5 w-5 text-indigo-600" />
            Dispositivos Conectados
          </h3>
          
          {isLoadingDevices ? (
            <div className="py-10 flex flex-col items-center justify-center space-y-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="text-sm text-indigo-600">Carregando dispositivos...</p>
            </div>
          ) : (
            <div>
              <div className="space-y-3">
                {devices.length === 0 ? (
                  <div className="text-center py-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg flex flex-col items-center">
                    <Shield className="h-12 w-12 text-indigo-300 mb-2" />
                    <p className="text-indigo-700 font-medium">Nenhum dispositivo conectado</p>
                    <p className="text-indigo-600 text-sm mt-1">Seus dispositivos aparecerão aqui quando você fizer login</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-3 rounded-lg mb-2">
                      <p className="text-xs text-indigo-700 flex items-center">
                        <Shield className="mr-1.5 h-3.5 w-3.5" />
                        <span>Total de dispositivos conectados: <strong>{devices.length}</strong></span>
                      </p>
                    </div>
                    
                    {devices.map((device) => (
                      <div key={device.id} className="p-4 border border-indigo-200 rounded-lg bg-white shadow-sm">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-2.5 rounded-full text-white">
                              {device.type === 'mobile' ? (
                                <Smartphone className="h-5 w-5" />
                              ) : device.type === 'tablet' ? (
                                <Tablet className="h-5 w-5" />
                              ) : (
                                <Laptop className="h-5 w-5" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-indigo-700">{device.name}</p>
                                {device.current && (
                                  <Badge variant="outline" className="text-xs py-0 px-1.5 h-5 bg-green-100 text-green-700 border-green-200">
                                    Atual
                                  </Badge>
                                )}
                              </div>
                              <div className="flex flex-col text-xs text-indigo-600 mt-0.5">
                                <span>{device.os} • {device.browser}</span>
                                <span className="text-gray-500">Último acesso: {new Date(device.lastActive).toLocaleString('pt-BR')}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
              
              {devices.length > 0 && (
                <div className="mt-6 pt-4 border-t border-indigo-100">
                  <Button 
                    onClick={handleLogoutAllDevices}
                    disabled={isLoadingDevices}
                    variant="destructive"
                    className="w-full gap-2 bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white shadow-sm hover:shadow"
                  >
                    <LogOut className="h-4 w-4" />
                    Desconectar Todos os Dispositivos
                  </Button>
                  <div className="flex items-start gap-2 mt-3 bg-red-50 p-3 rounded-lg border border-red-100">
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-red-600">
                      Isso encerrará todas as sessões ativas em todos os dispositivos, incluindo este. 
                      Você precisará fazer login novamente em cada dispositivo.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};
