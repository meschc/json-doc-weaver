
import { useState, useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";

interface JsonEditorProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

const JsonEditor = ({ data, onChange }: JsonEditorProps) => {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setContent(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error("Error stringifying JSON data:", err);
    }
  }, [data]);

  const handleChange = (value: string) => {
    setContent(value);
    
    try {
      const parsed = JSON.parse(value);
      onChange(parsed);
      setError(null);
    } catch (err) {
      setError("Invalid JSON format");
      // Still update the content even if it's invalid
      onChange({ ...data, _invalidContent: value });
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
        className="h-full"
        basicSetup={{
          lineNumbers: true,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
          autocompletion: true,
          foldGutter: true,
        }}
      />
    </div>
  );
};

export default JsonEditor;
