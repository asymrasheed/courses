"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { TextAlign } from "@tiptap/extension-text-align";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Image } from "@tiptap/extension-image";
import toast from "react-hot-toast";

function icon(props) {
  return {
    width: 15,
    height: 15,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    ...props,
  };
}

const IconUndo = (p) => (
  <svg {...icon(p)}>
    <path d="M7 7 3.5 10.5 7 14" />
    <path d="M3.5 10.5H14a5.5 5.5 0 0 1 0 11h-2" />
  </svg>
);
const IconRedo = (p) => (
  <svg {...icon(p)}>
    <path d="M17 7l3.5 3.5L17 14" />
    <path d="M20.5 10.5H10a5.5 5.5 0 0 0 0 11h2" />
  </svg>
);
const IconBold = (p) => (
  <svg {...icon(p)}>
    <path d="M7 4.5h6a3.3 3.3 0 0 1 0 6.6H7Z" />
    <path d="M7 11.1h7a3.4 3.4 0 0 1 0 6.9H7Z" />
  </svg>
);
const IconItalic = (p) => (
  <svg {...icon(p)}>
    <path d="M11 4.5h6" />
    <path d="M7 19.5h6" />
    <path d="M14 4.5 10 19.5" />
  </svg>
);
const IconUnderline = (p) => (
  <svg {...icon(p)}>
    <path d="M6 4.5v6.5a6 6 0 0 0 12 0V4.5" />
    <path d="M5 19.5h14" />
  </svg>
);
const IconStrike = (p) => (
  <svg {...icon(p)}>
    <path d="M5 12h14" />
    <path d="M8 6.5c1-1.3 2.6-2 4.5-2 3 0 5 1.4 5 3.5" />
    <path d="M7 17c1 1.5 2.9 2.5 5.3 2.5 3 0 5.2-1.4 5.2-3.6" />
  </svg>
);
const IconInlineCode = (p) => (
  <svg {...icon(p)}>
    <path d="M9 6.5 4 12l5 5.5" />
    <path d="M15 6.5 20 12l-5 5.5" />
  </svg>
);
const IconHighlight = (p) => (
  <svg {...icon(p)}>
    <path d="M13.5 6.5 17.5 10.5 10 18H6v-4Z" />
    <path d="M4 21h6" />
  </svg>
);
const IconSuperscript = (p) => (
  <svg {...icon(p)}>
    <text x="2.5" y="19" fontSize="13" fontFamily="inherit" fill="currentColor" stroke="none">
      x
    </text>
    <text x="13.5" y="10" fontSize="9" fontFamily="inherit" fill="currentColor" stroke="none">
      2
    </text>
  </svg>
);
const IconSubscript = (p) => (
  <svg {...icon(p)}>
    <text x="2.5" y="15" fontSize="13" fontFamily="inherit" fill="currentColor" stroke="none">
      x
    </text>
    <text x="13.5" y="21.5" fontSize="9" fontFamily="inherit" fill="currentColor" stroke="none">
      2
    </text>
  </svg>
);
const IconBulletList = (p) => (
  <svg {...icon(p)}>
    <circle cx="4.5" cy="6" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="4.5" cy="12" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="4.5" cy="18" r="1.1" fill="currentColor" stroke="none" />
    <path d="M8.5 6h11" />
    <path d="M8.5 12h11" />
    <path d="M8.5 18h11" />
  </svg>
);
const IconOrderedList = (p) => (
  <svg {...icon(p)}>
    <path d="M8.5 6h11" />
    <path d="M8.5 12h11" />
    <path d="M8.5 18h11" />
    <path d="M4 5.5h1v3" />
    <path d="M4 8.5h1.6" />
    <path d="M4 12.2c0-.7.6-1.2 1.2-1.2.7 0 1.2.5 1.2 1.1 0 .5-.3.8-.7 1.1L4 14.8h2.4" />
  </svg>
);
const IconTaskList = (p) => (
  <svg {...icon(p)}>
    <rect x="3.5" y="4.5" width="4" height="4" rx="1" />
    <path d="M4.3 6.5 5.2 7.3 6.8 5.5" />
    <path d="M10.5 6.5h9.5" />
    <rect x="3.5" y="14.5" width="4" height="4" rx="1" />
    <path d="M11 16.5h9" />
  </svg>
);
const IconBlockquote = (p) => (
  <svg {...icon(p)}>
    <path d="M7 8.5c-2 0-3 1.4-3 3.3 0 1.7 1.1 2.9 2.6 2.9 1.4 0 2.4-1 2.4-2.4 0-1.2-.8-2-1.9-2.1.2-1.4 1.2-2.3 2.4-2.6" />
    <path d="M16 8.5c-2 0-3 1.4-3 3.3 0 1.7 1.1 2.9 2.6 2.9 1.4 0 2.4-1 2.4-2.4 0-1.2-.8-2-1.9-2.1.2-1.4 1.2-2.3 2.4-2.6" />
  </svg>
);
const IconCodeBlock = (p) => (
  <svg {...icon(p)}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
    <path d="M9 9.5 6.5 12l2.5 2.5" />
    <path d="M15 9.5 17.5 12l-2.5 2.5" />
  </svg>
);
const IconHorizontalRule = (p) => (
  <svg {...icon(p)}>
    <path d="M4 12h16" />
  </svg>
);
const IconAlignLeft = (p) => (
  <svg {...icon(p)}>
    <path d="M4 6h16" />
    <path d="M4 11h9" />
    <path d="M4 16h13" />
    <path d="M4 21h7" />
  </svg>
);
const IconAlignCenter = (p) => (
  <svg {...icon(p)}>
    <path d="M4 6h16" />
    <path d="M7 11h10" />
    <path d="M5.5 16h13" />
    <path d="M8 21h8" />
  </svg>
);
const IconAlignRight = (p) => (
  <svg {...icon(p)}>
    <path d="M4 6h16" />
    <path d="M11 11h9" />
    <path d="M7 16h13" />
    <path d="M13 21h7" />
  </svg>
);
const IconAlignJustify = (p) => (
  <svg {...icon(p)}>
    <path d="M4 6h16" />
    <path d="M4 11h16" />
    <path d="M4 16h16" />
    <path d="M4 21h10" />
  </svg>
);
const IconLink = (p) => (
  <svg {...icon(p)}>
    <path d="M9.5 14.5 14.5 9.5" />
    <path d="M11 7l1.3-1.3a3.7 3.7 0 0 1 5.3 5.3L16 12.5" />
    <path d="M13 17l-1.3 1.3a3.7 3.7 0 0 1-5.3-5.3L8 11.5" />
  </svg>
);
const IconImagePlus = (p) => (
  <svg {...icon(p)}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
    <circle cx="8.5" cy="9.5" r="1.5" />
    <path d="M4 17l5-5 4 4 3-3 4 4" />
  </svg>
);
const IconClearFormat = (p) => (
  <svg {...icon(p)}>
    <path d="M16 4.5 20 8.5 9.5 19H6a1 1 0 0 1-.7-.3L3 16.4a1 1 0 0 1 0-1.4Z" />
    <path d="M9.5 19H20" />
  </svg>
);
const IconSpinner = (p) => (
  <svg {...icon(p)} className={`animate-spin ${p.className || ""}`}>
    <path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5" />
  </svg>
);

