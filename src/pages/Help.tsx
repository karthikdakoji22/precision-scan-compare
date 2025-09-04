import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle,
  Search,
  BookOpen,
  Video,
  Mail,
  MessageCircle,
  FileText,
  Zap,
  Users,
  Phone
} from 'lucide-react';

const Help = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const faqItems = [
    {
      question: "How do I upload STL files for analysis?",
      answer: "Click on the upload zones on the main page and select your reference and query STL files. The system supports standard STL format files up to 100MB each."
    },
    {
      question: "What is the difference between reference and query files?",
      answer: "The reference file is your baseline or training model, while the query file is the test model you want to compare against the reference. The system will analyze deviations between these two models."
    },
    {
      question: "How do I interpret the heatmap colors?",
      answer: "Mint green areas indicate no deviation (perfect match), while pink areas show deviations. The intensity of pink indicates the magnitude of deviation - darker pink means larger deviation."
    },
    {
      question: "What file formats are supported?",
      answer: "Currently, the system supports STL (stereolithography) files, which are the industry standard for 3D models in precision analysis applications."
    },
    {
      question: "How accurate are the measurements?",
      answer: "The system provides sub-millimeter precision with accuracy down to 0.001mm, making it suitable for high-precision medical and engineering applications."
    },
    {
      question: "Can I export my analysis results?",
      answer: "Yes, you can export results in multiple formats including PDF reports, CSV data files, high-resolution images, and complete analysis archives."
    },
    {
      question: "What is the processing time for analysis?",
      answer: "Processing time depends on model complexity, typically ranging from 30 seconds for simple models to 5 minutes for highly detailed models."
    },
    {
      question: "How do I enable dark mode?",
      answer: "Click the sun/moon icon in the header to toggle between light and dark modes. Your preference will be saved automatically."
    }
  ];

  const tutorials = [
    {
      title: "Getting Started with STL Analysis",
      description: "Learn the basics of uploading files and running your first analysis",
      duration: "5 min",
      type: "video"
    },
    {
      title: "Understanding Deviation Analysis",
      description: "Deep dive into interpreting heatmaps and deviation measurements",
      duration: "8 min",
      type: "video"
    },
    {
      title: "Advanced Viewer Controls",
      description: "Master the 3D viewer controls and visualization options",
      duration: "6 min",
      type: "video"
    },
    {
      title: "Exporting and Sharing Results",
      description: "Learn how to export reports and share your analysis",
      duration: "4 min",
      type: "video"
    }
  ];

  const filteredFAQ = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background">
      <Header />

      <main className="container mx-auto px-6 py-8 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Help Center</h1>
          <p className="text-muted-foreground">Find answers, tutorials, and get support for your analysis needs</p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search help articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Help Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Quick Start Guide</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Get up and running in under 5 minutes
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">User Manual</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Comprehensive documentation and guides
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Video Tutorials */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <Video className="w-5 h-5" />
                Video Tutorials
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tutorials.map((tutorial, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:bg-surface/50 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-foreground">{tutorial.title}</h4>
                      <Badge variant="outline">{tutorial.duration}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{tutorial.description}</p>
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <Video className="w-4 h-4" />
                      Watch Tutorial
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            {/* FAQ */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                Frequently Asked Questions
              </h3>
              
              {filteredFAQ.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {filteredFAQ.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No FAQ items found matching your search.
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Support */}
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Need More Help?</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Live Chat Support
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Mail className="w-4 h-4" />
                  Email Support
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Phone className="w-4 h-4" />
                  Schedule a Call
                </Button>
              </div>
              
              <div className="mt-4 p-3 bg-surface/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Support Hours:</strong><br />
                  Monday - Friday: 9 AM - 6 PM EST<br />
                  Response time: &lt; 2 hours
                </p>
              </div>
            </Card>

            {/* Community */}
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Community
              </h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  Discussion Forum
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  User Examples
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Feature Requests
                </Button>
              </div>
            </Card>

            {/* Documentation */}
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Documentation
              </h3>
              <div className="space-y-2">
                <a href="#" className="block text-sm text-primary hover:underline">
                  API Documentation
                </a>
                <a href="#" className="block text-sm text-primary hover:underline">
                  Technical Specifications
                </a>
                <a href="#" className="block text-sm text-primary hover:underline">
                  Best Practices Guide
                </a>
                <a href="#" className="block text-sm text-primary hover:underline">
                  Troubleshooting Guide
                </a>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Help;