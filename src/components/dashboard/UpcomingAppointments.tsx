
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const UpcomingAppointments = React.memo(() => {
  return (
    <Card className="border-green-200 shadow-sm hover:shadow transition-all">
      <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-full">
              <Calendar className="h-4 w-4 text-green-600" />
            </div>
            <CardTitle className="text-green-700">Próximos Agendamentos</CardTitle>
          </div>
          <Button variant="ghost" className="text-green-700 hover:bg-green-100 hover:text-green-800">
            Ver todos
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-green-50">
            <TableRow className="hover:bg-green-100/50">
              <TableHead className="text-green-700">Cliente</TableHead>
              <TableHead className="text-green-700">Serviço</TableHead>
              <TableHead className="text-green-700">Horário</TableHead>
              <TableHead className="text-right text-green-700">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="hover:bg-green-50/50">
              <TableCell className="font-medium">Ana Silva</TableCell>
              <TableCell>Corte Feminino</TableCell>
              <TableCell>14:00</TableCell>
              <TableCell className="text-right">{formatCurrency(80)}</TableCell>
            </TableRow>
            <TableRow className="bg-green-50/30 hover:bg-green-100/40">
              <TableCell className="font-medium">Carlos Mendes</TableCell>
              <TableCell>Barba e Cabelo</TableCell>
              <TableCell>15:30</TableCell>
              <TableCell className="text-right">{formatCurrency(65)}</TableCell>
            </TableRow>
            <TableRow className="hover:bg-green-50/50">
              <TableCell className="font-medium">Patricia Santos</TableCell>
              <TableCell>Coloração</TableCell>
              <TableCell>16:45</TableCell>
              <TableCell className="text-right">{formatCurrency(150)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
});

UpcomingAppointments.displayName = "UpcomingAppointments";
