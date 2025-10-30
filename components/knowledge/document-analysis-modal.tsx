'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Sparkles,
  Brain,
  Eye,
  ArrowRight,
  Download,
  Share2,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DocumentAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    id: string;
    title: string;
    type: string;
    authors: string;
    uploadDate: string;
    summary: string;
    insights: string[];
    questions: string[];
    tags: string[];
  };
  onGenerateSurvey?: (questions: string[]) => void;
}

export default function DocumentAnalysisModal({
  isOpen,
  onClose,
  document,
  onGenerateSurvey,
}: DocumentAnalysisModalProps) {
  const handleGenerateSurvey = () => {
    if (onGenerateSurvey) {
      onGenerateSurvey(document.questions);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b border-zinc-200">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <DialogTitle className="text-xl font-bold text-zinc-900 leading-tight">
                    {document.title}
                  </DialogTitle>
                  <div className="text-sm text-zinc-600 mt-1">
                    By {document.authors} • {document.uploadDate}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="summary" className="h-full flex flex-col">
              <div className="px-6 py-3 border-b border-zinc-200">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="summary" className="flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Summary
                  </TabsTrigger>
                  <TabsTrigger value="insights" className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Insights
                  </TabsTrigger>
                  <TabsTrigger value="questions" className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Survey Questions
                  </TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="flex-1">
                <div className="px-6 py-6">
                  <TabsContent value="summary" className="mt-0">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Brain className="w-5 h-5 text-blue-600" />
                          <h3 className="font-semibold text-blue-900">
                            AI-Generated Summary
                          </h3>
                        </div>
                        <p className="text-blue-800 leading-relaxed">
                          {document.summary}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-zinc-900 mb-3">
                          Document Tags
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {document.tags.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4">
                        <h4 className="font-semibold text-zinc-900 mb-2">
                          Document Information
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-zinc-600">Type:</span>
                            <span className="ml-2 font-medium">{document.type}</span>
                          </div>
                          <div>
                            <span className="text-zinc-600">Upload Date:</span>
                            <span className="ml-2 font-medium">{document.uploadDate}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="insights" className="mt-0">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        <h3 className="font-semibold text-zinc-900">
                          Key Insights Extracted
                        </h3>
                      </div>
                      
                      <div className="space-y-3">
                        {document.insights.map((insight, index) => (
                          <motion.div
                            key={`${document.id}-insight-${index}-${insight.slice(0, 20)}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-purple-50 border border-purple-200 rounded-lg p-4"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-sm font-medium text-purple-600">
                                  {index + 1}
                                </span>
                              </div>
                              <p className="text-purple-800 leading-relaxed">
                                {insight}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="questions" className="mt-0">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Eye className="w-5 h-5 text-green-600" />
                          <h3 className="font-semibold text-zinc-900">
                            AI-Generated Survey Questions
                          </h3>
                        </div>
                        <Button
                          onClick={handleGenerateSurvey}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <ArrowRight className="w-4 h-4 mr-2" />
                          Create Survey
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        {document.questions.map((question, index) => (
                          <motion.div
                            key={`${document.id}-question-${index}-${question.slice(0, 20)}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-green-50 border border-green-200 rounded-lg p-4"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-sm font-medium text-green-600">
                                  Q{index + 1}
                                </span>
                              </div>
                              <p className="text-green-800 font-medium leading-relaxed">
                                {question}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-800 text-sm">
                          <strong>Pro tip:</strong> These questions are automatically generated based on the document content. You can edit and customize them in the survey builder.
                        </p>
                      </div>
                    </motion.div>
                  </TabsContent>
                </div>
              </ScrollArea>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
