'use client';

import * as React from 'react';
import { useState } from 'react';

import {
  BarChart3,
  BookOpen,
  Brain,
  FlaskConical,
  GalleryVerticalEnd,
  FolderPlus,
  FileUp,
  Trash2,
  Newspaper,
  X,
  Search,
  User,
  MessageSquare,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar-news';
import { TreeView } from '@/components/ui/tree-view';
import type { TreeNode } from '@/components/ui/tree-view';
import { News } from '@/components/ui/sidebar-news';
import type { NewsArticle } from '@/components/ui/sidebar-news';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

// Mock data for Knowledge Base tree
const initialTreeData: TreeNode[] = [
  {
    id: 'root',
    label: 'My Knowledge Base',
    children: [
      {
        id: 'research',
        label: 'Research Documents',
        children: [
          {
            id: 'aging-research',
            label: 'Aging Research',
            children: [
              {
                id: 'doc-1',
                label: 'Chronic inflammation and the hallmarks of aging.pdf',
                data: { type: 'file', size: '2.4 MB', uploadDate: 'Today' },
              },
              {
                id: 'doc-2',
                label:
                  'Loss of epigenetic information as a cause of mammalian aging.pdf',
                data: { type: 'file', size: '1.8 MB', uploadDate: 'Yesterday' },
              },
            ],
          },
          {
            id: 'longevity',
            label: 'Longevity Studies',
            children: [
              {
                id: 'doc-3',
                label: 'Interventions to slow aging in humans.docx',
                data: {
                  type: 'file',
                  size: '950 KB',
                  uploadDate: '3 days ago',
                },
              },
            ],
          },
        ],
      },
      {
        id: 'projects',
        label: 'Project Files',
        children: [
          {
            id: 'doc-4',
            label: 'Survey Analysis Q4.xlsx',
            data: { type: 'file', size: '1.2 MB', uploadDate: 'Last week' },
          },
        ],
      },
    ],
  },
];

// Mock news articles for the sidebar
const newsArticles: NewsArticle[] = [
  {
    href: 'https://example.com/news1',
    title: 'Surbee AI Updates: Enhanced Document Analysis',
    summary:
      'New AI capabilities for better document understanding and survey generation',
    image:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
  },
  {
    href: 'https://example.com/news2',
    title: 'Knowledge Base Performance Improvements',
    summary:
      'Faster search, better organization, and improved user experience across all features',
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
  },
  {
    href: 'https://example.com/news3',
    title: 'New Survey Templates Available',
    summary:
      'Pre-built templates for research, customer feedback, and employee engagement surveys',
    image:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [treeData, setTreeData] = useState<TreeNode[]>(initialTreeData);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [showNews, setShowNews] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Find a node by ID recursively
  const findNodeById = (nodes: TreeNode[], id: string): TreeNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Update tree data recursively
  const updateTreeData = (
    nodes: TreeNode[],
    targetId: string,
    updater: (node: TreeNode) => TreeNode,
  ): TreeNode[] => {
    return nodes.map((node) => {
      if (node.id === targetId) {
        return updater(node);
      }
      if (node.children) {
        return {
          ...node,
          children: updateTreeData(node.children, targetId, updater),
        };
      }
      return node;
    });
  };

  const handleNodeClick = React.useCallback((node: TreeNode) => {
    if (node.data?.type === 'file') {
      // Navigate to document viewer
      window.open(`/dashboard/knowledge/document/${node.id}`, '_blank');
    } else {
      setSelectedFolder(node.id);
    }
  }, []);

  const handleSelectionChange = React.useCallback((selectedIds: string[]) => {
    setSelectedNodes(selectedIds);
  }, []);

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;

    const newFolder: TreeNode = {
      id: `folder-${Date.now()}`,
      label: newFolderName,
      children: [],
    };

    if (selectedFolder) {
      // Add to selected folder
      setTreeData((prev) =>
        updateTreeData(prev, selectedFolder, (node) => ({
          ...node,
          children: [...(node.children || []), newFolder],
        })),
      );
    } else {
      // Add to root
      setTreeData((prev) => [...prev, newFolder]);
    }

    setNewFolderName('');
    setShowNewFolderDialog(false);
  };

  const handleDeleteSelected = () => {
    if (selectedNodes.length === 0) return;

    let updatedData = [...treeData];
    for (const nodeId of selectedNodes) {
      updatedData = removeNode(updatedData, nodeId);
    }
    setTreeData(updatedData);
    setSelectedNodes([]);
  };

  // Remove node recursively
  const removeNode = (nodes: TreeNode[], targetId: string): TreeNode[] => {
    return nodes.filter((node) => {
      if (node.id === targetId) return false;
      if (node.children) {
        node.children = removeNode(node.children, targetId);
      }
      return true;
    });
  };

  return (
    <>
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <div className="flex items-center gap-3 px-4 py-3">
            <GalleryVerticalEnd className="h-5 w-5" />
            <span className="font-semibold">Surbee</span>
          </div>
        </SidebarHeader>

        <SidebarContent>
          {/* Main Navigation */}
          <div className="px-4 py-3">
            <nav className="space-y-1">
              <a
                href="/dashboard/survey"
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-sidebar-accent"
              >
                <FlaskConical className="h-4 w-4" />
                Survey
              </a>
              <a
                href="/dashboard/analytics"
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-sidebar-accent"
              >
                <BarChart3 className="h-4 w-4" />
                Analytics
              </a>
            </nav>
          </div>

          {/* Chats Section */}
          <div className="px-4 py-3 border-t">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-sidebar-foreground flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Chats
              </h4>
            </div>
            {/* Chats List will be populated here */}
            <div className="text-xs text-muted-foreground pl-6">
              <a href="/dashboard" className="block py-1 hover:text-sidebar-foreground transition-colors">
                New Chat
              </a>
              {/* Dynamic list would go here */}
            </div>
          </div>

          {/* Knowledge Base Section */}
          <div className="px-4 py-3 border-t">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-sidebar-foreground flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Knowledge Base
              </h4>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setShowNewFolderDialog(true)}
                >
                  <FolderPlus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() =>
                    document.getElementById('sidebar-file-input')?.click()
                  }
                >
                  <FileUp className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-8 text-xs bg-sidebar-accent/50 border-sidebar-border"
              />
            </div>

            {/* Delete button if items selected */}
            {selectedNodes.length > 0 && (
              <div className="mb-3">
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-7 w-full text-xs"
                  onClick={handleDeleteSelected}
                >
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  Delete ({selectedNodes.length})
                </Button>
              </div>
            )}

            {/* TreeView */}
            <div className="max-h-96 overflow-auto">
              <TreeView
                data={treeData}
                selectedIds={selectedNodes}
                onSelectionChange={handleSelectionChange}
                onNodeClick={handleNodeClick}
                multiSelect={true}
                defaultExpandedIds={['root', 'research']}
                className="bg-sidebar-accent/30 border-sidebar-border text-xs"
                indent={12}
              />
            </div>

            <input
              id="sidebar-file-input"
              type="file"
              multiple
              accept=".pdf,.docx,.xlsx,.pptx,.csv,.txt,.md"
              className="hidden"
            />
          </div>
        </SidebarContent>

        <SidebarFooter>
          <div className="px-4 py-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start h-8 text-xs"
              onClick={() => setShowNews(!showNews)}
            >
              <Newspaper className="h-4 w-4 mr-2" />
              News & Updates
            </Button>
          </div>
          <div className="px-4 py-3 border-t">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-sidebar-accent rounded-full flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <div className="flex-1 text-xs">
                <p className="font-medium">User</p>
                <p className="text-sidebar-foreground/60">user@example.com</p>
              </div>
            </div>
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      {/* News Overlay */}
      {showNews && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/20 backdrop-blur-sm"
            onClick={() => setShowNews(false)}
          />
          <div className="w-80 bg-background border-l border-border h-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">News & Updates</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNews(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="h-[600px] relative">
              <News articles={newsArticles} />
            </div>
          </div>
        </div>
      )}

      {/* New Folder Dialog */}
      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              {selectedFolder
                ? `Create a new folder inside "${findNodeById(treeData, selectedFolder)?.label || 'Selected folder'}"`
                : 'Create a new folder in the root directory'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input
                id="folder-name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateFolder();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowNewFolderDialog(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreateFolder}
              disabled={!newFolderName.trim()}
            >
              Create Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
