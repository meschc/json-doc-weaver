
import { useState, useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { markdown } from "@codemirror/lang-markdown";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentEditorProps {
  content: string;
  onChange: (content: string) => void;
  jsonData: Record<string, any>;
}

const DocumentEditor = ({ content, onChange, jsonData }: DocumentEditorProps) => {
  const [showPlaceholders, setShowPlaceholders] = useState(true);
  const [fileType, setFileType] = useState<"markdown" | "html" | "text">("markdown");
  const [displayContent, setDisplayContent] = useState(content);
  
  // Detect file type from content
  useEffect(() => {
    if (content.includes("<!DOCTYPE html>") || content.includes("<html")) {
      setFileType("html");
    } else if (content.includes("#") || content.includes("**")) {
      setFileType("markdown");
    } else {
      setFileType("text");
    }
  }, [content]);

  // Process content with placeholders
  useEffect(() => {
    if (showPlaceholders) {
      let processed = content;
      const placeholderRegex = /{([^}]+)}/g;
      processed = processed.replace(placeholderRegex, (match, key) => {
        const value = jsonData[key];
        return value !== undefined ? String(value) : match;
      });
      setDisplayContent(processed);
    } else {
      setDisplayContent(content);
    }
  }, [content, jsonData, showPlaceholders]);

  const handleChange = (value: string) => {
    onChange(value);
    if (!showPlaceholders) {
      setDisplayContent(value);
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
      <div className="absolute top-2 right-2 z-10">
        <Button 
          variant="ghost"
          size="icon"
          onClick={() => setShowPlaceholders(!showPlaceholders)}
          className="bg-background/80 backdrop-blur-sm shadow-sm border border-border/30 hover:bg-background/90 transition-all"
          title={showPlaceholders ? "Show original template" : "Show with values"}
        >
          {showPlaceholders ? <EyeOff size={16} /> : <Eye size={16} />}
        </Button>
      </div>
      
      <CodeMirror
        value={displayContent}
        height="100%"
        extensions={[getLanguageExtension()]}
        onChange={handleChange}
        theme="light"
        basicSetup={{
          lineNumbers: true,
          highlightActiveLine: true,
          foldGutter: true,
          autocompletion: true,
        }}
        style={{
          fontSize: "14px",
          fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
        }}
        className="h-full document-editor"
      />
    </div>
  );
};

export default DocumentEditor;
