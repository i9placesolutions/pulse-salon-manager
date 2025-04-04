
import { useState } from "react";
import { SystemAlert } from "@/components/ui/system-alert";
import { Mail, AlertCircle } from "lucide-react";

export function EmailConfirmAlert() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <SystemAlert
      title="Confirme seu e-mail"
      message="Enviamos um link de confirmação para seu e-mail. Por favor, verifique sua caixa de entrada e confirme sua conta para continuar usando todas as funcionalidades."
      variant="warning"
      icon={
        <div className="relative">
          <Mail className="h-6 w-6 text-amber-600" />
          <AlertCircle className="h-4 w-4 text-amber-500 absolute -top-1 -right-1" />
        </div>
      }
      className="shadow-lg"
      dismissible={true}
      autoClose={12000}
    />
  );
}
