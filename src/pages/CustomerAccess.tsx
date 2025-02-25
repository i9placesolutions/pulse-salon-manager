
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerHeader } from "@/components/customer-access/CustomerHeader";
import { CustomerOverview } from "@/components/customer-access/CustomerOverview";
import { CustomerHistory } from "@/components/customer-access/CustomerHistory";
import { CustomerReviews } from "@/components/customer-access/CustomerReviews";
import { CustomerBenefits } from "@/components/customer-access/CustomerBenefits";
import { CustomerPayments } from "@/components/customer-access/CustomerPayments";
import type { CustomerAccessInfo } from "@/types/customerAccess";

// Mock data - será substituído pela integração com Supabase
const mockCustomerInfo: CustomerAccessInfo = {
  id: 1,
  name: "Maria Silva",
  registrationDate: "2023-01-15",
  cashbackBalance: 150.0,
  totalAppointments: 12,
  nextAppointment: {
    id: 1,
    date: "2024-03-20",
    time: "14:30",
    service: "Corte + Escova",
    professional: "Ana Santos",
    status: "scheduled",
    value: 150,
    paymentMethod: "credit"
  },
  pendingReviews: [
    {
      id: 1,
      appointmentId: 123,
      serviceId: 1,
      serviceName: "Corte + Escova",
      professionalName: "Ana Santos",
      date: "2024-03-15",
      status: "pending"
    }
  ]
};

export default function CustomerAccess() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-background">
      <CustomerHeader 
        establishmentName="Pulse Salon"
        establishmentLogo="/placeholder.svg"
      />

      <main className="container mx-auto px-4 py-8">
        <CustomerOverview customer={mockCustomerInfo} />

        <Tabs defaultValue="overview" className="mt-8 space-y-8">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
            <TabsTrigger value="reviews">Avaliações</TabsTrigger>
            <TabsTrigger value="benefits">Cupons e Benefícios</TabsTrigger>
            <TabsTrigger value="payments">Pagamentos</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <CustomerOverview customer={mockCustomerInfo} />
          </TabsContent>

          <TabsContent value="history">
            <CustomerHistory customerId={mockCustomerInfo.id} />
          </TabsContent>

          <TabsContent value="reviews">
            <CustomerReviews 
              customerId={mockCustomerInfo.id}
              pendingReviews={mockCustomerInfo.pendingReviews}
            />
          </TabsContent>

          <TabsContent value="benefits">
            <CustomerBenefits 
              customerId={mockCustomerInfo.id}
              cashbackBalance={mockCustomerInfo.cashbackBalance}
            />
          </TabsContent>

          <TabsContent value="payments">
            <CustomerPayments customerId={mockCustomerInfo.id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
