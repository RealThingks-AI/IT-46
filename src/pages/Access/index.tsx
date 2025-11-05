import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Access() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Access Control</h1>
          <p className="text-muted-foreground mt-1">
            Manage user access requests and permissions
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Access Request
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Access Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>Access control management will be configured here</p>
            <p className="text-sm mt-2">Click "New Access Request" to get started</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
