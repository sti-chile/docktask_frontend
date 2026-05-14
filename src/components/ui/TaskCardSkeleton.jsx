import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const TaskCardSkeleton = () => {
  return (
    <Card className="animate-pulse">
      <CardHeader className="pb-2 border-b">
        <div className="flex justify-between items-start">
          <Skeleton className="h-6 w-3/4 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />

        <div className="pt-4 border-t">
          <Skeleton className="h-4 w-1/2" />
        </div>

        <div className="grid grid-cols-3 gap-2 pt-4">
          <Skeleton className="h-9 w-full rounded-md" />
          <Skeleton className="h-9 w-full rounded-md" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCardSkeleton;
