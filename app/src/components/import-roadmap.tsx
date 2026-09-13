"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

const TEMPLATE = `# Ôn thi Đại học 2027

- Loại: exam
- Deadline: 2027-07-01
- Mô tả: Ôn thi tốt nghiệp và đại học khối A

## Chuyên đề

### Toán
- Đại số tổ hợp
- Giải tích
- Hình học không gian

### Lý
- Cơ học
- Điện từ

## Mốc quan trọng

- 2027-01-15: Thi thử lần 1
- 2027-05-01: Thi thử lần 2`;

export function ImportRoadmapButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Import từ file MD"
        className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        Import MD
      </button>
      {open && <ImportRoadmapModal onClose={() => setOpen(false)} />}
    </>
  );
}

function ImportRoadmapModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"file" | "paste">("file");
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ name: string; topics: number; milestones: number } | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setText(reader.result as string);
    reader.readAsText(file);
  }

  async function handleImport() {
    if (!text.trim()) {
      setError("Chưa có nội dung để import");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("text", text);

    const res = await fetch("/api/import-roadmap", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Lỗi import");
      setLoading(false);
      return;
    }

    setResult(data.summary);
    setLoading(false);
  }

  function handleDone() {
    router.refresh();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200/60 bg-white shadow-2xl shadow-slate-900/10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-slate-50 to-white rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/20">
              <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div>
              <h2 className="text-[15px] font-bold tracking-tight text-slate-900">Import lộ trình từ Markdown</h2>
              <p className="mt-0.5 text-[11px] text-slate-400">Viết lộ trình bằng text rồi import nhanh</p>
            </div>
          </div>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {result ? (
            <div className="text-center py-6">
              <p className="text-3xl mb-3">🏰</p>
              <h3 className="text-[15px] font-semibold text-slate-900">Import thành công!</h3>
              <p className="mt-2 text-[13px] text-slate-600">
                <span className="font-semibold text-indigo-600">{result.name}</span>
              </p>
              <div className="mt-3 flex justify-center gap-4 text-[13px] text-slate-500">
                <span>{result.topics} chuyên đề</span>
                <span>·</span>
                <span>{result.milestones} mốc quan trọng</span>
              </div>
              <button onClick={handleDone}
                className="mt-5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-2.5 text-[13px] font-bold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-500 hover:to-indigo-400 transition-all">
                Xem lộ trình
              </button>
            </div>
          ) : (
            <>
              {/* Mode tabs */}
              <div className="flex gap-1 rounded-lg bg-slate-100 p-0.5 mb-4">
                <button onClick={() => setMode("file")}
                  className={`flex-1 rounded-md px-3 py-1.5 text-[12px] font-medium transition-all ${mode === "file" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
                  Upload file .md
                </button>
                <button onClick={() => setMode("paste")}
                  className={`flex-1 rounded-md px-3 py-1.5 text-[12px] font-medium transition-all ${mode === "paste" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
                  Paste / Viết trực tiếp
                </button>
              </div>

              {mode === "file" ? (
                <div>
                  <input ref={fileRef} type="file" accept=".md,.txt,.markdown" onChange={handleFileChange} className="hidden" />
                  <button onClick={() => fileRef.current?.click()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-8 text-[13px] text-slate-500 hover:border-indigo-300 hover:text-indigo-500 transition-colors">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    {fileName || "Chọn file .md"}
                  </button>
                  {text && (
                    <div className="mt-3 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <pre className="whitespace-pre-wrap text-[12px] text-slate-600 font-mono">{text}</pre>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={14}
                    placeholder={TEMPLATE}
                    className="block w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-[12px] font-mono text-slate-800 placeholder:text-slate-300 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors resize-none"
                  />
                  <button onClick={() => setText(TEMPLATE)}
                    className="mt-2 text-[11px] font-medium text-indigo-500 hover:text-indigo-700 transition-colors">
                    Dùng template mẫu
                  </button>
                </div>
              )}

              {/* Format guide */}
              <div className="mt-4 rounded-lg bg-slate-50 p-3">
                <p className="text-[11px] font-semibold text-slate-600 mb-1.5">Định dạng:</p>
                <div className="text-[11px] text-slate-500 font-mono space-y-0.5">
                  <p><span className="text-indigo-500"># </span>Tên mục tiêu</p>
                  <p><span className="text-slate-400">- Loại: </span>exam | learning | skill | habit</p>
                  <p><span className="text-slate-400">- Deadline: </span>YYYY-MM-DD</p>
                  <p><span className="text-indigo-500">## </span>Chuyên đề</p>
                  <p><span className="text-indigo-500">### </span>Tên nhóm</p>
                  <p><span className="text-slate-400">- </span>Tên chuyên đề</p>
                  <p><span className="text-indigo-500">## </span>Mốc quan trọng</p>
                  <p><span className="text-slate-400">- YYYY-MM-DD: </span>Tên mốc</p>
                </div>
              </div>

              {error && <p className="mt-3 text-[13px] text-red-500">{error}</p>}
            </>
          )}
        </div>

        {/* Footer */}
        {!result && (
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-6 py-4">
            <button onClick={onClose} className="rounded-lg px-3 py-2 text-[13px] font-medium text-slate-500 hover:bg-slate-50 transition-colors">Huỷ</button>
            <button onClick={handleImport} disabled={loading || !text.trim()}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-5 py-2 text-[13px] font-bold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 transition-all">
              {loading ? "Đang import..." : "Import"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
