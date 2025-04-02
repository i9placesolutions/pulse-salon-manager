import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export interface ClientInfo {
  name: string;
  email: string;
  phone: string;
  notes?: string;
  acceptTerms: boolean;
}

interface ClientFormProps {
  onSubmit: (data: ClientInfo) => void;
  onBack: () => void;
  initialValues?: Partial<ClientInfo>;
}

export function ClientForm({ onSubmit, onBack, initialValues = {} }: ClientFormProps) {
  const [formData, setFormData] = useState<ClientInfo>({
    name: initialValues.name || "",
    email: initialValues.email || "",
    phone: initialValues.phone || "",
    notes: initialValues.notes || "",
    acceptTerms: initialValues.acceptTerms || false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ClientInfo, string>>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpa o erro quando o usuário começa a digitar
    if (errors[name as keyof ClientInfo]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      acceptTerms: checked,
    }));

    if (errors.acceptTerms) {
      setErrors((prev) => ({
        ...prev,
        acceptTerms: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ClientInfo, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Telefone é obrigatório";
    } else if (!/^\d{10,11}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Telefone inválido";
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "Você precisa aceitar os termos para continuar";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="flex items-center gap-1 text-gray-600 hover:text-gray-900 -ml-2 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Button>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Nome completo</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="(00) 00000-0000"
            className={errors.phone ? "border-red-500" : ""}
          />
          {errors.phone && (
            <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
          )}
        </div>

        <div>
          <Label htmlFor="notes">Observações (opcional)</Label>
          <Textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Informe qualquer informação adicional que julgar importante"
            className="h-24"
          />
        </div>

        <div className="flex items-center space-x-2 mt-4">
          <Checkbox
            id="acceptTerms"
            checked={formData.acceptTerms}
            onCheckedChange={handleCheckboxChange}
          />
          <Label
            htmlFor="acceptTerms"
            className={`text-sm ${
              errors.acceptTerms ? "text-red-500" : "text-gray-700"
            }`}
          >
            Concordo com os termos de uso e política de privacidade
          </Label>
        </div>
        {errors.acceptTerms && (
          <p className="text-sm text-red-500 mt-0">{errors.acceptTerms}</p>
        )}

        <div className="flex justify-end pt-4">
          <Button type="submit" className="bg-pink-600 hover:bg-pink-700">
            Finalizar agendamento
          </Button>
        </div>
      </form>
    </div>
  );
} 