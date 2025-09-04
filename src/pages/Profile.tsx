import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  Award,
  Activity,
  FileText,
  Clock
} from 'lucide-react';

const Profile = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background">
      <Header />

      <main className="container mx-auto px-6 py-8 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">User Profile</h1>
          <p className="text-muted-foreground">Manage your account and view your analysis history</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6">
              <div className="text-center space-y-4">
                <Avatar className="w-24 h-24 mx-auto">
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                    <User className="w-12 h-12 text-primary" />
                  </div>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Dr. Alex Morgan</h2>
                  <p className="text-muted-foreground">Precision Analysis Expert</p>
                  <Badge variant="default" className="mt-2">Pro Member</Badge>
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>alex.morgan@clinic.com</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>Medical Research Center</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Member since Jan 2024</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Achievements
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Analyses Completed</span>
                  <Badge variant="outline">142</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Precision Score</span>
                  <Badge variant="default">98.5%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Reports Generated</span>
                  <Badge variant="outline">89</Badge>
                </div>
              </div>
            </Card>
          </div>

          {/* Activity & History */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Activity
              </h3>
              <div className="space-y-4">
                {[
                  { action: "Completed analysis", file: "cavity_scan_042.stl", time: "2 hours ago" },
                  { action: "Generated report", file: "precision_analysis_041.pdf", time: "5 hours ago" },
                  { action: "Uploaded files", file: "reference_model_043.stl", time: "1 day ago" },
                  { action: "Exported data", file: "metrics_summary_040.csv", time: "2 days ago" }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-surface/50">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.file}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {activity.time}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Analysis History
              </h3>
              <div className="space-y-3">
                {[
                  { name: "Cavity Analysis #042", date: "2024-01-15", status: "Completed", accuracy: "99.2%" },
                  { name: "Precision Study #041", date: "2024-01-14", status: "Completed", accuracy: "98.7%" },
                  { name: "Deviation Research #040", date: "2024-01-13", status: "Completed", accuracy: "97.9%" }
                ].map((analysis, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <p className="font-medium text-foreground">{analysis.name}</p>
                      <p className="text-sm text-muted-foreground">{analysis.date}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge variant="default">{analysis.status}</Badge>
                      <p className="text-sm text-muted-foreground">{analysis.accuracy}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All History
              </Button>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;