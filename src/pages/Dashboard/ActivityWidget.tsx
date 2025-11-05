import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Activity {
  id: string;
  title: string;
  description: string;
  time: string;
  status: "open" | "in-progress" | "resolved" | "pending";
}

const activities: Activity[] = [
  {
    id: "1",
    title: "Laptop Request",
    description: "New Dell Latitude needed for Marketing",
    time: "5 mins ago",
    status: "pending",
  },
  {
    id: "2",
    title: "Network Issue",
    description: "WiFi connectivity problem in Floor 3",
    time: "12 mins ago",
    status: "in-progress",
  },
  {
    id: "3",
    title: "License Expiry",
    description: "Microsoft Office license expiring soon",
    time: "1 hour ago",
    status: "open",
  },
  {
    id: "4",
    title: "Asset Check-out",
    description: "Monitor assigned to John Doe",
    time: "2 hours ago",
    status: "resolved",
  },
];

const statusConfig = {
  open: { label: "Open", variant: "default" as const },
  "in-progress": { label: "In Progress", variant: "default" as const },
  resolved: { label: "Resolved", variant: "secondary" as const },
  pending: { label: "Pending", variant: "outline" as const },
};

export function ActivityWidget() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{activity.title}</p>
                  <Badge variant={statusConfig[activity.status].variant}>
                    {statusConfig[activity.status].label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
