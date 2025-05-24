
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

  useEffect(() => {
    try {
      if (data && data._invalidContent) {
        setContent(data._invalidContent);
      } else {
        setContent(JSON.stringify(data || {}, null, 2));
      }
      setError(null);
    } catch (err) {
      console.error("Error stringifying JSON data:", err);
      setError("Error processing JSON data");
      setContent("{}");
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
      onChange({ ...data, _invalidContent: value });
    }
  };

  return (
    <div className="relative h-full">
      {error && (
        <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1.5 rounded-md text-sm z-10">
          {error}
        </div>
      )}
      <CodeMirror
        value={content}
        height="100%"
        extensions={[json()]}
        onChange={handleChange}
        theme="light"
        className="h-full w-full"
        basicSetup={{
          lineNumbers: true,
          highlightActiveLine: true,
          autocompletion: true,
          foldGutter: true,
        }}
      />
    </div>
  );
};

export default JsonEditor;
