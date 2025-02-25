
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import type { Review } from "@/types/customerAccess";

interface CustomerReviewsProps {
  customerId: number;
  pendingReviews: Review[];
}

export function CustomerReviews({ customerId, pendingReviews }: CustomerReviewsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Avaliações</CardTitle>
        <CardDescription>Avalie seus atendimentos</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Sistema de avaliações em construção...</p>
      </CardContent>
    </Card>
  );
}
