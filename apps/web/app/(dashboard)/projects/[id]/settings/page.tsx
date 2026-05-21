'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Trash2, Save } from 'lucide-react';

export default function ProjectSettingsPage() {
  const [projectName, setProjectName] = useState('AgentDock Core');
  const [projectDesc, setProjectDesc] = useState('Core platform services');

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="danger">Danger Zone</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Settings className="h-5 w-5" />
                Project Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Project Name</label>
                <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Description</label>
                <Input value={projectDesc} onChange={(e) => setProjectDesc(e.target.value)} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Default Agent</label>
                <Select defaultValue="code-reviewer">
                  <SelectTrigger>
                    <SelectValue placeholder="Select default agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="code-reviewer">Code Reviewer</SelectItem>
                    <SelectItem value="deploy-bot">Deploy Bot</SelectItem>
                    <SelectItem value="test-runner">Test Runner</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Default Model</label>
                <Select defaultValue="gpt-4">
                  <SelectTrigger>
                    <SelectValue placeholder="Select default model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                    <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                    <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="danger">
          <Card className="border-red-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-500">
                <Trash2 className="h-5 w-5" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-dock-border p-4">
                <div>
                  <p className="font-medium text-white">Delete Project</p>
                  <p className="text-sm text-dock-muted">
                    This will permanently delete the project and all associated data.
                  </p>
                </div>
                <Button variant="destructive">Delete Project</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
