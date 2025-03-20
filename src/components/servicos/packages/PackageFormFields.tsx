
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ServicePackage } from "@/types/service";

interface PackageFormFieldsProps {
  formData: Partial<ServicePackage>;
  setFormData: (data: Partial<ServicePackage>) => void;
}

export function PackageFormFields({ formData, setFormData }: PackageFormFieldsProps) {
  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    // Limita o desconto a valores entre 0 e 100
    const limitedValue = isNaN(value) ? 0 : Math.min(Math.max(0, value), 100);
    setFormData({
      ...formData,
      discount: limitedValue,
    });
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Nome do Pacote <span className="text-red-500">*</span>
        </label>
        <Input
          id="name"
          placeholder="Ex: Dia da Noiva"
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
          className="w-full"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Descrição
        </label>
        <Textarea
          id="description"
          placeholder="Descrição detalhada do pacote..."
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="h-20 resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="discount" className="text-sm font-medium">
            Desconto (%) <span className="text-red-500">*</span>
          </label>
          <Input
            id="discount"
            type="number"
            min="0"
            max="100"
            value={formData.discount}
            onChange={handleDiscountChange}
            className="w-full"
            required
          />
          {formData.discount && formData.discount > 100 && (
            <p className="text-xs text-red-500 mt-1">
              O desconto não pode ser maior que 100%
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-medium">
            Status
          </label>
          <div className="flex items-center justify-between rounded-md border p-3">
            <span className="text-sm">Ativo</span>
            <Switch
              checked={formData.status === "active"}
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  status: checked ? "active" : "inactive",
                })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
