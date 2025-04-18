import { ProfessionalHeader } from "@/components/profissionais/dashboard/ProfessionalHeader";
import { PersonalInfo } from "@/components/profissionais/profile/PersonalInfo";
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";

export default function ProfissionalProfile() {
  return (
    <PageLayout variant="blue">
      <ProfessionalHeader />
      <PageHeader 
        title="Meu Perfil" 
        subtitle="Gerencie suas informações pessoais" 
        backTo="/profissional-dashboard"
        variant="blue"
        badge="Profissional"
      />

      <div className="bg-white rounded-lg border border-blue-100 shadow-sm">
        <div className="p-1 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-100">
          <h2 className="text-xl font-medium px-4 py-3 text-blue-700">Informações Pessoais</h2>
        </div>
        <div className="p-6">
          <PersonalInfo />
        </div>
      </div>
    </PageLayout>
  );
}