
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { BlockedDate } from "@/types/professional";

interface BlockedDateFormProps {
  onSubmit: (newBlockedDate: BlockedDate) => void;
  onCancel: () => void;
}

export function BlockedDateForm({ onSubmit, onCancel }: BlockedDateFormProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !reason) return;

    const newBlockedDate: BlockedDate = {
      id: Date.now(),
      startDate,
      endDate: endDate || startDate,
      reason,
    };

    onSubmit(newBlockedDate);
    setStartDate("");
    setEndDate("");
    setReason("");
  };

  return (
    <Card className="border-dashed">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="start-date">Data de início</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="end-date">Data de término (opcional)</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo do bloqueio</Label>
            <Input
              id="reason"
              placeholder="Ex: Feriado, Férias, etc."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">Adicionar Bloqueio</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
