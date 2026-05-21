import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Globe, Monitor, AlertCircle } from 'lucide-react';

export default function BrowserPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-dock-muted">Active Sessions</CardTitle>
            <Globe className="h-4 w-4 text-dock-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">3</div>
            <p className="text-xs text-dock-muted">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-dock-muted">Screenshots</CardTitle>
            <Monitor className="h-4 w-4 text-dock-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">127</div>
            <p className="text-xs text-dock-muted">Captured today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-dock-muted">Errors</CardTitle>
            <AlertCircle className="h-4 w-4 text-dock-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">2</div>
            <p className="text-xs text-dock-muted">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-white">Browser Runtime</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-96 items-center justify-center rounded-lg border border-dock-border bg-dock-bg">
            <div className="text-center">
              <Globe className="mx-auto h-12 w-12 text-dock-muted" />
              <p className="mt-4 text-sm text-dock-muted">No active browser session</p>
              <Button className="mt-4" size="sm">
                Start Session
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