function ToolbarButton({ active, disabled, onClick, children, title }) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`p-1.5 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        active ? "bg-gold-400 text-ink-950" : "text-cream-300 hover:bg-white/8 hover:text-cream-100"
      }`}
    >
      {children}
    </button>
  );
}

function Separator() {
  return <span className="w-px h-4 bg-white/10 mx-1 shrink-0" />;
}

export default function RichTextEditor({ value, onChange, placeholder, uploadFolder }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
        link: { openOnClick: false, autolink: true },
      }),
      Placeholder.configure({ placeholder: placeholder || "Start typing…" }),
      Highlight,
      TaskList,
      TaskItem.configure({ nested: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Subscript,
      Superscript,
      Image,
    ],
    content: value || "",
    editorProps: {
      attributes: { class: "prose-content rte-editable" },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML() && !editor.isFocused) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) return null;

  function setLink() {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  function setBlock(value) {
    if (value === "paragraph") {
      editor.chain().focus().setParagraph().run();
    } else {
      editor
        .chain()
        .focus()
        .setHeading({ level: Number(value.replace("h", "")) })
        .run();
    }
  }

  function triggerImageUpload() {
    fileInputRef.current?.click();
  }

  async function handleImageSelected(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/uploads?folder=${encodeURIComponent(uploadFolder || "misc")}`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Upload failed");
      editor.chain().focus().setImage({ src: data.url }).run();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  }

  const activeBlock = [1, 2, 3, 4].reduce(
    (acc, level) => (editor.isActive("heading", { level }) ? `h${level}` : acc),
    "paragraph"
  );

  return (
    <div className="field-input p-0 overflow-hidden">
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-white/8 flex-wrap">
        <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()}>
          <IconUndo />
        </ToolbarButton>
        <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()}>
          <IconRedo />
        </ToolbarButton>

        <Separator />

        <select
          title="Paragraph style"
          value={activeBlock}
          onChange={(e) => setBlock(e.target.value)}
          className="text-xs bg-transparent text-cream-300 hover:text-cream-100 rounded-md px-1.5 py-1.5 outline-none cursor-pointer border-none"
        >
          <option className="bg-ink-900" value="paragraph">
            Paragraph
          </option>
          <option className="bg-ink-900" value="h1">
            Heading 1
          </option>
          <option className="bg-ink-900" value="h2">
            Heading 2
          </option>
          <option className="bg-ink-900" value="h3">
            Heading 3
          </option>
          <option className="bg-ink-900" value="h4">
            Heading 4
          </option>
        </select>

        <Separator />

        <ToolbarButton
          title="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <IconBold />
        </ToolbarButton>
        <ToolbarButton
          title="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <IconItalic />
        </ToolbarButton>
        <ToolbarButton
          title="Underline"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <IconUnderline />
        </ToolbarButton>
        <ToolbarButton
          title="Strikethrough"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <IconStrike />
        </ToolbarButton>
        <ToolbarButton
          title="Inline code"
          active={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <IconInlineCode />
        </ToolbarButton>
        <ToolbarButton
          title="Highlight"
          active={editor.isActive("highlight")}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
        >
          <IconHighlight />
        </ToolbarButton>
        <ToolbarButton
          title="Superscript"
          active={editor.isActive("superscript")}
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
        >
          <IconSuperscript />
        </ToolbarButton>
        <ToolbarButton
          title="Subscript"
          active={editor.isActive("subscript")}
          onClick={() => editor.chain().focus().toggleSubscript().run()}
        >
          <IconSubscript />
        </ToolbarButton>

        <Separator />

        <ToolbarButton
          title="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <IconBulletList />
        </ToolbarButton>
        <ToolbarButton
          title="Numbered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <IconOrderedList />
        </ToolbarButton>
        <ToolbarButton
          title="Task list"
          active={editor.isActive("taskList")}
          onClick={() => editor.chain().focus().toggleTaskList().run()}
        >
          <IconTaskList />
        </ToolbarButton>

        <Separator />

        <ToolbarButton
          title="Align left"
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <IconAlignLeft />
        </ToolbarButton>
        <ToolbarButton
          title="Align center"
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <IconAlignCenter />
        </ToolbarButton>
        <ToolbarButton
          title="Align right"
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <IconAlignRight />
        </ToolbarButton>
        <ToolbarButton
          title="Justify"
          active={editor.isActive({ textAlign: "justify" })}
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        >
          <IconAlignJustify />
        </ToolbarButton>

        <Separator />

        <ToolbarButton
          title="Quote"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <IconBlockquote />
        </ToolbarButton>
        <ToolbarButton
          title="Code block"
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <IconCodeBlock />
        </ToolbarButton>
        <ToolbarButton title="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <IconHorizontalRule />
        </ToolbarButton>

        <Separator />

        <ToolbarButton title="Link" active={editor.isActive("link")} onClick={setLink}>
          <IconLink />
        </ToolbarButton>
        <ToolbarButton title="Insert image" disabled={uploading} onClick={triggerImageUpload}>
          {uploading ? <IconSpinner /> : <IconImagePlus />}
        </ToolbarButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageSelected}
        />

        <Separator />

        <ToolbarButton
          title="Clear formatting"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        >
          <IconClearFormat />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} className="px-3.5 py-3 min-h-[220px] max-h-[520px] overflow-y-auto" />
    </div>
  );
}
