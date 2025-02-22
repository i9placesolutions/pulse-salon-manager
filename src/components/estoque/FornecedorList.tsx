
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Supplier } from "@/types/stock";
import { Building2, Phone, Mail, MapPin, Edit, Trash2 } from "lucide-react";

interface FornecedorListProps {
  suppliers: Supplier[];
  onEdit: (supplier: Supplier) => void;
  onDelete: (id: number) => void;
}

export function FornecedorList({
  suppliers,
  onEdit,
  onDelete,
}: FornecedorListProps) {
  return (
    <div className="grid gap-4">
      {suppliers.map((supplier) => (
        <Card key={supplier.id}>
          <CardContent className="flex items-center justify-between p-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">{supplier.name}</h3>
              </div>
              <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {supplier.phone}
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {supplier.email}
                </div>
                {supplier.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {supplier.address}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(supplier)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                onClick={() => onDelete(supplier.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
