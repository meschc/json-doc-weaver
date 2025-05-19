
import { useState, useEffect, useRef } from "react";

interface DocumentEditorProps {
  content: string;
  onChange: (content: string) => void;
  jsonData: Record<string, any>;
}

const DocumentEditor = ({ content, onChange, jsonData }: DocumentEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (editorRef.current) {
      highlightPlaceholders();
    }
  }, [content, jsonData]);

  const highlightPlaceholders = () => {
    if (!editorRef.current) return;
    
    let html = content;
    
    // Add highlighting for each json key found in the content
    Object.keys(jsonData).forEach(key => {
      const placeholder = `{${key}}`;
      const regex = new RegExp(placeholder, 'g');
      
      html = html.replace(regex, `<span class="json-highlight">${placeholder}</span>`);
    });
    
    editorRef.current.innerHTML = html;
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.innerText;
    onChange(newContent);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  return (
    <div 
      ref={editorRef}
      className="editor-container whitespace-pre-wrap focus:outline-none"
      contentEditable 
      onInput={handleInput}
      onPaste={handlePaste}
      spellCheck="false"
    />
  );
};

export default DocumentEditor;
