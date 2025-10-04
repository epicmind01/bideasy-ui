import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { useCallback, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    textAlign: {
      setTextAlign: (alignment: 'left' | 'center' | 'right' | 'justify') => ReturnType;
    };
  }
}

interface EditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export const Editor: React.FC<EditorProps> = ({
  value,
  onChange,
  placeholder = 'Write something...',
  className = '',
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (html !== '<p></p>' || value) { // Prevent empty updates unless we're clearing the content
        onChange(html);
      }
    },
  });

  // Update editor content when value prop changes from outside
  useEffect(() => {
    if (editor && value !== undefined && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  const setLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden bg-white ${className}`}>
      <style jsx global>{`
        .ProseMirror {
          min-height: 150px;
          padding: 0.5rem;
          outline: none;
        }
        .ProseMirror p {
          margin: 0.5em 0;
          line-height: 1.5;
        }
        .ProseMirror h1, 
        .ProseMirror h2, 
        .ProseMirror h3 {
          line-height: 1.3;
          margin: 1em 0 0.5em 0;
        }
        .ProseMirror ul,
        .ProseMirror ol {
          padding: 0 1rem;
          margin: 0.5em 0;
        }
        .ProseMirror:focus {
          outline: none;
        }
      `}</style>
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50">
        {/* Text Formatting */}
        <div className="flex items-center border-r border-gray-200 pr-2 mr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded ${editor.isActive('bold') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="Bold"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded ${editor.isActive('italic') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="Italic"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded ${editor.isActive('underline') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="Underline"
          >
            U
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 rounded ${editor.isActive('strike') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="Strikethrough"
          >
            S
          </button>
        </div>

        {/* Text Alignment */}
        <div className="flex items-center border-r border-gray-200 pr-2 mr-2">
          <select
            value={editor.getAttributes('textAlign').textAlign || 'left'}
            onChange={(e) => editor.chain().focus().setTextAlign(e.target.value as any).run()}
            className="text-sm p-1 border rounded"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
            <option value="justify">Justify</option>
          </select>
        </div>

        {/* Text Color */}
        <div className="flex items-center border-r border-gray-200 pr-2 mr-2">
          <input
            type="color"
            onInput={(e: any) => editor.chain().focus().setColor(e.target.value).run()}
            value={editor.getAttributes('textStyle').color || '#000000'}
            title="Text Color"
            className="w-8 h-8 p-0 border-0 rounded cursor-pointer"
          />
        </div>

        {/* Headings */}
        <div className="flex items-center border-r border-gray-200 pr-2 mr-2">
          <select
            value={editor.isActive('heading', { level: 1 }) ? 'h1' :
                   editor.isActive('heading', { level: 2 }) ? 'h2' :
                   editor.isActive('heading', { level: 3 }) ? 'h3' : 'paragraph'}
            onChange={(e) => {
              const value = e.target.value;
              if (value === 'paragraph') {
                editor.chain().focus().setParagraph().run();
              } else {
                const level = parseInt(value.replace('h', '')) as 1 | 2 | 3;
                editor.chain().focus().toggleHeading({ level }).run();
              }
            }}
            className="text-sm p-1 border rounded"
          >
            <option value="paragraph">Normal</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
          </select>
        </div>

        {/* Lists */}
        <div className="flex items-center border-r border-gray-200 pr-2 mr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded ${editor.isActive('bulletList') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="Bullet List"
          >
            •
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded ${editor.isActive('orderedList') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="Numbered List"
          >
            1.
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
            className="p-2 rounded hover:bg-gray-100"
            disabled={!editor.can().sinkListItem('listItem')}
            title="Indent"
          >
            →
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().liftListItem('listItem').run()}
            className="p-2 rounded hover:bg-gray-100"
            disabled={!editor.can().liftListItem('listItem')}
            title="Outdent"
          >
            ←
          </button>
        </div>

        {/* Link */}
        <div className="flex items-center border-r border-gray-200 pr-2 mr-2">
          <button
            type="button"
            onClick={setLink}
            className={`p-2 rounded ${editor.isActive('link') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            title="Add Link"
          >
            🔗
          </button>
        </div>

        {/* Preview Button */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="p-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
            title="Preview"
          >
            👁️ Preview
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="min-h-[150px] max-h-[400px] overflow-y-auto p-2">
        <EditorContent 
          editor={editor} 
          placeholder={placeholder}
          className="min-h-[150px] p-2 focus:outline-none"
        />
      </div>

      {/* Preview Modal */}
      <Transition appear show={isPreviewOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsPreviewOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 mb-4"
                  >
                    Preview
                  </Dialog.Title>
                  <div 
                    className="prose max-w-none mt-2 p-4 border rounded-lg min-h-[200px] max-h-[70vh] overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: editor.getHTML() }}
                  />
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setIsPreviewOpen(false)}
                    >
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default Editor;