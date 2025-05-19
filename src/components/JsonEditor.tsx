
import { useState, useEffect } from "react";

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

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    try {
      const parsed = JSON.parse(newContent);
      onChange(parsed);
      setError(null);
    } catch (err) {
      setError("Invalid JSON format");
    }
  };

  return (
    <div className="relative h-full">
      {error && (
        <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground px-2 py-1 rounded text-sm animate-fade-in">
          {error}
        </div>
      )}
      <textarea
        className="editor-container focus:outline-none resize-none"
        value={content}
        onChange={handleChange}
        spellCheck="false"
      />
    </div>
  );
};

export default JsonEditor;
