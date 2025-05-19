
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import JsonEditor from "@/components/JsonEditor";
import DocumentEditor from "@/components/DocumentEditor";
import { Button } from "@/components/ui/button";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { FileJson, FileText, Download, Upload, FileCode } from "lucide-react";

const Index = () => {
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

  const handleExportJson = () => {
    const dataStr = JSON.stringify(jsonData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'data.json';
    link.click();
    
    URL.revokeObjectURL(url);
    toast({
      title: "JSON Exported",
      description: "Your JSON data has been exported successfully.",
    });
  };

  const handleExportDocument = () => {
    // Replace all placeholder patterns with their values
    let processedContent = documentContent;
    Object.entries(jsonData).forEach(([key, value]) => {
      const placeholder = new RegExp(`{${key}}`, 'g');
      processedContent = processedContent.replace(placeholder, String(value));
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
    link.download = `document.${documentType}`;
    link.click();
    
    URL.revokeObjectURL(url);
    toast({
      title: "Document Exported",
      description: "Your document has been exported successfully.",
    });
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        setJsonData(json);
        toast({
          title: "JSON Imported",
          description: "Your JSON data has been imported successfully.",
        });
      } catch (err) {
        toast({
          title: "Error Importing JSON",
          description: "The file is not a valid JSON file.",
          variant: "destructive"
        });
      }
    };
    
    reader.readAsText(file);
  };

  const handleImportDocument = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const reader = new FileReader();
    
    // Set document type based on file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'txt';
    setDocumentType(fileExtension);
    
    reader.onload = (event) => {
      setDocumentContent(event.target?.result as string);
      toast({
        title: "Document Imported",
        description: "Your document has been imported successfully.",
      });
    };
    
    reader.readAsText(file);
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
          className="h-full rounded-lg"
        >
          <ResizablePanel defaultSize={50} minSize={30} className="transition-all duration-200">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b flex justify-between items-center bg-white">
                <div className="flex items-center gap-2">
                  <FileJson className="h-5 w-5 text-primary" />
                  <h2 className="font-medium text-gray-700">JSON Data</h2>
                </div>
                <div className="flex gap-2">
                  <label htmlFor="import-json">
                    <Button variant="outline" size="sm" className="cursor-pointer transition-colors" asChild>
                      <div className="flex items-center gap-1">
                        <Upload className="h-4 w-4" />
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
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-hidden bg-white border-r">
                <JsonEditor data={jsonData} onChange={setJsonData} />
              </div>
            </div>
          </ResizablePanel>
          
          <ResizableHandle className="w-2 bg-gray-100 hover:bg-primary/20 transition-colors" />
          
          <ResizablePanel defaultSize={50} minSize={30} className="transition-all duration-200">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b flex justify-between items-center bg-white">
                <div className="flex items-center gap-2">
                  {getDocumentIcon()}
                  <h2 className="font-medium text-gray-700">Document Template</h2>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-500 uppercase">{documentType}</span>
                </div>
                <div className="flex gap-2">
                  <label htmlFor="import-document">
                    <Button variant="outline" size="sm" className="cursor-pointer transition-colors" asChild>
                      <div className="flex items-center gap-1">
                        <Upload className="h-4 w-4" />
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
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </Button>
                </div>
              </div>
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
