
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
    setContent(JSON.stringify(data, null, 2));
  }, [data]);

  const handleChange = (value: string) => {
    setContent(value);
    
    try {
      const parsed = JSON.parse(value);
      onChange(parsed);
      setError(null);
    } catch (err) {
      setError("Invalid JSON format");
    }
  };

  return (
    <div className="relative h-full">
      {error && (
        <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground px-2 py-1 rounded text-sm animate-fade-in z-10">
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
