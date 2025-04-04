
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";

// Adicionando apenas a exportação da interface para uso em outros componentes

export interface BlockTimeData {
  id?: string;
  professionalId: string;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  reason: string;
  isFullDay: boolean;
}

interface BlockTimeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  professionals: { id: number; name: string }[];
  onSave: (data: BlockTimeData) => Promise<void>;
  existingBlocks: BlockTimeData[];
  onDeleteBlock: (id: string) => Promise<void>;
}

const formSchema = z.object({
  professionalId: z.string().min(1, {
    message: "Selecione um profissional.",
  }),
  startDate: z.date({
    required_error: "Uma data de início é necessária.",
  }),
  endDate: z.date({
    required_error: "Uma data de término é necessária.",
  }),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  reason: z.string().optional(),
  isFullDay: z.boolean().default(false),
});

export const BlockTimeDialog = ({
  open,
  onOpenChange,
  professionals,
  onSave,
  existingBlocks,
  onDeleteBlock,
}: BlockTimeDialogProps) => {
  const [selectedBlock, setSelectedBlock] = useState<BlockTimeData | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      professionalId: "",
      startDate: new Date(),
      endDate: new Date(),
      startTime: "08:00",
      endTime: "18:00",
      reason: "",
      isFullDay: false,
    },
  });

  useEffect(() => {
    if (selectedBlock) {
      form.setValue("professionalId", selectedBlock.professionalId);
      form.setValue("startDate", selectedBlock.startDate);
      form.setValue("endDate", selectedBlock.endDate);
      form.setValue("startTime", selectedBlock.startTime);
      form.setValue("endTime", selectedBlock.endTime);
      form.setValue("reason", selectedBlock.reason);
      form.setValue("isFullDay", selectedBlock.isFullDay);
    } else {
      form.reset();
    }
  }, [selectedBlock, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Garantimos que todos os campos obrigatórios estejam presentes
      const blockData: BlockTimeData = {
        professionalId: values.professionalId,
        startDate: values.startDate,
        endDate: values.endDate,
        startTime: values.startTime || "00:00",
        endTime: values.endTime || "23:59",
        reason: values.reason || "",
        isFullDay: values.isFullDay,
      };
      
      await onSave(blockData);
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Erro ao salvar bloqueio:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await onDeleteBlock(id);
    } catch (error) {
      console.error("Erro ao excluir bloqueio:", error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Bloquear Horário</SheetTitle>
          <SheetDescription>
            Defina um período para bloquear a agenda de um profissional.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="professionalId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profissional</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um profissional" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {professionals.map((professional) => (
                        <SelectItem key={professional.id} value={String(professional.id)}>
                          {professional.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex space-x-2">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Data de Início</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Selecione a data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date()
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Data de Término</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Selecione a data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date()
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex items-center space-x-2">
              <FormField
                control={form.control}
                name="isFullDay"
                render={({ field }) => (
                  <FormItem>
                    <div className="space-y-0.5">
                      <FormLabel>Dia todo?</FormLabel>
                      <FormDescription>
                        Marque para bloquear o dia inteiro.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {!form.getValues("isFullDay") && (
              <div className="flex space-x-2">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Hora de Início</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Hora de Término</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Motivo do bloqueio" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter>
              <Button type="submit">Salvar Bloqueio</Button>
            </SheetFooter>
          </form>
        </Form>

        {/* Listagem de Bloqueios Existentes */}
        {existingBlocks.length > 0 && (
          <div className="mt-8">
            <h3>Bloqueios Existentes</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Profissional</TableHead>
                  <TableHead>Data Início</TableHead>
                  <TableHead>Data Fim</TableHead>
                  <TableHead>Hora Início</TableHead>
                  <TableHead>Hora Fim</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {existingBlocks.map((block) => (
                  <TableRow key={block.id}>
                    <TableCell>
                      {professionals.find((p) => String(p.id) === block.professionalId)?.name || "N/A"}
                    </TableCell>
                    <TableCell>{format(block.startDate, "dd/MM/yyyy")}</TableCell>
                    <TableCell>{format(block.endDate, "dd/MM/yyyy")}</TableCell>
                    <TableCell>{block.startTime || "N/A"}</TableCell>
                    <TableCell>{block.endTime || "N/A"}</TableCell>
                    <TableCell>{block.reason || "N/A"}</TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            Excluir
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação irá excluir o bloqueio de horário
                              permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => block.id && handleDelete(block.id)}
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
