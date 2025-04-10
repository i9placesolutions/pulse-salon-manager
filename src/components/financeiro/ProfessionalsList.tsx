
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/currency";
import { Professional } from "@/types/financial";
import { PayCommissionDialog } from "./PayCommissionDialog";

interface ProfessionalsListProps {
  professionals: Professional[];
}

export const ProfessionalsList = ({ professionals }: ProfessionalsListProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Comissões</CardTitle>
          <CardDescription>Comissões dos profissionais</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {professionals.map((professional) => (
            <div
              key={professional.id}
              className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
            >
              <div>
                <p className="font-medium">{professional.name}</p>
                <p className="text-sm text-muted-foreground">
                  {professional.services} serviços realizados
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-medium">
                    {formatCurrency(professional.commission)}
                  </p>
                  <p className={`text-sm ${
                    professional.status === "A Pagar" ? "text-yellow-600" : "text-green-600"
                  }`}>
                    {professional.status}
                  </p>
                </div>
                {professional.status === "A Pagar" && (
                  <PayCommissionDialog professional={professional} />
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
