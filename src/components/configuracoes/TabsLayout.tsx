
import { ReactNode } from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface TabData {
  id: string;
  title: string;
  icon: ReactNode;
  content: ReactNode;
  gradientFrom: string;
  gradientTo: string;
  baseColor: string;
}

interface TabsLayoutProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  tabs: TabData[];
}

export function TabsLayout({ activeTab, onTabChange, tabs }: TabsLayoutProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6">
      <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-2 rounded-lg border border-blue-100 shadow-sm">
        {tabs.map((tab) => (
          <TabsTrigger 
            key={tab.id}
            value={tab.id} 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:shadow-md data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:bg-opacity-60 data-[state=inactive]:text-gray-700 transition-all rounded-md"
          >
            {tab.icon}
            {tab.title}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent 
          key={tab.id}
          value={tab.id} 
          className="animate-in fade-in-50 duration-300"
        >
          <div className={cn(`bg-white rounded-lg border border-${tab.baseColor}-100 shadow-md overflow-hidden`)}>
            <div className={cn(`h-1 w-full bg-gradient-to-r from-${tab.baseColor}-400 via-${tab.baseColor}-500 to-${tab.gradientTo}-600`)}></div>
            <div className={cn(`p-2 bg-gradient-to-r from-${tab.baseColor}-50 via-${tab.baseColor}-100 to-${tab.baseColor}-50 border-b border-${tab.baseColor}-100`)}>
              <h2 className={cn(`text-xl font-medium px-4 py-3 text-${tab.baseColor}-700 flex items-center`)}>
                {tab.icon}
                {tab.title}
              </h2>
            </div>
            <div className="p-6">
              {tab.content}
            </div>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
