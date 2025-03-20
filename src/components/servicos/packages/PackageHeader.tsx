
import { SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";
import { Package, X } from "lucide-react";

interface PackageHeaderProps {
  isEditing: boolean;
}

export function PackageHeader({ isEditing }: PackageHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-indigo-600 border-b">
      <SheetHeader className="p-6">
        <div className="flex items-center justify-between">
          <SheetTitle className="text-xl flex items-center gap-2 text-white">
            <Package className="h-5 w-5 text-white" />
            {isEditing ? "Editar Pacote" : "Novo Pacote de Serviços"}
          </SheetTitle>
          <SheetClose className="rounded-full opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-white">
            <X className="h-4 w-4" />
            <span className="sr-only">Fechar</span>
          </SheetClose>
        </div>
        <SheetDescription className="text-blue-100">
          Crie um pacote com desconto em serviços e produtos combinados
        </SheetDescription>
      </SheetHeader>
    </div>
  );
}
