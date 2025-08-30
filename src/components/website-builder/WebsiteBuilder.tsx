"use client";

import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { Monaco } from "@monaco-editor/react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  Copy, 
  Download, 
  Monitor, 
  Tablet, 
  Smartphone,
  Wand2,
  Globe,
  Code2,
  StopCircle
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MODELS } from "@/lib/providers";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Dynamically import Monaco Editor to avoid SSR issues
const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const defaultHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Website</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen">
    <div class="container mx-auto px-4 py-8">
        <h1 class="text-4xl font-bold text-gray-800 mb-6">Welcome to My Website</h1>
        <p class="text-lg text-gray-600">Start building your amazing website with AI assistance!</p>
    </div>
</body>
</html>`;

interface WebsiteBuilderProps {
  projectId?: string;
  initialHtml?: string;
}

export function WebsiteBuilder({ projectId, initialHtml }: WebsiteBuilderProps) {
  const [html, setHtml] = useState(initialHtml || defaultHTML);
  const [prompt, setPrompt] = useState("");
  const [redesignUrl, setRedesignUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRedesigning, setIsRedesigning] = useState(false);
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [activeTab, setActiveTab] = useState("preview");
  const [provider, setProvider] = useState("auto");
  const [model, setModel] = useState(MODELS[0].value);
  const [controller, setController] = useState<AbortController | null>(null);
  const [previousPrompt, setPreviousPrompt] = useState("");
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const editorRef = useRef<any>(null);

  // Update iframe content when HTML changes
  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();
      }
    }
  }, [html]);

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    
    // Configure HTML language features
    monaco.languages.html.htmlDefaults.setOptions({
      format: {
        tabSize: 2,
        insertSpaces: true,
        wrapLineLength: 120,
        wrapAttributes: 'auto',
      },
      suggest: {
        html5: true,
      },
    });
  };

  const stopGeneration = () => {
    if (controller) {
      controller.abort();
      setController(null);
      setIsGenerating(false);
      setIsRedesigning(false);
      toast.info("Generation stopped");
    }
  };

  const generateWebsite = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt to generate your website");
      return;
    }

    setIsGenerating(true);
    const abortController = new AbortController();
    setController(abortController);

    try {
      const response = await fetch("/api/ask-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": window.location.hostname,
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          model,
          provider,
          html: "",
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate website");
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let result = "";

      if (reader) {
        let lastRender = 0;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          result += chunk;

          // Progressive render: update iframe with partial, valid HTML slices
          const htmlMatch = result.match(/<!DOCTYPE html>[\s\S]*<\/html>/i);
          const now = Date.now();
          if (htmlMatch) {
            if (now - lastRender > 120) {
              setHtml(htmlMatch[0]);
              lastRender = now;
            }
          } else {
            // No full document yet; try to write best-effort partial to minimize flicker
            const startIdx = (() => {
              const d = result.lastIndexOf('<!DOCTYPE html>');
              if (d !== -1) return d;
              const h = result.lastIndexOf('<html');
              return h !== -1 ? h : -1;
            })();
            if (startIdx !== -1) {
              const closers = ['</body>', '</html>'];
              let endIdx = -1;
              for (const closer of closers) {
                const idx = result.lastIndexOf(closer);
                if (idx !== -1) endIdx = Math.max(endIdx, idx + closer.length);
              }
              if (endIdx !== -1 && now - lastRender > 150) {
                setHtml(result.slice(startIdx, endIdx));
                lastRender = now;
              }
            }
          }
        }
      }

      // Final HTML extraction
      const finalMatch = result.match(/<!DOCTYPE html>[\s\S]*<\/html>/i);
      const finalHtml = finalMatch ? finalMatch[0] : result;
      setHtml(finalHtml);
      setActiveTab("preview");
      toast.success("Website generated successfully!");
      
      setPreviousPrompt(prompt);
      setPrompt("");
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error("Error generating website:", error);
        toast.error("Failed to generate website. Please try again.");
      }
    } finally {
      setIsGenerating(false);
      setController(null);
    }
  };

  const redesignFromUrl = async () => {
    if (!redesignUrl.trim()) {
      toast.error("Please enter a URL to redesign");
      return;
    }

    setIsRedesigning(true);
    const abortController = new AbortController();
    setController(abortController);

    try {
      // First, get the markdown from the URL
      const redesignResponse = await fetch("/api/re-design", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: redesignUrl.trim(),
        }),
        signal: abortController.signal,
      });

      if (!redesignResponse.ok) {
        throw new Error("Failed to fetch website content");
      }

      const { markdown } = await redesignResponse.json();

      // Then, generate a new design based on the markdown
      const generateResponse = await fetch("/api/ask-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": window.location.hostname,
        },
        body: JSON.stringify({
          redesignMarkdown: markdown,
          model,
          provider,
          html: "",
        }),
        signal: abortController.signal,
      });

      if (!generateResponse.ok) {
        throw new Error("Failed to generate redesign");
      }

      // Handle streaming response
      const reader = generateResponse.body?.getReader();
      const decoder = new TextDecoder();
      let result = "";

      if (reader) {
        let lastRender = 0;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          result += chunk;

          // Progressive render
          const htmlMatch = result.match(/<!DOCTYPE html>[\s\S]*<\/html>/i);
          const now = Date.now();
          if (htmlMatch) {
            if (now - lastRender > 120) {
              setHtml(htmlMatch[0]);
              lastRender = now;
            }
          } else {
            const startIdx = (() => {
              const d = result.lastIndexOf('<!DOCTYPE html>');
              if (d !== -1) return d;
              const h = result.lastIndexOf('<html');
              return h !== -1 ? h : -1;
            })();
            if (startIdx !== -1) {
              const closers = ['</body>', '</html>'];
              let endIdx = -1;
              for (const closer of closers) {
                const idx = result.lastIndexOf(closer);
                if (idx !== -1) endIdx = Math.max(endIdx, idx + closer.length);
              }
              if (endIdx !== -1 && now - lastRender > 150) {
                setHtml(result.slice(startIdx, endIdx));
                lastRender = now;
              }
            }
          }
        }
      }

      const finalMatch = result.match(/<!DOCTYPE html>[\s\S]*<\/html>/i);
      const finalHtml = finalMatch ? finalMatch[0] : result;
      setHtml(finalHtml);
      setActiveTab("preview");
      toast.success("Website redesigned successfully!");
      
      setRedesignUrl("");
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error("Error redesigning website:", error);
        toast.error("Failed to redesign website. Please try again.");
      }
    } finally {
      setIsRedesigning(false);
      setController(null);
    }
  };

  const modifyWebsite = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a modification request");
      return;
    }

    setIsGenerating(true);
    const abortController = new AbortController();
    setController(abortController);

    try {
      const response = await fetch("/api/ask-ai", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": window.location.hostname,
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          html: html,
          previousPrompt,
          model,
          provider,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to modify website");
      }

      const result = await response.json();
      
      if (result.ok && result.html) {
        setHtml(result.html);
        setActiveTab("preview");
        toast.success("Website modified successfully!");
      } else {
        throw new Error(result.message || "Failed to modify website");
      }
      
      setPreviousPrompt(prompt);
      setPrompt("");
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error("Error modifying website:", error);
        toast.error("Failed to modify website. Please try again.");
      }
    } finally {
      setIsGenerating(false);
      setController(null);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(html);
      toast.success("HTML copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy HTML");
    }
  };

  const downloadHtml = () => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `website-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("HTML file downloaded!");
  };

  const getDeviceStyles = () => {
    switch (device) {
      case "mobile":
        return "w-[375px] h-[667px]";
      case "tablet":
        return "w-[768px] h-[1024px]";
      default:
        return "w-full h-full";
    }
  };

  const isWorking = isGenerating || isRedesigning;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-800">Website Builder</h1>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Powered by DeepSite
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={copyToClipboard}>
            <Copy className="w-4 h-4 mr-2" />
            Copy HTML
          </Button>
          <Button variant="outline" size="sm" onClick={downloadHtml}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Controls */}
        <div className="w-80 bg-white border-r p-4 overflow-y-auto">
          <div className="space-y-6">
            {/* Model Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">AI Model</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {MODELS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={provider} onValueChange={setProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="fireworks-ai">Fireworks AI</SelectItem>
                    <SelectItem value="groq">Groq</SelectItem>
                    <SelectItem value="hyperbolic">Hyperbolic</SelectItem>
                    <SelectItem value="nebius">Nebius</SelectItem>
                    <SelectItem value="novita">Novita</SelectItem>
                    <SelectItem value="sambanova">SambaNova</SelectItem>
                    <SelectItem value="together">Together</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Generate from Prompt */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5" />
                  Generate Website
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Describe the website you want to create..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                />
                <Button 
                  onClick={generateWebsite} 
                  disabled={isWorking || !prompt.trim()}
                  className="w-full"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Wand2 className="w-4 h-4 mr-2" />
                  )}
                  Generate
                </Button>
              </CardContent>
            </Card>

            {/* Redesign from URL */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Redesign from URL
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="https://example.com"
                  value={redesignUrl}
                  onChange={(e) => setRedesignUrl(e.target.value)}
                />
                <Button 
                  onClick={redesignFromUrl} 
                  disabled={isWorking || !redesignUrl.trim()}
                  className="w-full"
                  variant="outline"
                >
                  {isRedesigning ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Globe className="w-4 h-4 mr-2" />
                  )}
                  Redesign
                </Button>
              </CardContent>
            </Card>

            {/* Modify Current Website */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="w-5 h-5" />
                  Modify Current
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="What changes would you like to make?"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                />
                <Button 
                  onClick={modifyWebsite} 
                  disabled={isWorking || !prompt.trim()}
                  className="w-full"
                  variant="outline"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Code2 className="w-4 h-4 mr-2" />
                  )}
                  Modify
                </Button>
              </CardContent>
            </Card>

            {/* Stop Generation */}
            {isWorking && (
              <Card>
                <CardContent className="pt-6">
                  <Button 
                    onClick={stopGeneration}
                    className="w-full"
                    variant="destructive"
                  >
                    <StopCircle className="w-4 h-4 mr-2" />
                    Stop Generation
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Device Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Device Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    variant={device === "desktop" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDevice("desktop")}
                  >
                    <Monitor className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={device === "tablet" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDevice("tablet")}
                  >
                    <Tablet className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={device === "mobile" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDevice("mobile")}
                  >
                    <Smartphone className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Panel - Editor and Preview */}
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="m-4 mb-0 w-fit">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="editor">Code Editor</TabsTrigger>
            </TabsList>
            
            <TabsContent value="preview" className="flex-1 m-4 mt-2">
              <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
                <div className={`bg-white shadow-lg rounded-lg overflow-hidden ${getDeviceStyles()}`}>
                  <iframe
                    ref={iframeRef}
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin"
                    title="Website Preview"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="editor" className="flex-1 m-4 mt-2">
              <div className="h-full border rounded-lg overflow-hidden">
                <Editor
                  height="100%"
                  defaultLanguage="html"
                  value={html}
                  onChange={(value) => setHtml(value || "")}
                  onMount={handleEditorDidMount}
                  theme="vs-light"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: "on",
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    wordWrap: "on",
                    automaticLayout: true,
                  }}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}