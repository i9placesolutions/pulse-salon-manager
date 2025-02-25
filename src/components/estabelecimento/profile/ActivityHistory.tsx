
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ActivityHistory() {
  const activities = [
    {
      id: 1,
      action: "Agendamento criado",
      date: "2024-03-15 14:30",
      user: "Maria Silva"
    },
    {
      id: 2,
      action: "Configurações atualizadas",
      date: "2024-03-14 16:45",
      user: "Admin"
    },
    {
      id: 3,
      action: "Nova avaliação recebida",
      date: "2024-03-14 10:20",
      user: "João Santos"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Atividades</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex justify-between border-b pb-2">
              <div>
                <p className="font-medium">{activity.action}</p>
                <p className="text-sm text-muted-foreground">por {activity.user}</p>
              </div>
              <p className="text-sm text-muted-foreground">{activity.date}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
