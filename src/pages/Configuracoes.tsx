
import { PageLayout } from "@/components/shared/PageLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { TabsLayout } from "@/components/configuracoes/TabsLayout";
import { SaveButton } from "@/components/configuracoes/SaveButton";
import { ConfigAlert } from "@/components/configuracoes/ConfigAlert";
import { useConfiguracoes } from "@/hooks/use-configuracoes";
import { useTabsConfig } from "@/components/configuracoes/TabsConfig";

export default function Configuracoes() {
  const { activeTab, setActiveTab, isLoading, handleSave } = useConfiguracoes();
  const tabsData = useTabsConfig();
  
  return (
    <PageLayout variant="blue">
      <PageHeader 
        title="Configurações" 
        subtitle="Gerencie as configurações do seu salão"
        variant="blue"
        badge="Sistema"
        action={<SaveButton isLoading={isLoading} onSave={handleSave} />}
      />
      
      <ConfigAlert />

      <TabsLayout 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={tabsData}
      />
    </PageLayout>
  );
}
