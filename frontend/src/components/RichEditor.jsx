import { useRef, useEffect } from 'react';

// We use Quill directly via CDN to avoid version issues
let Quill;

const TOOLBAR = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ color: [] }, { background: [] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['blockquote', 'code-block'],
  ['link', 'image'],
  ['clean'],
];

export default function RichEditor({ value, onChange, placeholder = 'Write notes here...' }) {
  const containerRef = useRef(null);
  const quillRef = useRef(null);
  const isMounted = useRef(false);

  useEffect(() => {
    if (!containerRef.current || isMounted.current) return;
    isMounted.current = true;

    // Dynamically load Quill from CDN if not already loaded
    function init() {
      if (typeof window.Quill === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.quilljs.com/1.3.6/quill.min.js';
        script.onload = createEditor;
        document.head.appendChild(script);
      } else {
        createEditor();
      }
    }

    function createEditor() {
      if (!containerRef.current) return;
      quillRef.current = new window.Quill(containerRef.current, {
        theme: 'snow',
        placeholder,
        modules: { toolbar: TOOLBAR },
      });

      if (value) quillRef.current.root.innerHTML = value;

      quillRef.current.on('text-change', () => {
        onChange(quillRef.current.root.innerHTML);
      });
    }

    init();

    return () => {
      isMounted.current = false;
    };
  }, []);

  // Sync external value changes (e.g. when editing existing content)
  useEffect(() => {
    if (quillRef.current && value !== quillRef.current.root.innerHTML) {
      const sel = quillRef.current.getSelection();
      quillRef.current.root.innerHTML = value || '';
      if (sel) quillRef.current.setSelection(sel);
    }
  }, [value]);

  return (
    <div>
      <div ref={containerRef} style={{ minHeight: '200px' }} />
    </div>
  );
}
