import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Palette,
  Download,
  Monitor,
  Save
} from 'lucide-react';

const Settings = () => {
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [highPrecision, setHighPrecision] = useState(false);
  const [theme, setTheme] = useState('system');

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background">
      <Header />

      <main className="container mx-auto px-6 py-8 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Customize your analysis environment and preferences</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Account Settings */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
              <User className="w-5 h-5" />
              Account Settings
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" defaultValue="Dr. Alex Morgan" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue="alex.morgan@clinic.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organization">Organization</Label>
                <Input id="organization" defaultValue="Medical Research Center" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select defaultValue="researcher">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="researcher">Researcher</SelectItem>
                    <SelectItem value="clinician">Clinician</SelectItem>
                    <SelectItem value="technician">Technician</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Analysis Preferences */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
              <SettingsIcon className="w-5 h-5" />
              Analysis Preferences
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="highPrecision">High Precision Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable ultra-high precision analysis (slower processing)
                  </p>
                </div>
                <Switch 
                  id="highPrecision" 
                  checked={highPrecision}
                  onCheckedChange={setHighPrecision}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="autoSave">Auto-save Analysis</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically save analysis results and reports
                  </p>
                </div>
                <Switch 
                  id="autoSave" 
                  checked={autoSave}
                  onCheckedChange={setAutoSave}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label>Default Deviation Threshold</Label>
                <Input type="number" defaultValue="0.001" step="0.001" min="0" />
                <p className="text-sm text-muted-foreground">
                  Default threshold for deviation detection (mm)
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Export Format</Label>
                <Select defaultValue="pdf">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Report</SelectItem>
                    <SelectItem value="csv">CSV Data</SelectItem>
                    <SelectItem value="json">JSON Export</SelectItem>
                    <SelectItem value="xlsx">Excel Spreadsheet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Appearance */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Appearance
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Theme Preference</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light Mode</SelectItem>
                    <SelectItem value="dark">Dark Mode</SelectItem>
                    <SelectItem value="system">System Default</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>3D Viewer Quality</Label>
                <Select defaultValue="high">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (Faster)</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High (Better Quality)</SelectItem>
                    <SelectItem value="ultra">Ultra (Best Quality)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Notifications */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="notifications">Analysis Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when analysis is complete
                  </p>
                </div>
                <Switch 
                  id="notifications" 
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Email Reports</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive analysis reports via email
                  </p>
                </div>
                <Switch defaultChecked={false} />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>System Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about new features and updates
                  </p>
                </div>
                <Switch defaultChecked={true} />
              </div>
            </div>
          </Card>

          {/* Security */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security & Privacy
            </h3>
            
            <div className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Two-Factor Authentication
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Download My Data
              </Button>
              <Button variant="destructive" className="w-full justify-start">
                Delete Account
              </Button>
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} className="btn-medical gap-2">
              <Save className="w-4 h-4" />
              Save Settings
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Settings;