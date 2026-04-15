import React, { useState } from 'react';
import { Upload, Image as ImageIcon, CheckCircle, Sparkles, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';

const UploadCard = ({
  title,
  description,
  icon: Icon,
  files,
  isUploaded,
  isUploading,
  preview,
  onDrop,
  onUpload,
  inputRef,
  onChange,
  multiple = false,
  accept = "image/*",
  onLoadSample,
  sampleLabel,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (onDrop) onDrop(e);
  };

  const hasContent = files?.length > 0 || preview;

  return (
    <Card className="h-full card-hover" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader style={{ paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
          <div style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '0.65rem',
            background: 'linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(99,102,241,0.2) 100%)',
            border: '1px solid rgba(99,102,241,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Icon size={18} color="#93c5fd" />
          </div>
          <div style={{ flex: 1 }}>
            <CardTitle style={{ fontSize: '1rem', color: '#f1f5f9', marginBottom: '0.15rem' }}>
              {title}
            </CardTitle>
          </div>
          {isUploaded && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              background: 'rgba(34,197,94,0.12)',
              border: '1px solid rgba(34,197,94,0.3)',
              color: '#4ade80',
              fontSize: '0.7rem',
              fontWeight: 600,
            }}>
              <CheckCircle size={10} />
              <span>Uploaded</span>
            </div>
          )}
        </div>
        <CardDescription style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: '1.5' }}>
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: 0 }}>

        {/* Sample Data Banner */}
        {onLoadSample && (
          <button
            onClick={onLoadSample}
            style={{
              width: '100%',
              padding: '0.6rem 0.875rem',
              borderRadius: '0.65rem',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(168,85,247,0.08) 100%)',
              border: '1px solid rgba(99,102,241,0.25)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              color: '#a78bfa',
              fontSize: '0.8rem',
              fontWeight: 600,
              transition: 'all 0.25s ease',
              textAlign: 'center',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)';
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(168,85,247,0.14) 100%)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.15)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(99,102,241,0.25)';
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(168,85,247,0.08) 100%)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Sparkles size={14} />
            <span>{sampleLabel || 'Load Sample Images'}</span>
          </button>
        )}

        {/* Drop Zone */}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            flex: 1,
            border: `2px dashed ${isDragOver ? 'rgba(99,102,241,0.7)' : hasContent ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: '0.85rem',
            padding: '1.5rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            background: isDragOver
              ? 'rgba(99,102,241,0.08)'
              : hasContent
              ? 'rgba(59,130,246,0.04)'
              : 'rgba(255,255,255,0.02)',
            boxShadow: isDragOver ? '0 0 0 4px rgba(99,102,241,0.1), inset 0 0 24px rgba(99,102,241,0.04)' : 'none',
            minHeight: '9rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <input
            ref={inputRef}
            type="file"
            multiple={multiple}
            accept={accept}
            onChange={onChange}
            style={{ display: 'none' }}
          />

          {preview ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
              <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
                <img
                  src={preview}
                  alt="Preview"
                  style={{ maxHeight: '10rem', borderRadius: '0.5rem', objectFit: 'contain', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                />
              </div>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Click to change</span>
            </div>
          ) : files?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '3rem', height: '3rem', borderRadius: '50%',
                background: 'rgba(34,197,94,0.12)',
                border: '1px solid rgba(34,197,94,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CheckCircle size={20} color="#4ade80" />
              </div>
              <span style={{ color: '#93c5fd', fontWeight: 600, fontSize: '0.875rem' }}>
                {files.length} file{files.length > 1 ? 's' : ''} selected
              </span>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Click to change</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '3rem', height: '3rem', borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {multiple ? <Upload size={18} color="#64748b" /> : <ImageIcon size={18} color="#64748b" />}
              </div>
              <span style={{ color: '#94a3b8', fontWeight: 500, fontSize: '0.85rem' }}>
                Drop {multiple ? 'files' : 'a file'} here
              </span>
              <span style={{ fontSize: '0.72rem', color: '#475569' }}>or click to browse</span>
            </div>
          )}
        </div>

        {/* File list for multi-select */}
        {files?.length > 0 && multiple && (
          <div style={{
            maxHeight: '6rem',
            overflowY: 'auto',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '0.5rem',
            padding: '0.4rem',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            {files.map((file, i) => (
              <div key={i} style={{
                fontSize: '0.72rem',
                color: '#94a3b8',
                padding: '0.2rem 0.4rem',
                borderRadius: '0.25rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>{file.name}</div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter style={{ paddingTop: '0.5rem' }}>
        <Button
          onClick={onUpload}
          disabled={!files?.length || isUploading}
          variant="gradient"
          style={{ width: '100%' }}
        >
          {isUploading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                width: '1rem', height: '1rem', borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: 'white',
                animation: 'spin 0.8s linear infinite',
                display: 'inline-block',
              }} />
              Uploading...
            </span>
          ) : (
            <span>Upload {multiple ? 'Reference Photos' : 'Class Photo'}</span>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UploadCard;
