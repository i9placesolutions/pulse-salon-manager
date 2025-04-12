import { PageHeader } from "@/components/shared/PageHeader";
import { PageLayout } from "@/components/shared/PageLayout";
import { ProfileSummary } from "@/components/profile/ProfileSummary";

export default function ProfileInfo() {
  return (
    <PageLayout>
      <PageHeader
        title="Informações do Estabelecimento"
        subtitle="Visualize os dados do seu estabelecimento"
      />
      
      <div className="space-y-6">
        <ProfileSummary />
      </div>
    </PageLayout>
  );
}
