// apps/web/components/dashboard/dashboard-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon, ArrowUp } from "lucide-react";

interface DashboardCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  change: string;
}

export function DashboardCard({ title, value, icon: Icon, change }: DashboardCardProps) {
  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        <Icon className="h-5 w-5 text-indigo-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-green-500 flex items-center mt-1">
            <ArrowUp className="h-3 w-3 mr-1" />
            {change} from last period
        </p>
      </CardContent>
    </Card>
  );
}