import React, { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, FileText } from 'lucide-react';

const ResumeUploader = ({ onFileSelected, uploading, progress }) => {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) onFileSelected(file);
    },
    [onFileSelected]
  );

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
        dragging ? 'border-primary bg-lightSky' : 'border-slate/25 bg-veryLightBlue'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onFileSelected(e.target.files[0])}
      />
      {uploading ? (
        <div>
          <FileText className="mx-auto text-primary mb-3 animate-pulse" size={40} />
          <p className="font-semibold text-navy mb-2">Analyzing your resume...</p>
          <div className="w-full max-w-xs mx-auto h-2 bg-lightSky rounded-full overflow-hidden">
            <motion.div className="h-2 bg-blue-gradient" animate={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : (
        <>
          <UploadCloud className="mx-auto text-primary mb-3" size={40} />
          <p className="font-semibold text-navy mb-1">Upload your resume</p>
          <p className="text-sm text-slate mb-4">Drag & Drop PDF or DOCX</p>
          <button onClick={() => inputRef.current.click()} className="btn-primary mx-auto">
            Browse Files
          </button>
          <p className="text-xs text-slate/70 mt-4">Supported: PDF, DOCX (max 8MB)</p>
        </>
      )}
    </div>
  );
};

export default ResumeUploader;
