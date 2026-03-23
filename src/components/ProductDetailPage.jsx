import { useEffect, useRef, useState } from 'react';
import ProductCard from './ProductCard';
import './ProductDetailPage.css';
import {
  getProductOutboundCtaLabel,
  getProductOutboundDestination,
  getProductOutboundSupportText,
  getProductTrustHighlights,
  handleProductClick,
} from '../utils/affiliateLink';
import { getCategoryLabel } from '../utils/categories';
import { getCategoryPath } from '../utils/routes';

const PREVIEW_MIN_SCALE = 1;
const PREVIEW_MAX_SCALE = 4;
const PREVIEW_SCALE_STEP = 0.2;
const PREVIEW_QUICK_ZOOM_SCALE = 2.4;
const PREVIEW_DEFAULT_OFFSET = { x: 0, y: 0 };

function clampPreviewScale(nextScale) {
  return Math.min(PREVIEW_MAX_SCALE, Math.max(PREVIEW_MIN_SCALE, nextScale));
}

function getTaglineLead(tagline, fallbackCopy) {
  const normalizedTagline = typeof tagline === 'string' ? tagline.trim() : '';

  if (!normalizedTagline) {
    return fallbackCopy;
  }

  const sentenceMatch = normalizedTagline.match(/^(.+?[.!?])(?:\s|$)/);
  const lead = sentenceMatch ? sentenceMatch[1] : normalizedTagline;

  return lead.length > 160 ? `${lead.slice(0, 157).trimEnd()}...` : lead;
}

function splitTaglineCopy(tagline, fallbackLead, fallbackBody = '') {
  const normalizedTagline = typeof tagline === 'string' ? tagline.trim() : '';

  if (!normalizedTagline) {
    return {
      lead: fallbackLead,
      body: fallbackBody,
    };
  }

  const sentenceMatch = normalizedTagline.match(/^(.+?[.!?])(?:\s+|$)([\s\S]*)$/);

  if (!sentenceMatch) {
    return {
      lead: normalizedTagline,
      body: '',
    };
  }

  return {
    lead: sentenceMatch[1].trim(),
    body: sentenceMatch[2].trim(),
  };
}

