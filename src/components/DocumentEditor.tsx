
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

const DocumentEditor = ({ content, onChange, jsonData }: DocumentEditorProps) => {
  const [showPlaceholders, setShowPlaceholders] = useState(false);
  const [fileType, setFileType] = useState<"markdown" | "html" | "text">("text");
  const [displayContent, setDisplayContent] = useState(content || "");

  useEffect(() => {
    if (!content) {
      setFileType("text");
      return;
    }
    
    if (content.includes("<!DOCTYPE html>") || content.includes("<html")) {
      setFileType("html");
    } else if (content.includes("#") || content.includes("**")) {
      setFileType("markdown");
    } else {
      setFileType("text");
    }
  }, [content]);

  useEffect(() => {
    if (showPlaceholders && content) {
      let processed = content;
      const placeholderRegex = /{([^}]+)}/g;
      processed = processed.replace(placeholderRegex, (match, key) => {
        const value = jsonData[key];
        return value !== undefined ? String(value) : match;
      });
      setDisplayContent(processed);
    } else {
      setDisplayContent(content || "");
    }
  }, [content, jsonData, showPlaceholders]);

  const handleChange = (value: string) => {
    onChange(value);
    if (showPlaceholders) {
      setShowPlaceholders(false);
    }
  };

  const getLanguageExtension = () => {
    switch (fileType) {
      case "html":
        return [html()];
      case "markdown":
        return [markdown()];
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
          className="bg-white shadow-sm border"
        >
          {showPlaceholders ? <EyeOff size={16} /> : <Eye size={16} />}
        </Button>
      </div>
      
      <CodeMirror 
        value={displayContent} 
        height="100%" 
        extensions={getLanguageExtension()} 
        onChange={handleChange} 
        theme="light" 
        editable={!showPlaceholders}
        basicSetup={{
          lineNumbers: false,
          highlightActiveLine: !showPlaceholders,
          foldGutter: true,
          autocompletion: !showPlaceholders
        }} 
        className="h-full w-full" 
      />
    </div>
  );
};

export default DocumentEditor;
