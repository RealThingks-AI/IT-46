import { StatsCard } from "./StatsCard";
import { ActivityWidget } from "./ActivityWidget";
import { ChartCard } from "./ChartCard";
import { Button } from "@/components/ui/button";
import {
  Ticket,
  Package,
  AlertCircle,
  CheckCircle2,
  Plus,
  Calendar,
} from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            IT Operations Overview
          </p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Raise Ticket
          </Button>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Maintenance
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Active Tickets"
          value={23}
          icon={Ticket}
          trend={{ value: "+12% from last month", isPositive: true }}
        />
        <StatsCard
          title="Total Assets"
          value={487}
          icon={Package}
          variant="success"
          trend={{ value: "+5 this week", isPositive: true }}
        />
        <StatsCard
          title="Pending Approvals"
          value={8}
          icon={AlertCircle}
          variant="warning"
        />
        <StatsCard
          title="System Uptime"
          value="99.8%"
          icon={CheckCircle2}
          variant="success"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard />
        <ActivityWidget />
      </div>
    </div>
  );
}
