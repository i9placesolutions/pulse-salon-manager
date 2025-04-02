import { useState } from "react";
import { SystemAlert } from "@/components/ui/system-alert";
import { StarIcon, SparklesIcon } from "lucide-react";

export function DemoAlert() {
  const [visible, setVisible] = useState(false);
  
  if (!visible) return null;

  return (
    <SystemAlert
      title="Login de teste realizado"
      message="Você está usando uma conta de demonstração. Todos os recursos estão disponíveis, mas os dados não serão salvos permanentemente."
      variant="demo"
      icon={
        <div className="relative">
          <StarIcon className="h-6 w-6 text-purple-600" />
          <SparklesIcon className="h-4 w-4 text-purple-400 absolute -top-1 -right-1 animate-pulse" />
        </div>
      }
      className="shadow-lg"
      dismissible={true}
      autoClose={8000}
    />
  );
} 