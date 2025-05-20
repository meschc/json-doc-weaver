
import { useState, useEffect, useRef } from "react";
import { toast } from "@/components/ui/use-toast";
import JsonEditor from "@/components/JsonEditor";
import DocumentEditor from "@/components/DocumentEditor";
import { Button } from "@/components/ui/button";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { FileJson, FileText, FileCode, Pencil, Upload, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMobile } from "@/hooks/use-mobile";

const Index = () => {
  const isMobile = useMobile();
  const [jsonData, setJsonData] = useState<Record<string, any>>({
    name: "Kir",
    company: "Acme Inc.",
    position: "Developer",
    email: "kir@example.com"
  });
  
  const [documentContent, setDocumentContent] = useState<string>(
    "Hello {name},\n\nThank you for your interest in working at {company}. We're excited about your application for the {position} role.\n\nWe'll contact you at {email} with further information about the next steps.\n\nRegards,\nThe HR Team"
  );

  const [documentType, setDocumentType] = useState<string>("txt");
  const [jsonFilename, setJsonFilename] = useState<string>("data");
  const [jsonExtension] = useState<string>(".json");
  const [documentFilename, setDocumentFilename] = useState<string>("document");
  const [documentExtension] = useState<string>(".txt");
  const [editingJsonFilename, setEditingJsonFilename] = useState<boolean>(false);
  const [editingDocumentFilename, setEditingDocumentFilename] = useState<boolean>(false);

  const jsonFilenameInputRef = useRef<HTMLInputElement>(null);
  const documentFilenameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingJsonFilename && jsonFilenameInputRef.current) {
      jsonFilenameInputRef.current.focus();
    }
  }, [editingJsonFilename]);

  useEffect(() => {
    if (editingDocumentFilename && documentFilenameInputRef.current) {
      documentFilenameInputRef.current.focus();
    }
  }, [editingDocumentFilename]);

  const handleExportJson = () => {
    let dataStr;
    // Handle potentially invalid JSON that was preserved during editing
    if (jsonData._invalidContent) {
      dataStr = jsonData._invalidContent;
    } else {
      dataStr = JSON.stringify(jsonData, null, 2);
    }
    
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = jsonFilename + jsonExtension;
    link.click();
    
    URL.revokeObjectURL(url);
    toast({
      title: "JSON Exported",
      description: `File "${jsonFilename + jsonExtension}" has been exported successfully.`,
    });
  };

  const handleExportDocument = () => {
    // Replace all placeholder patterns with their values
    let processedContent = documentContent;
    const placeholderRegex = /{([^}]+)}/g;
    processedContent = processedContent.replace(placeholderRegex, (match, key) => {
      const value = jsonData[key];
      return value !== undefined ? String(value) : match;
    });
    
    let mimeType = 'text/plain';
    if (documentType === 'html') {
      mimeType = 'text/html';
    } else if (documentType === 'doc') {
      mimeType = 'application/msword';
    }
    
    const dataBlob = new Blob([processedContent], { type: mimeType });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = documentFilename + documentExtension;
    link.click();
    
    URL.revokeObjectURL(url);
    toast({
      title: "Document Exported",
      description: `File "${documentFilename + documentExtension}" has been exported successfully.`,
    });
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const reader = new FileReader();
    
    // Update filename and extension
    const parts = file.name.split('.');
    const extension = parts.length > 1 ? `.${parts.pop()}` : ".json";
    const name = parts.join('.');
    
    setJsonFilename(name);
    // Note: we don't update jsonExtension as per requirements
    
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        const json = JSON.parse(content);
        setJsonData(json);
        toast({
          title: "JSON Imported",
          description: `File "${file.name}" has been imported successfully.`,
        });
      } catch (err) {
        // Even if it's not valid JSON, still load the content
        setJsonData({ _invalidContent: content });
        toast({
          variant: "destructive",
          title: "Invalid JSON Format",
          description: "The file has been imported but contains syntax errors. You can fix it in the editor.",
        });
      }
    };
    
    reader.readAsText(file);
  };

  const handleImportDocument = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const reader = new FileReader();
    
    // Split filename and extension
    const parts = file.name.split('.');
    const extension = parts.length > 1 ? `.${parts.pop()}` : ".txt";
    const name = parts.join('.');
    
    // Set document type based on file extension
    const fileExtension = extension.toLowerCase().substring(1);
    setDocumentType(fileExtension);
    setDocumentFilename(name);
    // Note: we don't update documentExtension as per requirements
    
    reader.onload = (event) => {
      setDocumentContent(event.target?.result as string);
      toast({
        title: "Document Imported",
        description: `File "${file.name}" has been imported successfully.`,
      });
    };
    
    reader.readAsText(file);
  };

  const handleJsonFilenameChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setEditingJsonFilename(false);
    }
  };

  const handleDocumentFilenameChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setEditingDocumentFilename(false);
    }
  };

  const handleJsonFilenameBlur = () => {
    setEditingJsonFilename(false);
  };

  const handleDocumentFilenameBlur = () => {
    setEditingDocumentFilename(false);
  };

  // Get the appropriate icon based on document type
  const getDocumentIcon = () => {
    switch (documentType) {
      case 'html':
        return <FileCode className="h-5 w-5 text-primary" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-5 w-5 text-primary" />;
      default:
        return <FileText className="h-5 w-5 text-primary" />;
    }
  };

  const renderJsonHeader = () => (
    <div className="p-4 border-b flex justify-between items-center bg-white">
      <div className="flex items-center gap-2 flex-1">
        <FileJson className="h-5 w-5 text-primary" />
        {!editingJsonFilename ? (
          <div className="flex items-center gap-1">
            <h2 className="font-medium text-gray-700">{jsonFilename}{jsonExtension}</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={() => setEditingJsonFilename(true)}
            >
              <Pencil size={12} />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <Input
              ref={jsonFilenameInputRef}
              value={jsonFilename}
              onChange={(e) => setJsonFilename(e.target.value)}
              onKeyDown={handleJsonFilenameChange}
              onBlur={handleJsonFilenameBlur}
              className="h-8 text-sm font-medium"
            />
            <span className="text-gray-500">{jsonExtension}</span>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <label htmlFor="import-json">
          <Button variant="outline" size="sm" className="cursor-pointer transition-colors" asChild>
            <div className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              <span>Import</span>
            </div>
          </Button>
        </label>
        <input
          id="import-json"
          type="file"
          accept=".json"
          onChange={handleImportJson}
          className="hidden"
        />
        <Button size="sm" variant="outline" onClick={handleExportJson} className="flex items-center gap-1 transition-colors">
          <Upload className="h-4 w-4" />
          <span>Export</span>
        </Button>
      </div>
    </div>
  );

  const renderDocumentHeader = () => (
    <div className="p-4 border-b flex justify-between items-center bg-white">
      <div className="flex items-center gap-2 flex-1">
        {getDocumentIcon()}
        {!editingDocumentFilename ? (
          <div className="flex items-center gap-1">
            <h2 className="font-medium text-gray-700">{documentFilename}{documentExtension}</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={() => setEditingDocumentFilename(true)}
            >
              <Pencil size={12} />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <Input
              ref={documentFilenameInputRef}
              value={documentFilename}
              onChange={(e) => setDocumentFilename(e.target.value)}
              onKeyDown={handleDocumentFilenameChange}
              onBlur={handleDocumentFilenameBlur}
              className="h-8 text-sm font-medium"
            />
            <span className="text-gray-500">{documentExtension}</span>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <label htmlFor="import-document">
          <Button variant="outline" size="sm" className="cursor-pointer transition-colors" asChild>
            <div className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              <span>Import</span>
            </div>
          </Button>
        </label>
        <input
          id="import-document"
          type="file"
          accept=".txt,.md,.html,.doc,.docx"
          onChange={handleImportDocument}
          className="hidden"
        />
        <Button size="sm" variant="outline" onClick={handleExportDocument} className="flex items-center gap-1 transition-colors">
          <Upload className="h-4 w-4" />
          <span>Export</span>
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <header className="border-b py-3 px-4 bg-white flex items-center justify-between shadow-sm">
          <h1 className="text-lg font-medium flex items-center gap-2 text-gray-800">
            JSON Document Editor
          </h1>
        </header>

        <main className="flex-1 overflow-hidden">
          <Tabs defaultValue="json" className="h-full flex flex-col">
            <TabsList className="w-full justify-center border-b bg-white rounded-none">
              <TabsTrigger value="json" className="flex-1">JSON</TabsTrigger>
              <TabsTrigger value="document" className="flex-1">Document</TabsTrigger>
            </TabsList>
            
            <TabsContent value="json" className="flex-1 overflow-hidden m-0 p-0 h-full data-[state=inactive]:hidden data-[state=active]:flex data-[state=active]:flex-col">
              {renderJsonHeader()}
              <div className="flex-1 overflow-hidden bg-white">
                <JsonEditor data={jsonData} onChange={setJsonData} />
              </div>
            </TabsContent>
            
            <TabsContent value="document" className="flex-1 overflow-hidden m-0 p-0 h-full data-[state=inactive]:hidden data-[state=active]:flex data-[state=active]:flex-col">
              {renderDocumentHeader()}
              <div className="flex-1 overflow-hidden bg-white">
                <DocumentEditor 
                  content={documentContent} 
                  onChange={setDocumentContent} 
                  jsonData={jsonData}
                />
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="border-b py-3 px-6 bg-white flex items-center justify-between shadow-sm">
        <h1 className="text-xl font-medium flex items-center gap-2 text-gray-800">
          JSON Document Editor
        </h1>
      </header>

      <main className="flex-1 overflow-hidden">
        <ResizablePanelGroup
          direction="horizontal"
          className="h-full"
        >
          <ResizablePanel defaultSize={50} minSize={30} className="transition-all duration-200">
            <div className="h-full flex flex-col">
              {renderJsonHeader()}
              <div className="flex-1 overflow-hidden bg-white border-r">
                <JsonEditor data={jsonData} onChange={setJsonData} />
              </div>
            </div>
          </ResizablePanel>
          
          <ResizableHandle className="w-2 bg-gray-100 hover:bg-primary/20 transition-colors" />
          
          <ResizablePanel defaultSize={50} minSize={30} className="transition-all duration-200">
            <div className="h-full flex flex-col">
              {renderDocumentHeader()}
              <div className="flex-1 overflow-hidden bg-white">
                <DocumentEditor 
                  content={documentContent} 
                  onChange={setDocumentContent} 
                  jsonData={jsonData}
                />
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </div>
  );
};

export default Index;
