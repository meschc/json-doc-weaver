
import { useState, useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { markdown } from "@codemirror/lang-markdown";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import "./editor.css";

interface DocumentEditorProps {
  content: string;
  onChange: (content: string) => void;
  jsonData: Record<string, any>;
}

const DocumentEditor = ({
  content,
  onChange,
  jsonData
}: DocumentEditorProps) => {
  const [showPlaceholders, setShowPlaceholders] = useState(false); // Start with edit mode
  const [fileType, setFileType] = useState<"markdown" | "html" | "text" | "pdf">("markdown");
  const [displayContent, setDisplayContent] = useState(content);
  const [isEditing, setIsEditing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Error handling function
  const handleEditorError = (err: any) => {
    console.error("Document editor error:", err);
    setError("Error in document editor");
    // Continue with default content
    setDisplayContent(content);
  };

  // Detect file type from content
  useEffect(() => {
    try {
      if (content.includes("<!DOCTYPE html>") || content.includes("<html")) {
        setFileType("html");
      } else if (content.includes("#") || content.includes("**")) {
        setFileType("markdown");
      } else if (content.includes("%PDF-")) {
        setFileType("pdf");
      } else {
        setFileType("text");
      }
    } catch (err) {
      handleEditorError(err);
    }
  }, [content]);

  // Process content with placeholders - Fixed to replace ALL placeholders
  useEffect(() => {
    try {
      if (showPlaceholders) {
        let processed = content;
        const placeholderRegex = /{([^}]+)}/g;
        processed = processed.replace(placeholderRegex, (match, key) => {
          const value = jsonData[key];
          return value !== undefined ? String(value) : match;
        });
        setDisplayContent(processed);
        setIsEditing(false); // When showing placeholders, we're in view mode
      } else {
        setDisplayContent(content);
        setIsEditing(true); // When not showing placeholders, we're in edit mode
      }
      setError(null);
    } catch (err) {
      handleEditorError(err);
    }
  }, [content, jsonData, showPlaceholders]);

  // Auto-switch to edit mode when clicking editor
  const handleEditorClick = () => {
    if (!isEditing) {
      setShowPlaceholders(false);
    }
  };

  // Auto-switch to edit mode when user starts typing
  const handleChange = (value: string) => {
    try {
      onChange(value);
      if (showPlaceholders) {
        setShowPlaceholders(false);
      } else {
        setDisplayContent(value);
      }
      setError(null);
    } catch (err) {
      handleEditorError(err);
    }
  };

  // Get the appropriate language extension based on file type
  const getLanguageExtension = () => {
    switch (fileType) {
      case "html":
        return html();
      case "markdown":
        return markdown();
      default:
        return [];
    }
  };

  return (
    <div className="h-full relative">
      {error && (
        <div className="absolute top-2 left-2 z-20 bg-destructive text-destructive-foreground px-3 py-1.5 rounded-md text-sm">
          {error}
        </div>
      )}
      <div className="absolute top-2 right-2 z-10">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setShowPlaceholders(!showPlaceholders)} 
          title={showPlaceholders ? "Show original template" : "Show with values"} 
          className={`backdrop-blur-sm shadow-sm border border-border/30 transition-all rounded-full mx-0 text-base font-normal ${showPlaceholders ? 'bg-black text-white' : 'bg-zinc-50'}`}
        >
          {showPlaceholders ? <EyeOff size={16} className="text-white" /> : <Eye size={16} className="text-black font-bold" />}
        </Button>
      </div>
      
      <div className="h-full w-full" onClick={handleEditorClick}>
        <CodeMirror 
          value={displayContent} 
          height="100%" 
          width="100%" 
          extensions={[getLanguageExtension()]} 
          onChange={handleChange} 
          theme="light" 
          editable={isEditing}
          basicSetup={{
            lineNumbers: false,
            highlightActiveLine: isEditing,
            foldGutter: true,
            autocompletion: isEditing
          }} 
          style={{
            fontSize: "14px",
            fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
            width: "100%",
            height: "100%"
          }} 
          className="h-full document-editor" 
        />
      </div>
    </div>
  );
};

export default DocumentEditor;