function ProductDetailPage({
  product,
  relatedProducts = [],
  isSaved = false,
  onToggleSave,
  wishlist = [],
  onToggleRelatedSave = () => {},
}) {
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [previewScale, setPreviewScale] = useState(PREVIEW_MIN_SCALE);
  const [previewOffset, setPreviewOffset] = useState(PREVIEW_DEFAULT_OFFSET);
  const [isPreviewDragging, setIsPreviewDragging] = useState(false);
  const previewFrameRef = useRef(null);
  const previewImageRef = useRef(null);
  const previewDragRef = useRef({
    pointerId: null,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });
  const categoryPath = getCategoryPath(product.category);
  const categoryLabel = getCategoryLabel(product.category);
  const primaryCtaLabel = getProductOutboundCtaLabel(product);
  const destinationLabel = getProductOutboundDestination(product);
  const supportText = getProductOutboundSupportText(product);
  const trustHighlights = getProductTrustHighlights(product);
  const offerHeadline = product.price || 'See latest offer';
  const offerHighlights = [
    `${destinationLabel} checkout`,
    'Opens in new tab',
    'No extra cost to you',
  ];
  const wowFactorLabel = typeof product.wowFactor === 'number' ? `${product.wowFactor.toFixed(1)}/10` : null;
  const mediaHighlights = [
    {
      label: 'Listed',
      value: offerHeadline,
      accentClass: 'is-strong',
    },
    {
      label: 'Category',
      value: categoryLabel,
    },
    {
      label: 'Opens On',
      value: destinationLabel,
    },
    {
      label: wowFactorLabel ? 'Wow Factor' : 'Catalog Status',
      value: wowFactorLabel || (product.featured ? 'Hot Pick' : 'Curated Find'),
    },
  ];
  const mediaNote = getTaglineLead(
    product.tagline,
    `Curated ${categoryLabel.toLowerCase()} find that opens on ${destinationLabel}.`,
  );
  const storyCopy = splitTaglineCopy(
    product.tagline,
    `Curated ${categoryLabel.toLowerCase()} find built to stop the scroll.`,
    `Open the listing on ${destinationLabel} to see the full details and current offer.`,
  );
  const relatedFeaturedCount = relatedProducts.filter((item) => item.featured).length;
  const relatedBrowseCopy = `Keep the rabbit hole going with a tighter set of ${categoryLabel.toLowerCase()} picks from the same lane.`;
  const canZoomOut = previewScale > PREVIEW_MIN_SCALE;
  const canZoomIn = previewScale < PREVIEW_MAX_SCALE;

  const getPreviewOffsetLimits = (scale = previewScale) => {
    const frameElement = previewFrameRef.current;
    const imageElement = previewImageRef.current;

    if (!frameElement || !imageElement || !previewScale) {
      return PREVIEW_DEFAULT_OFFSET;
    }

    const frameRect = frameElement.getBoundingClientRect();
    const imageRect = imageElement.getBoundingClientRect();

    if (!frameRect.width || !frameRect.height || !imageRect.width || !imageRect.height) {
      return PREVIEW_DEFAULT_OFFSET;
    }

    const baseWidth = imageRect.width / previewScale;
    const baseHeight = imageRect.height / previewScale;
    const scaledWidth = baseWidth * scale;
    const scaledHeight = baseHeight * scale;

    return {
      x: Math.max(0, (scaledWidth - frameRect.width) / 2),
      y: Math.max(0, (scaledHeight - frameRect.height) / 2),
    };
  };

  const clampPreviewOffset = (nextOffset, scale = previewScale) => {
    if (scale <= PREVIEW_MIN_SCALE) {
      return PREVIEW_DEFAULT_OFFSET;
    }

    const limits = getPreviewOffsetLimits(scale);

    return {
      x: Math.min(limits.x, Math.max(-limits.x, nextOffset.x)),
      y: Math.min(limits.y, Math.max(-limits.y, nextOffset.y)),
    };
  };

  const getPreviewFocalOffset = (nextScale, clientX, clientY) => {
    const frameElement = previewFrameRef.current;

    if (!frameElement || previewScale <= 0) {
      return previewOffset;
    }

    const frameRect = frameElement.getBoundingClientRect();
    const focalPoint = {
      x: clientX - frameRect.left - frameRect.width / 2,
      y: clientY - frameRect.top - frameRect.height / 2,
    };
    const scaleRatio = nextScale / previewScale;

    return {
      x: previewOffset.x * scaleRatio + focalPoint.x * (1 - scaleRatio),
      y: previewOffset.y * scaleRatio + focalPoint.y * (1 - scaleRatio),
    };
  };

  const openAffiliateLink = () => {
    const affiliateLink = handleProductClick(product);
    window.open(affiliateLink, '_blank', 'noopener,noreferrer');
  };

  const openImagePreview = () => {
    resetImagePreviewTransform();
    setIsImagePreviewOpen(true);
  };

  const resetImagePreviewTransform = () => {
    setPreviewScale(PREVIEW_MIN_SCALE);
    setPreviewOffset(PREVIEW_DEFAULT_OFFSET);
    setIsPreviewDragging(false);
    previewDragRef.current = {
      pointerId: null,
      startX: 0,
      startY: 0,
      originX: 0,
      originY: 0,
    };
  };

  const closeImagePreview = () => {
    setIsImagePreviewOpen(false);
    resetImagePreviewTransform();
  };

  const updatePreviewScale = (nextScale, options = {}) => {
    const clampedScale = clampPreviewScale(nextScale);
    setPreviewScale(clampedScale);

    if (clampedScale === PREVIEW_MIN_SCALE) {
      setPreviewOffset(PREVIEW_DEFAULT_OFFSET);
      setIsPreviewDragging(false);
      previewDragRef.current.pointerId = null;
      return;
    }

    setPreviewOffset(clampPreviewOffset(options.offset ?? previewOffset, clampedScale));
  };

  useEffect(() => {
    if (!isImagePreviewOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeImagePreview();
        return;
      }

      if (event.key === '+' || event.key === '=') {
        event.preventDefault();
        updatePreviewScale(previewScale + PREVIEW_SCALE_STEP);
        return;
      }

      if (event.key === '-' || event.key === '_') {
        event.preventDefault();
        updatePreviewScale(previewScale - PREVIEW_SCALE_STEP);
        return;
      }

      if (event.key === '0') {
        event.preventDefault();
        resetImagePreviewTransform();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isImagePreviewOpen, previewScale]);

  const handlePreviewWheel = (event) => {
    event.preventDefault();

    const direction = event.deltaY < 0 ? 1 : -1;
    const nextScale = clampPreviewScale(previewScale + direction * PREVIEW_SCALE_STEP);
    const nextOffset = getPreviewFocalOffset(nextScale, event.clientX, event.clientY);

    updatePreviewScale(nextScale, { offset: nextOffset });
  };

  const handlePreviewPointerDown = (event) => {
    if (previewScale <= PREVIEW_MIN_SCALE) {
      return;
    }

    if (event.pointerType !== 'touch' && event.button !== 0) {
      return;
    }

    previewDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: previewOffset.x,
      originY: previewOffset.y,
    };
    setIsPreviewDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePreviewPointerMove = (event) => {
    if (!isPreviewDragging || previewDragRef.current.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - previewDragRef.current.startX;
    const deltaY = event.clientY - previewDragRef.current.startY;

    setPreviewOffset(clampPreviewOffset({
      x: previewDragRef.current.originX + deltaX,
      y: previewDragRef.current.originY + deltaY,
    }));
  };

  const stopPreviewDragging = (event) => {
    if (
      event &&
      previewDragRef.current.pointerId === event.pointerId &&
      event.currentTarget.hasPointerCapture?.(event.pointerId)
    ) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    previewDragRef.current.pointerId = null;
    setIsPreviewDragging(false);
  };

  const handlePreviewDoubleClick = (event) => {
    event.preventDefault();

    if (previewScale > PREVIEW_MIN_SCALE) {
      resetImagePreviewTransform();
      return;
    }

    const nextScale = clampPreviewScale(PREVIEW_QUICK_ZOOM_SCALE);
    const nextOffset = getPreviewFocalOffset(nextScale, event.clientX, event.clientY);
    updatePreviewScale(nextScale, { offset: nextOffset });
  };

  return (
    <div className="product-detail-page">
      <section className="product-detail-hero">
        <div className="container product-detail-layout">
          <div className="product-detail-media card">
            <div className="product-detail-visual-glow" aria-hidden="true"></div>
            <div className="product-detail-visual-meta">
              <span className="product-detail-visual-chip">{destinationLabel}</span>
              {typeof product.wowFactor === 'number' && (
                <span className="product-detail-visual-chip">Wow {product.wowFactor.toFixed(1)}</span>
              )}
            </div>
            <button
              type="button"
              className="product-detail-image-stage product-detail-image-zoom"
              onClick={openImagePreview}
              aria-label={`Open larger image for ${product.title}`}
            >
              <div className="product-detail-image-backplate" aria-hidden="true"></div>
              <div className="product-detail-image-frame">
                <img
                  src={product.image}
                  alt={product.title}
                  className="product-detail-image"
                />
              </div>
              <span className="product-detail-image-hint">Open larger image</span>
            </button>
            <p className="product-detail-visual-caption">
              Scroll-stopping product shot with the main call to action anchored right beside it.
            </p>
            <div className="product-detail-media-summary" aria-label="At a glance">
              <div className="product-detail-media-summary-head">
                <p className="product-detail-media-summary-eyebrow">At a glance</p>
                <span className="product-detail-media-summary-kicker">
                  {product.featured ? 'Featured catalog pick' : 'Curated catalog pick'}
                </span>
              </div>
              <div className="product-detail-media-grid">
                {mediaHighlights.map((item) => (
                  <div
                    key={item.label}
                    className={`product-detail-media-stat${item.accentClass ? ` ${item.accentClass}` : ''}`}
                  >
                    <span className="product-detail-media-stat-label">{item.label}</span>
                    <strong className="product-detail-media-stat-value">{item.value}</strong>
                  </div>
                ))}
              </div>
              <div className="product-detail-media-note">
                <p className="product-detail-media-note-label">Editor note</p>
                <p className="product-detail-media-note-copy">{mediaNote}</p>
              </div>
            </div>
          </div>

          <div className="product-detail-copy">
            <nav className="product-detail-breadcrumbs" aria-label="Breadcrumb">
              <a href="/">Home</a>
              <span>/</span>
              <a href={categoryPath}>{categoryLabel}</a>
              <span>/</span>
              <span aria-current="page">{product.title}</span>
            </nav>

            <div className="product-detail-kicker">
              <span className="product-detail-category">{categoryLabel}</span>
              {product.featured && <span className="product-detail-hot">Hot Pick</span>}
            </div>

            <h1 className="product-detail-title">{product.title}</h1>
            <div className="product-detail-story">
              <div className="product-detail-story-head">
                <p className="product-detail-story-eyebrow">Quick take</p>
                <span className="product-detail-story-chip">
                  {product.featured ? 'Featured take' : 'Editor pick'}
                </span>
              </div>
              <p className="product-detail-story-lead">{storyCopy.lead}</p>
              {storyCopy.body && <p className="product-detail-story-body">{storyCopy.body}</p>}
            </div>

            <div className="product-detail-facts">
              <div className="product-detail-facts-head">
                <p className="product-detail-facts-eyebrow">Fast facts</p>
                <span className="product-detail-facts-chip">
                  {wowFactorLabel ? `Wow ${wowFactorLabel}` : destinationLabel}
                </span>
              </div>
              <div className="product-detail-metrics">
                {product.price && (
                  <div className="product-detail-metric">
                    <span className="metric-label">Listed Price</span>
                    <strong>{product.price}</strong>
                  </div>
                )}
                {typeof product.wowFactor === 'number' && (
                  <div className="product-detail-metric">
                    <span className="metric-label">Wow Factor</span>
                    <strong>{product.wowFactor.toFixed(1)}/10</strong>
                  </div>
                )}
              </div>
            </div>

            <div className="product-detail-offer-card">
              <div className="product-detail-offer-banner">
                <div>
                  <p className="product-detail-offer-banner-eyebrow">Best next click</p>
                  <p className="product-detail-offer-banner-title">
                    Jump out to {destinationLabel} when you are ready to check the live listing.
                  </p>
                </div>
                <div className="product-detail-offer-chip-row">
                  {offerHighlights.map((item) => (
                    <span key={item} className="product-detail-offer-chip">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="product-detail-offer-copy">
                <p className="product-detail-offer-eyebrow">Ready to click through?</p>

                <div className="product-detail-offer-main">
                  <div>
                    <p className="product-detail-offer-price-label">
                      {product.price ? 'Current listed price' : 'Latest offer'}
                    </p>
                    <strong className="product-detail-offer-price">{offerHeadline}</strong>
                  </div>
                  <span className="product-detail-offer-destination">{destinationLabel}</span>
                </div>

                <p className="product-detail-offer-support">{supportText}</p>
              </div>

              <div className="product-detail-action-cluster">
                <button className="btn btn-primary product-detail-primary" onClick={openAffiliateLink}>
                  {primaryCtaLabel}
                </button>
                <p className="product-detail-primary-note">
                  You will leave this page and land on the live {destinationLabel} listing in a new tab.
                </p>
                <div className="product-detail-actions">
                  <button
                    className={`product-detail-save ${isSaved ? 'is-saved' : ''}`}
                    onClick={onToggleSave}
                    type="button"
                  >
                    {isSaved ? 'Saved to Wishlist' : 'Save to Wishlist'}
                  </button>
                  <a href={categoryPath} className="product-detail-category-link">
                    More {categoryLabel}
                  </a>
                </div>
              </div>

              <div className="product-detail-trust-panel" aria-label="Why click with confidence">
                <p className="product-detail-trust-heading">Why click with confidence</p>
                <div className="product-detail-trust-grid">
                  {trustHighlights.map((item) => (
                    <div key={item.title} className="product-detail-trust-item">
                      <span className="product-detail-trust-label">{item.title}</span>
                      <strong className="product-detail-trust-value">{item.description}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <p className="product-detail-disclaimer">
                We may earn a commission if you buy through this page. It does not cost you extra.
              </p>
            </div>
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="product-detail-related">
          <div className="container">
            <div className="product-detail-related-shell">
              <div className="product-detail-related-overview">
                <div className="product-detail-section-head">
                  <div>
                    <p className="product-detail-section-label">Keep Browsing</p>
                    <h2>More {categoryLabel} finds</h2>
                    <p className="product-detail-related-copy">{relatedBrowseCopy}</p>
                  </div>
                  <a href={categoryPath} className="product-detail-all-link">
                    View full category
                  </a>
                </div>
                <div className="product-detail-related-badges" aria-label="Browse highlights">
                  <span className="product-detail-related-badge">{relatedProducts.length} more picks</span>
                  {relatedFeaturedCount > 0 && (
                    <span className="product-detail-related-badge is-strong">
                      {relatedFeaturedCount} hot picks
                    </span>
                  )}
                  <span className="product-detail-related-badge">Same category lane</span>
                </div>
              </div>

              <div className="product-detail-related-grid-shell">
                <div className="product-detail-related-note">
                  <p className="product-detail-related-note-title">Keep the scroll alive</p>
                  <p className="product-detail-related-note-copy">
                    Open another detail page, save a contender, or jump back to the full {categoryLabel} collection.
                  </p>
                </div>

                <div className="product-grid product-detail-grid">
                  {relatedProducts.map((relatedProduct) => (
                    <ProductCard
                      key={relatedProduct.id}
                      product={relatedProduct}
                      isSaved={wishlist.some((item) => item.id === relatedProduct.id)}
                      onToggleSave={() => onToggleRelatedSave(relatedProduct)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="product-detail-mobile-bar">
        <div className="product-detail-mobile-meta">
          <div className="product-detail-mobile-chip-row">
            <span className="product-detail-mobile-chip">{destinationLabel}</span>
            {product.featured && <span className="product-detail-mobile-chip is-strong">Hot Pick</span>}
          </div>
          <span className="product-detail-mobile-label">
            {product.price ? 'Current listed price' : 'Latest offer'}
          </span>
          <strong className="product-detail-mobile-price">{offerHeadline}</strong>
        </div>
        <div className="product-detail-mobile-actions">
          <a href={categoryPath} className="product-detail-mobile-link">
            More {categoryLabel}
          </a>
          <button className="btn btn-primary product-detail-mobile-button" onClick={openAffiliateLink}>
            {primaryCtaLabel}
          </button>
        </div>
      </div>

      {isImagePreviewOpen && (
        <div
          className="product-detail-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${product.title} image preview`}
          onClick={closeImagePreview}
        >
          <div className="product-detail-lightbox-backdrop" aria-hidden="true"></div>
          <div
            className="product-detail-lightbox-shell"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="product-detail-lightbox-topbar">
              <div className="product-detail-lightbox-copy">
                <p className="product-detail-lightbox-eyebrow">Image preview</p>
                <h2 className="product-detail-lightbox-title">{product.title}</h2>
              </div>
              <div className="product-detail-lightbox-actions">
                <span className="product-detail-lightbox-zoom">{Math.round(previewScale * 100)}%</span>
                <button
                  type="button"
                  className="product-detail-lightbox-tool"
                  onClick={() => updatePreviewScale(previewScale - PREVIEW_SCALE_STEP)}
                  aria-label="Zoom out image"
                  disabled={!canZoomOut}
                >
                  -
                </button>
                <button
                  type="button"
                  className="product-detail-lightbox-tool"
                  onClick={resetImagePreviewTransform}
                  aria-label="Reset image zoom"
                >
                  Reset
                </button>
                <button
                  type="button"
                  className="product-detail-lightbox-tool"
                  onClick={() => updatePreviewScale(previewScale + PREVIEW_SCALE_STEP)}
                  aria-label="Zoom in image"
                  disabled={!canZoomIn}
                >
                  +
                </button>
                <button
                  type="button"
                  className="product-detail-lightbox-close"
                  onClick={closeImagePreview}
                  aria-label="Close image preview"
                >
                  Close
                </button>
              </div>
            </div>

            <div
              ref={previewFrameRef}
              className={`product-detail-lightbox-frame ${previewScale > PREVIEW_MIN_SCALE ? 'is-draggable' : ''} ${isPreviewDragging ? 'is-dragging' : ''}`}
              onWheel={handlePreviewWheel}
              onPointerDown={handlePreviewPointerDown}
              onPointerMove={handlePreviewPointerMove}
              onPointerUp={stopPreviewDragging}
              onPointerCancel={stopPreviewDragging}
              onPointerLeave={stopPreviewDragging}
              onDoubleClick={handlePreviewDoubleClick}
            >
              <img
                ref={previewImageRef}
                src={product.image}
                alt={product.title}
                className="product-detail-lightbox-image"
                style={{
                  transform: `translate3d(${previewOffset.x}px, ${previewOffset.y}px, 0) scale(${previewScale})`,
                }}
              />
            </div>

            <div className="product-detail-lightbox-footer">
              <span className="product-detail-lightbox-chip">{destinationLabel}</span>
              {typeof product.wowFactor === 'number' && (
                <span className="product-detail-lightbox-chip">Wow {product.wowFactor.toFixed(1)}</span>
              )}
              <span className="product-detail-lightbox-chip">Wheel or double-click to zoom</span>
              <span className="product-detail-lightbox-chip">
                {previewScale > PREVIEW_MIN_SCALE ? 'Drag to pan' : 'Zoom in to pan'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetailPage;
