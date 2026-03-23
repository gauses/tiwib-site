import { useEffect, useEffectEvent, useState } from 'react';
import ProductCard from './ProductCard';
import './ProductGrid.css';
import { getCategoryLabel } from '../utils/categories';

function ProductGrid({
  featuredCount,
  featuredOnly,
  hasMoreSource,
  isLoading,
  isLoadingMoreSource,
  loadedCount,
  loadError,
  onFeaturedOnlyChange,
  onLoadMoreSource,
  onSortChange,
  products,
  searchQuery,
  selectedCategory,
  sortOption,
  statusMessage,
  totalCount,
  wishlist,
  onToggleSave,
}) {
  const [page, setPage] = useState(1);
  const PRODUCTS_PER_PAGE = 18;
  const visibleProducts = products.slice(0, page * PRODUCTS_PER_PAGE);
  const normalizedQuery = searchQuery.trim();
  const hasSearch = normalizedQuery.length > 0;
  const hasCategory = selectedCategory && selectedCategory !== 'all';
  const categoryLabel = hasCategory ? getCategoryLabel(selectedCategory) : 'All Categories';
  const summaryEyebrow = hasSearch
    ? 'Search results'
    : hasCategory
      ? 'Category view'
      : 'Catalog overview';
  const summaryTitle = hasSearch
    ? `Results for "${normalizedQuery}"`
    : hasCategory
      ? categoryLabel
      : 'Fresh picks from the full catalog';
  const summaryCopy = hasSearch
    ? (
      hasMoreSource || isLoadingMoreSource
        ? `${products.length.toLocaleString()} sorted matches ready so far while we scan ${totalCount.toLocaleString()} items.`
        : `${products.length.toLocaleString()} sorted matches found in ${totalCount.toLocaleString()} items.`
    )
    : `${visibleProducts.length.toLocaleString()} products visible right now from ${loadedCount.toLocaleString()} loaded and ${totalCount.toLocaleString()} available in this view.`;

  const loadMore = useEffectEvent(() => {
    if (visibleProducts.length < products.length) {
      setPage((prev) => prev + 1);
      return;
    }

    if (hasMoreSource && !isLoadingMoreSource) {
      onLoadMoreSource();
    }
  });

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (scrollTop + windowHeight >= documentHeight - 200) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isLoading && products.length === 0) {
    return (
      <div className="product-grid-container">
        <div className="products-status">
          <div className="spinner"></div>
          <h3>Loading the good stuff...</h3>
          <p>{statusMessage || 'Building the first page of products for you.'}</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="product-grid-container">
        <div className="products-status is-error">
          <h3>Products failed to load</h3>
          <p>{loadError}</p>
          <button className="retry-button" onClick={() => window.location.reload()}>
            Reload
          </button>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="product-grid-container">
        <div className="no-products">
          <div className="no-products-icon">🔍</div>
          <h3>No products found</h3>
          <p>Try adjusting your search or filters to find what you're looking for.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-grid-container">
      <section className="collection-summary" aria-label="Browse summary">
        <div className="collection-summary-shell">
          <div className="collection-summary-copy">
            <p className="collection-summary-eyebrow">{summaryEyebrow}</p>
            <h2 className="collection-summary-title">{summaryTitle}</h2>
            <p className="collection-summary-text">{summaryCopy}</p>
          </div>

          <div className="collection-summary-chips">
            <span className="collection-summary-chip is-active">{categoryLabel}</span>
            {hasSearch && <span className="collection-summary-chip">Search: {normalizedQuery}</span>}
            <span className="collection-summary-chip">{visibleProducts.length.toLocaleString()} visible</span>
            {featuredOnly && <span className="collection-summary-chip is-strong">Hot picks only</span>}
            {(hasMoreSource || isLoadingMoreSource) && (
              <span className="collection-summary-chip">Loading more</span>
            )}
          </div>
        </div>
      </section>

      <section className="collection-toolbar" aria-label="Browse controls">
        <div className="collection-toolbar-shell">
          <div className="collection-toolbar-group">
            <label className="collection-toolbar-label" htmlFor="collection-sort">
              Sort by
            </label>
            <select
              id="collection-sort"
              className="collection-select"
              value={sortOption}
              onChange={(event) => onSortChange(event.target.value)}
            >
              <option value="featured">Featured first</option>
              <option value="wow">Highest wow factor</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </div>

          <div className="collection-toolbar-group collection-toolbar-actions">
            <button
              type="button"
              className={`collection-toggle ${featuredOnly ? 'is-active' : ''}`}
              onClick={onFeaturedOnlyChange}
            >
              {featuredOnly ? 'Showing Hot Picks' : 'Hot Picks Only'}
            </button>
            <span className="collection-toolbar-note">
              {featuredCount.toLocaleString()} featured items loaded
            </span>
          </div>
        </div>
      </section>

      <div className="product-grid">
        {visibleProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isSaved={wishlist.some((item) => item.id === product.id)}
            onToggleSave={() => onToggleSave(product)}
          />
        ))}
      </div>

      {(visibleProducts.length < products.length || hasMoreSource || isLoadingMoreSource) && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>
            {statusMessage || 'Loading more cool stuff...'}
          </p>
        </div>
      )}
    </div>
  );
}

export default ProductGrid;
