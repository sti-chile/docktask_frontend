import React, { useState, useEffect } from 'react';
import { fetchLinkPreview } from '../api/previewApi';
import '../styles/LinkPreview.css';

/**
 * LinkPreview — Tarjeta de previsualización de enlaces.
 * Extrae metadata (OG tags, título, descripción, favicon) vía Obscura.
 * 
 * @param {{ url: string }} props
 */
const LinkPreview = ({ url }) => {
  const [state, setState] = useState('loading'); // loading | loaded | error
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!url) return;

    let cancelled = false;
    setState('loading');
    setData(null);

    fetchLinkPreview(url)
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setState('loaded');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState('error');
        }
      });

    return () => { cancelled = true; };
  }, [url]);

  // ─── Loading Skeleton ───
  if (state === 'loading') {
    return (
      <div className="link-preview-skeleton" aria-label="Cargando vista previa...">
        <div className="sk-thumb" />
        <div className="sk-content">
          <div className="sk-line" />
          <div className="sk-line" />
        </div>
      </div>
    );
  }

  // ─── Error Fallback ───
  if (state === 'error' || !data) {
    return (
      <div className="link-preview-error">
        <a href={url} target="_blank" rel="noopener noreferrer">
          {url}
        </a>
      </div>
    );
  }

  // ─── Loaded Card ───
  const { title, description, image, favicon, site_name } = data;
  const domain = new URL(url).hostname;

  return (
    <div className="link-preview-card">
      <a href={url} target="_blank" rel="noopener noreferrer">
        {/* Thumbnail */}
        <div className="link-preview-thumb">
          {image ? (
            <img src={image} alt="" loading="lazy" referrerPolicy="no-referrer" />
          ) : favicon ? (
            <img src={favicon} alt="" className="link-preview-favicon-only" referrerPolicy="no-referrer" />
          ) : (
            <span style={{ fontSize: 24, opacity: 0.3 }}>🔗</span>
          )}
        </div>

        {/* Content */}
        <div className="link-preview-content">
          <div className="link-preview-title">
            {title || domain}
          </div>
          {description && (
            <div className="link-preview-desc">{description}</div>
          )}
          <div className="link-preview-meta">
            {favicon && <img src={favicon} alt="" referrerPolicy="no-referrer" />}
            <span>{site_name || domain}</span>
          </div>
        </div>
      </a>
    </div>
  );
};

export default LinkPreview;
