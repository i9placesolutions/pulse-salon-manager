
import { Button } from "@/components/ui/button";
import { BlockedDate } from "@/types/professional";

interface BlockedDatesListProps {
  blockedDates: BlockedDate[];
  onRemove: (id: string | number) => void;
}

export const BlockedDatesList = ({ blockedDates, onRemove }: BlockedDatesListProps) => {
  if (blockedDates.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="font-medium">Datas Bloqueadas</h4>
      <div className="space-y-2">
        {blockedDates.map((date) => (
          <div
            key={date.id}
            className="flex items-center justify-between p-2 border rounded"
          >
            <div>
              <p className="font-medium">
                {date.startDate && date.endDate ? (
                  <>
                    {new Date(date.startDate).toLocaleDateString()} até{" "}
                    {new Date(date.endDate).toLocaleDateString()}
                  </>
                ) : (
                  date.date && new Date(date.date).toLocaleDateString()
                )}
              </p>
              <p className="text-sm text-muted-foreground">
                {date.reason}
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onRemove(date.id)}
            >
              Remover
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
