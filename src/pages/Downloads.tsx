import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Download,
  FileText,
  Image,
  Database,
  Archive,
  Search,
  Filter,
  Calendar,
  CheckCircle
} from 'lucide-react';

const Downloads = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const downloads = [
    {
      id: 1,
      name: "Cavity_Analysis_Report_042.pdf",
      type: "report",
      size: "2.4 MB",
      date: "2024-01-15",
      status: "completed",
      description: "Comprehensive analysis report with deviation metrics"
    },
    {
      id: 2,
      name: "Deviation_Heatmap_042.png",
      type: "image",
      size: "1.8 MB",
      date: "2024-01-15",
      status: "completed",
      description: "High-resolution heatmap visualization"
    },
    {
      id: 3,
      name: "Analysis_Data_042.csv",
      type: "data",
      size: "245 KB",
      date: "2024-01-15",
      status: "completed",
      description: "Raw measurement data and coordinates"
    },
    {
      id: 4,
      name: "STL_Models_Archive_042.zip",
      type: "archive",
      size: "12.7 MB",
      date: "2024-01-15",
      status: "completed",
      description: "Original and processed STL files"
    },
    {
      id: 5,
      name: "Precision_Study_041.pdf",
      type: "report",
      size: "3.1 MB",
      date: "2024-01-14",
      status: "processing",
      description: "Multi-sample precision analysis report"
    }
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'report': return <FileText className="w-5 h-5" />;
      case 'image': return <Image className="w-5 h-5" />;
      case 'data': return <Database className="w-5 h-5" />;
      case 'archive': return <Archive className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'processing': return 'outline';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  const handleDownload = (fileName: string) => {
    toast.success(`Downloading ${fileName}...`);
    // Simulate download
    setTimeout(() => {
      toast.success(`${fileName} downloaded successfully!`);
    }, 2000);
  };

  const filteredDownloads = downloads.filter(download => {
    const matchesSearch = download.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         download.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || download.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background">
      <Header />

      <main className="container mx-auto px-6 py-8 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Downloads</h1>
          <p className="text-muted-foreground">Access your analysis reports, data exports, and visualizations</p>
        </div>

        {/* Search and Filter */}
        <div className="max-w-4xl mx-auto">
          <Card className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search downloads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Files</SelectItem>
                    <SelectItem value="report">Reports</SelectItem>
                    <SelectItem value="image">Images</SelectItem>
                    <SelectItem value="data">Data</SelectItem>
                    <SelectItem value="archive">Archives</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </div>

        {/* Downloads List */}
        <div className="max-w-4xl mx-auto space-y-4">
          {filteredDownloads.map((download) => (
            <Card key={download.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    {getFileIcon(download.type)}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-foreground">{download.name}</h3>
                    <p className="text-sm text-muted-foreground">{download.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {download.date}
                      </div>
                      <span>{download.size}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Badge variant={getStatusColor(download.status)}>
                    {download.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                    {download.status}
                  </Badge>
                  {download.status === 'completed' && (
                    <Button
                      onClick={() => handleDownload(download.name)}
                      className="btn-medical gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}

          {filteredDownloads.length === 0 && (
            <Card className="p-12">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto">
                  <Download className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">No downloads found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || filterType !== 'all' 
                      ? 'Try adjusting your search or filter criteria'
                      : 'Complete an analysis to generate downloadable files'}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <div className="max-w-4xl mx-auto">
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                <Archive className="w-6 h-6" />
                <span>Download All Reports</span>
                <span className="text-xs text-muted-foreground">Last 30 days</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                <Database className="w-6 h-6" />
                <span>Export Data Archive</span>
                <span className="text-xs text-muted-foreground">CSV + JSON</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                <Image className="w-6 h-6" />
                <span>Download Visualizations</span>
                <span className="text-xs text-muted-foreground">High-res images</span>
              </Button>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Downloads;