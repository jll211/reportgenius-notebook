import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
}

export const Editor = ({ content, onChange }: EditorProps) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <EditorContent 
      editor={editor} 
      className="prose max-w-none"
    />
  );
};