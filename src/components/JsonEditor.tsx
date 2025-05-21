import { useState, useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import "./editor.css";

interface JsonEditorProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

const JsonEditor = ({ data, onChange }: JsonEditorProps) => {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [internalUpdate, setInternalUpdate] = useState(false);

  useEffect(() => {
    // Only update content from props if not an internal update
    if (!internalUpdate) {
      try {
        // If there's invalid content stored, use that instead
        if (data._invalidContent) {
          setContent(data._invalidContent);
        } else {
          setContent(JSON.stringify(data, null, 2));
        }
      } catch (err) {
        console.error("Error stringifying JSON data:", err);
      }
    }
    setInternalUpdate(false);
  }, [data, internalUpdate]);

  const handleChange = (value: string) => {
    setContent(value);
    setInternalUpdate(true);
    
    try {
      const parsed = JSON.parse(value);
      onChange(parsed);
      setError(null);
    } catch (err) {
      // Only show error when user stops typing for a bit
      const timer = setTimeout(() => {
        setError("Invalid JSON format");
      }, 1000);
      
      // Still update the content even if it's invalid
      onChange({ ...data, _invalidContent: value });
      
      return () => clearTimeout(timer);
    }
  };

  return (
    <div className="relative h-full">
      {error && (
        <div className="absolute top-2 right-2 bg-destructive/90 text-destructive-foreground px-3 py-1.5 rounded-md text-sm animate-fade-in z-10 backdrop-blur-sm shadow-md">
          {error}
        </div>
      )}
      <CodeMirror
        value={content}
        height="100%"
        extensions={[json()]}
        onChange={handleChange}
        theme="light"
        className="h-full json-editor"
        basicSetup={{
          lineNumbers: true,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
          autocompletion: true,
          foldGutter: true,
        }}
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
};

export default JsonEditor;
