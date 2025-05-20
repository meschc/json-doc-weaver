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
const DocumentEditor = ({
  content,
  onChange,
  jsonData
}: DocumentEditorProps) => {
  const [showPlaceholders, setShowPlaceholders] = useState(false); // Start with edit mode
  const [fileType, setFileType] = useState<"markdown" | "html" | "text">("markdown");
  const [displayContent, setDisplayContent] = useState(content);
  const [isEditing, setIsEditing] = useState(true);

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

  // Process content with placeholders - Fixed to replace ALL placeholders
  useEffect(() => {
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
  }, [content, jsonData, showPlaceholders]);

  // Handle attempts to edit in view mode
  const handleEditorClick = () => {
    if (!isEditing) {
      setShowPlaceholders(false);
    }
  };

  // Auto-switch to edit mode when user starts typing
  const handleChange = (value: string) => {
    onChange(value);
    if (showPlaceholders) {
      setShowPlaceholders(false);
    } else {
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
  return <div className="h-full relative">
      <div className="absolute top-2 right-2 z-10">
        <Button variant="ghost" size="icon" onClick={() => setShowPlaceholders(!showPlaceholders)} title={showPlaceholders ? "Show original template" : "Show with values"} className="backdrop-blur-sm shadow-sm border border-border/30 transition-all rounded-full bg-editor-json mx-0 text-base font-normal">
          {showPlaceholders ? <EyeOff size={16} className="text-white" /> : <Eye size={16} className="text-black font-bold" />}
        </Button>
      </div>
      
      <div className="h-full w-full" onClick={handleEditorClick}>
        <CodeMirror value={displayContent} height="100%" width="100%" extensions={[getLanguageExtension()]} onChange={handleChange} theme="light" editable={isEditing} basicSetup={{
        lineNumbers: false,
        highlightActiveLine: isEditing,
        foldGutter: true,
        autocompletion: isEditing
      }} style={{
        fontSize: "14px",
        fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
        width: "100%" // Ensure it fills container width
      }} className="h-full document-editor document-portable" />
      </div>
    </div>;
};
export default DocumentEditor;