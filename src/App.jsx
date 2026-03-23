import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import CategoryFilter from './components/CategoryFilter';
import ProductGrid from './components/ProductGrid';
import ProductDetailPage from './components/ProductDetailPage';
import Footer from './components/Footer';
import Wishlist from './components/Wishlist';
import {
  getCategoryLabel,
} from './utils/categories';
import {
  DEFAULT_OG_IMAGE,
  SEO_SHELL_ID,
  SITE_NAME,
  SITE_URL,
  getCategoryPath,
  getCollectionPageMeta,
  getProductPageMeta,
  getProductPath,
  getRoutePath,
  parseRouteFromLocation,
  readEmbeddedRouteData,
} from './utils/routes';
import './App.css';

const CATALOG_INDEX_ENDPOINT = '/catalog/index.json';
const PRODUCT_MAP_ENDPOINT = '/catalog/product-map.json';
const SEARCH_RESULTS_BATCH = 120;
const DEFAULT_SORT_OPTION = 'featured';

function formatPriceForSchema(price) {
  if (!price) {
    return null;
  }

  const normalizedPrice = price.replace(/[$,]/g, '').trim();
  return normalizedPrice || null;
}

function parsePriceValue(price) {
  if (!price) {
    return null;
  }

  const numericPrice = Number.parseFloat(String(price).replace(/[$,]/g, '').trim());
  return Number.isFinite(numericPrice) ? numericPrice : null;
}

function compareProducts(leftProduct, rightProduct, sortOption) {
  const leftPrice = parsePriceValue(leftProduct.price);
  const rightPrice = parsePriceValue(rightProduct.price);
  const leftWow = typeof leftProduct.wowFactor === 'number' ? leftProduct.wowFactor : -1;
  const rightWow = typeof rightProduct.wowFactor === 'number' ? rightProduct.wowFactor : -1;

  if (sortOption === 'wow') {
    return (
      Number(rightProduct.featured) - Number(leftProduct.featured)
      || rightWow - leftWow
      || (leftPrice ?? Number.POSITIVE_INFINITY) - (rightPrice ?? Number.POSITIVE_INFINITY)
      || leftProduct.title.localeCompare(rightProduct.title)
    );
  }

  if (sortOption === 'price-asc') {
    return (
      (leftPrice ?? Number.POSITIVE_INFINITY) - (rightPrice ?? Number.POSITIVE_INFINITY)
      || Number(rightProduct.featured) - Number(leftProduct.featured)
      || rightWow - leftWow
      || leftProduct.title.localeCompare(rightProduct.title)
    );
  }

  if (sortOption === 'price-desc') {
    return (
      (rightPrice ?? Number.NEGATIVE_INFINITY) - (leftPrice ?? Number.NEGATIVE_INFINITY)
      || Number(rightProduct.featured) - Number(leftProduct.featured)
      || rightWow - leftWow
      || leftProduct.title.localeCompare(rightProduct.title)
    );
  }

  return (
    Number(rightProduct.featured) - Number(leftProduct.featured)
    || rightWow - leftWow
    || (leftPrice ?? Number.POSITIVE_INFINITY) - (rightPrice ?? Number.POSITIVE_INFINITY)
    || leftProduct.title.localeCompare(rightProduct.title)
  );
}

function buildFallbackProductMeta(productId) {
  return {
    title: `Product Not Found | ${SITE_NAME}`,
    description: 'This product page could not be loaded from the current catalog snapshot.',
    canonicalUrl: `${SITE_URL}${getProductPath(productId)}`,
    image: DEFAULT_OG_IMAGE,
    type: 'website',
  };
}

function App() {
  const initialRoute = useRef(parseRouteFromLocation(window.location)).current;
  const embeddedRouteData = useRef(readEmbeddedRouteData()).current;
  const hasInitialSeoShellRef = useRef(Boolean(document.getElementById(SEO_SHELL_ID)));

  const isProductRoute = initialRoute.type === 'product';

  const [catalogIndex, setCatalogIndex] = useState(null);
  const [displayProducts, setDisplayProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(() => (
    initialRoute.type === 'category' ? initialRoute.category : 'all'
  ));
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState(DEFAULT_SORT_OPTION);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(!isProductRoute);
  const [isLoadingMoreSource, setIsLoadingMoreSource] = useState(false);
  const [productsError, setProductsError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [sourceCursor, setSourceCursor] = useState(0);
  const [hasMoreSource, setHasMoreSource] = useState(false);
  const [activeProductRecord, setActiveProductRecord] = useState(() => {
    if (isProductRoute && embeddedRouteData?.pageType === 'product') {
      return {
        product: embeddedRouteData.product || null,
        relatedProducts: Array.isArray(embeddedRouteData.relatedProducts)
          ? embeddedRouteData.relatedProducts
          : [],
      };
    }

    return {
      product: null,
      relatedProducts: [],
    };
  });
  const [isLoadingActiveProduct, setIsLoadingActiveProduct] = useState(
    isProductRoute && !embeddedRouteData?.product,
  );
  const [activeProductError, setActiveProductError] = useState('');
  const [isSeoShellDismissed, setIsSeoShellDismissed] = useState(
    () => !hasInitialSeoShellRef.current,
  );

  const deferredSearchQuery = useDeferredValue(searchQuery);
  const normalizedSearchQuery = deferredSearchQuery.trim().toLowerCase();
  const activeProduct = activeProductRecord.product;
  const featuredLoadedCount = useMemo(
    () => displayProducts.filter((product) => product.featured).length,
    [displayProducts],
  );
  const collectionProducts = useMemo(() => {
    const nextProducts = showFeaturedOnly
      ? displayProducts.filter((product) => product.featured)
      : [...displayProducts];

    return nextProducts.sort((leftProduct, rightProduct) => (
      compareProducts(leftProduct, rightProduct, sortOption)
    ));
  }, [displayProducts, showFeaturedOnly, sortOption]);

  const chunkCacheRef = useRef(new Map());
  const productMapRef = useRef(null);
  const requestIdRef = useRef(0);
  const displayProductsRef = useRef(displayProducts);
  const sourceCursorRef = useRef(sourceCursor);
  const isLoadingMoreRef = useRef(isLoadingMoreSource);

  useEffect(() => {
    displayProductsRef.current = displayProducts;
  }, [displayProducts]);

  useEffect(() => {
    sourceCursorRef.current = sourceCursor;
  }, [sourceCursor]);

  useEffect(() => {
    isLoadingMoreRef.current = isLoadingMoreSource;
  }, [isLoadingMoreSource]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCatalogIndex() {
      try {
        if (!isProductRoute) {
          setIsLoadingProducts(true);
        }

        setProductsError('');

        const response = await fetch(CATALOG_INDEX_ENDPOINT, {
          signal: controller.signal,
          cache: 'force-cache',
        });

        if (!response.ok) {
          throw new Error(`Failed to load catalog index (${response.status})`);
        }

        const data = await response.json();
        if (!data?.all?.paths || !Array.isArray(data.all.paths)) {
          throw new Error('Catalog index format is invalid.');
        }

        setCatalogIndex(data);
      } catch (error) {
        if (error.name === 'AbortError') {
          return;
        }

        setProductsError(error.message || 'Unable to load the catalog right now.');

        if (!isProductRoute) {
          setIsLoadingProducts(false);
        }
      }
    }

    loadCatalogIndex();

    try {
      const saved = JSON.parse(localStorage.getItem('savedProducts') || '[]');
      setWishlist(Array.isArray(saved) ? saved : []);
    } catch {
      setWishlist([]);
    }

    return () => controller.abort();
  }, [isProductRoute]);

  const categories = useMemo(
    () => (catalogIndex ? catalogIndex.categories.map((entry) => entry.slug) : []),
    [catalogIndex],
  );

  useEffect(() => {
    if (isProductRoute || !catalogIndex || selectedCategory === 'all') {
      return;
    }

    if (!categories.includes(selectedCategory)) {
      setSelectedCategory('all');
    }
  }, [catalogIndex, categories, isProductRoute, selectedCategory]);

  const activeCategoryEntry = useMemo(() => {
    if (isProductRoute || !catalogIndex || selectedCategory === 'all') {
      return null;
    }

    return catalogIndex.categories.find((entry) => entry.slug === selectedCategory) || null;
  }, [catalogIndex, isProductRoute, selectedCategory]);

  const relevantChunkPaths = useMemo(() => {
    if (isProductRoute || !catalogIndex) {
      return [];
    }

    if (selectedCategory === 'all') {
      return catalogIndex.all.paths;
    }

    return activeCategoryEntry?.paths || [];
  }, [activeCategoryEntry, catalogIndex, isProductRoute, selectedCategory]);

  const activeTotalCount = useMemo(() => {
    if (isProductRoute || !catalogIndex) {
      return 0;
    }

    if (selectedCategory === 'all') {
      return catalogIndex.all.count;
    }

    return activeCategoryEntry?.count || 0;
  }, [activeCategoryEntry, catalogIndex, isProductRoute, selectedCategory]);

  const productMatchesQuery = useCallback((product, query) => {
    if (!query) {
      return true;
    }

    const title = (product.title || '').toLowerCase();
    const tagline = (product.tagline || '').toLowerCase();

    return title.includes(query) || tagline.includes(query);
  }, []);

  const loadChunk = useCallback(async (chunkPath) => {
    if (chunkCacheRef.current.has(chunkPath)) {
      return chunkCacheRef.current.get(chunkPath);
    }

    const response = await fetch(chunkPath, { cache: 'force-cache' });
    if (!response.ok) {
      throw new Error(`Failed to load chunk ${chunkPath}`);
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error(`Chunk format is invalid for ${chunkPath}`);
    }

    chunkCacheRef.current.set(chunkPath, data);
    return data;
  }, []);

  const loadProductMap = useCallback(async () => {
    if (productMapRef.current) {
      return productMapRef.current;
    }

    const response = await fetch(PRODUCT_MAP_ENDPOINT, { cache: 'force-cache' });
    if (!response.ok) {
      throw new Error(`Failed to load product map (${response.status})`);
    }

    const data = await response.json();
    productMapRef.current = data;
    return data;
  }, []);

  const loadProductRecord = useCallback(async (productId) => {
    const productMap = await loadProductMap();
    const productEntry = productMap?.[productId];

    if (!productEntry) {
      return null;
    }

    const [allChunkProducts, categoryChunkProducts] = await Promise.all([
      loadChunk(productEntry.allChunkPath),
      loadChunk(productEntry.categoryChunkPath || productEntry.allChunkPath),
    ]);

    const product = allChunkProducts.find((item) => item.id === productId)
      || categoryChunkProducts.find((item) => item.id === productId);

    if (!product) {
      return null;
    }

    return {
      product,
      relatedProducts: categoryChunkProducts
        .filter((item) => item.id !== productId)
        .slice(0, 4),
    };
  }, [loadChunk, loadProductMap]);

  const loadMoreFromSource = useCallback(
    async ({ reset = false, requestId = requestIdRef.current } = {}) => {
      if (isProductRoute || !catalogIndex) {
        return;
      }

      if (isLoadingMoreRef.current && !reset) {
        return;
      }

      const query = normalizedSearchQuery;
      const chunkPaths = relevantChunkPaths;

      if (reset) {
        setIsLoadingProducts(true);
        setProductsError('');
      } else {
        setIsLoadingMoreSource(true);
        isLoadingMoreRef.current = true;
      }

      try {
        let nextIndex = reset ? 0 : sourceCursorRef.current;
        let nextProducts = reset ? [] : [...displayProductsRef.current];

        if (query === '') {
          const nextPath = chunkPaths[nextIndex];
          if (nextPath) {
            const chunkProducts = await loadChunk(nextPath);
            if (requestId !== requestIdRef.current) {
              return;
            }

            nextProducts = reset ? chunkProducts : nextProducts.concat(chunkProducts);
            nextIndex += 1;
          }
        } else {
          const targetSize = nextProducts.length + SEARCH_RESULTS_BATCH;

          while (nextIndex < chunkPaths.length && nextProducts.length < targetSize) {
            const chunkProducts = await loadChunk(chunkPaths[nextIndex]);
            if (requestId !== requestIdRef.current) {
              return;
            }

            const matches = chunkProducts.filter((product) => productMatchesQuery(product, query));
            if (matches.length > 0) {
              nextProducts = nextProducts.concat(matches);
            }

            nextIndex += 1;
          }
        }

        if (requestId !== requestIdRef.current) {
          return;
        }

        displayProductsRef.current = nextProducts;
        sourceCursorRef.current = nextIndex;

        setDisplayProducts(nextProducts);
        setSourceCursor(nextIndex);
        setHasMoreSource(nextIndex < chunkPaths.length);

        if (query) {
          setStatusMessage(
            nextIndex < chunkPaths.length
              ? `Search in progress: scanned ${nextIndex} of ${chunkPaths.length} chunks.`
              : `Search complete: scanned all ${chunkPaths.length} chunks.`,
          );
        } else {
          setStatusMessage(
            nextIndex < chunkPaths.length
              ? `Loaded ${nextProducts.length.toLocaleString()} of ${activeTotalCount.toLocaleString()} products.`
              : `Loaded all ${activeTotalCount.toLocaleString()} products.`,
          );
        }
      } catch (error) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        setProductsError(error.message || 'Unable to load products right now.');
        setDisplayProducts([]);
        setHasMoreSource(false);
        setStatusMessage('');
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoadingProducts(false);
          setIsLoadingMoreSource(false);
          isLoadingMoreRef.current = false;
        }
      }
    },
    [
      activeTotalCount,
      catalogIndex,
      isProductRoute,
      loadChunk,
      normalizedSearchQuery,
      productMatchesQuery,
      relevantChunkPaths,
    ],
  );

  useEffect(() => {
    if (isProductRoute || !catalogIndex) {
      return;
    }

    requestIdRef.current += 1;
    const requestId = requestIdRef.current;

    displayProductsRef.current = [];
    sourceCursorRef.current = 0;
    setDisplayProducts([]);
    setSourceCursor(0);
    setHasMoreSource(relevantChunkPaths.length > 0);
    setStatusMessage(normalizedSearchQuery ? 'Preparing catalog search...' : '');

    if (relevantChunkPaths.length === 0) {
      setIsLoadingProducts(false);
      return;
    }

    loadMoreFromSource({ reset: true, requestId });
  }, [catalogIndex, isProductRoute, loadMoreFromSource, normalizedSearchQuery, relevantChunkPaths]);

  useEffect(() => {
    if (!isProductRoute || activeProduct?.id === initialRoute.productId) {
      return;
    }

    let isCancelled = false;

    setIsLoadingActiveProduct(true);
    setActiveProductError('');
    setActiveProductRecord({ product: null, relatedProducts: [] });

    loadProductRecord(initialRoute.productId)
      .then((record) => {
        if (isCancelled) {
          return;
        }

        if (!record?.product) {
          setActiveProductError('That product page is missing from the current catalog.');
          return;
        }

        setActiveProductRecord(record);
      })
      .catch((error) => {
        if (isCancelled) {
          return;
        }

        setActiveProductError(error.message || 'Unable to load this product right now.');
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoadingActiveProduct(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [activeProduct?.id, initialRoute.productId, isProductRoute, loadProductRecord]);

  const pageMeta = useMemo(() => {
    if (isProductRoute) {
      if (activeProduct) {
        return getProductPageMeta(activeProduct);
      }

      return buildFallbackProductMeta(initialRoute.productId);
    }

    return getCollectionPageMeta(selectedCategory);
  }, [activeProduct, initialRoute.productId, isProductRoute, selectedCategory]);

  useEffect(() => {
    const descriptionMeta = document.querySelector('meta[name="description"]');
    const ogTitleMeta = document.querySelector('meta[property="og:title"]');
    const ogDescriptionMeta = document.querySelector('meta[property="og:description"]');
    const ogTypeMeta = document.querySelector('meta[property="og:type"]');
    const ogUrlMeta = document.querySelector('meta[property="og:url"]');
    const ogImageMeta = document.querySelector('meta[property="og:image"]');
    const twitterTitleMeta = document.querySelector('meta[property="twitter:title"]');
    const twitterDescriptionMeta = document.querySelector('meta[property="twitter:description"]');
    const twitterUrlMeta = document.querySelector('meta[property="twitter:url"]');
    const twitterImageMeta = document.querySelector('meta[property="twitter:image"]');
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    const canonicalPath = isProductRoute
      ? getRoutePath(initialRoute)
      : getRoutePath(
        selectedCategory === 'all'
          ? { type: 'home' }
          : { type: 'category', category: selectedCategory },
      );

    document.title = pageMeta.title;
    descriptionMeta?.setAttribute('content', pageMeta.description);
    ogTitleMeta?.setAttribute('content', pageMeta.title);
    ogDescriptionMeta?.setAttribute('content', pageMeta.description);
    ogTypeMeta?.setAttribute('content', pageMeta.type);
    ogUrlMeta?.setAttribute('content', pageMeta.canonicalUrl);
    ogImageMeta?.setAttribute('content', pageMeta.image);
    twitterTitleMeta?.setAttribute('content', pageMeta.title);
    twitterDescriptionMeta?.setAttribute('content', pageMeta.description);
    twitterUrlMeta?.setAttribute('content', pageMeta.canonicalUrl);
    twitterImageMeta?.setAttribute('content', pageMeta.image);
    canonicalLink?.setAttribute('href', pageMeta.canonicalUrl);

    const hasLegacyCategoryParam = new URLSearchParams(window.location.search).has('category');
    if (hasLegacyCategoryParam || window.location.pathname !== canonicalPath) {
      window.history.replaceState({}, '', canonicalPath);
    }
  }, [initialRoute, isProductRoute, pageMeta, selectedCategory]);

  const isReadyToDismissSeoShell = isProductRoute
    ? Boolean(activeProduct) || Boolean(activeProductError)
    : !isLoadingProducts || Boolean(productsError);

  useEffect(() => {
    if (isSeoShellDismissed || !isReadyToDismissSeoShell) {
      return;
    }

    document.getElementById(SEO_SHELL_ID)?.remove();
    setIsSeoShellDismissed(true);
  }, [isReadyToDismissSeoShell, isSeoShellDismissed]);

  const toggleWishlist = () => setIsWishlistOpen(!isWishlistOpen);

  const toggleSave = (product) => {
    setWishlist((prev) => {
      const isSaved = prev.some((item) => item.id === product.id);
      const nextWishlist = isSaved
        ? prev.filter((item) => item.id !== product.id)
        : [...prev, product];

      localStorage.setItem('savedProducts', JSON.stringify(nextWishlist));
      return nextWishlist;
    });
  };

  const jsonLd = useMemo(() => {
    if (isProductRoute) {
      if (!activeProduct) {
        return [];
      }

      const productPath = getProductPath(activeProduct);
      const productUrl = `${SITE_URL}${productPath}`;
      const price = formatPriceForSchema(activeProduct.price);

      const productSchema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: activeProduct.title,
        description: activeProduct.tagline,
        image: activeProduct.image ? [activeProduct.image] : undefined,
        category: getCategoryLabel(activeProduct.category),
        url: productUrl,
      };

      if (price) {
        productSchema.offers = {
          '@type': 'Offer',
          price,
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          url: productUrl,
        };
      }

      return [
        productSchema,
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: `${SITE_URL}/`,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: getCategoryLabel(activeProduct.category),
              item: `${SITE_URL}${getCategoryPath(activeProduct.category)}`,
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: activeProduct.title,
              item: productUrl,
            },
          ],
        },
      ];
    }

    const itemList = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: collectionProducts.slice(0, 20).map((product, index) => {
        const price = formatPriceForSchema(product.price);
        const item = {
          '@type': 'Product',
          name: product.title,
          description: product.tagline,
          image: product.image,
          url: `${SITE_URL}${getProductPath(product)}`,
        };

        if (price) {
          item.offers = {
            '@type': 'Offer',
            price,
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
          };
        }

        return {
          '@type': 'ListItem',
          position: index + 1,
          item,
        };
      }),
    };

    const breadcrumbs = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${SITE_URL}/`,
        },
      ],
    };

    if (selectedCategory !== 'all') {
      breadcrumbs.itemListElement.push({
        '@type': 'ListItem',
        position: 2,
        name: getCategoryLabel(selectedCategory),
        item: `${SITE_URL}${getCategoryPath(selectedCategory)}`,
      });
    }

    return [itemList, breadcrumbs];
  }, [activeProduct, collectionProducts, isProductRoute, selectedCategory]);

  if (!isSeoShellDismissed) {
    return null;
  }

  return (
    <div className="app">
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
      <Header
        wishlistCount={wishlist.length}
        onToggleWishlist={toggleWishlist}
      />
      <main className="main-content">
        {isProductRoute ? (
          <>
            {isLoadingActiveProduct && !activeProduct ? (
              <div className="product-grid-container">
                <div className="products-status">
                  <div className="spinner"></div>
                  <h3>Loading this product...</h3>
                  <p>Pulling the latest product details from the catalog.</p>
                </div>
              </div>
            ) : activeProduct ? (
              <ProductDetailPage
                product={activeProduct}
                relatedProducts={activeProductRecord.relatedProducts}
                isSaved={wishlist.some((item) => item.id === activeProduct.id)}
                onToggleSave={() => toggleSave(activeProduct)}
                wishlist={wishlist}
                onToggleRelatedSave={toggleSave}
              />
            ) : (
              <div className="product-grid-container">
                <div className="products-status is-error">
                  <h3>Product not found</h3>
                  <p>{activeProductError || 'This product does not exist in the current catalog build.'}</p>
                  <a className="btn btn-primary" href="/">
                    Back to the catalog
                  </a>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <Hero
              searchQuery={searchQuery}
              onSearch={setSearchQuery}
              resultCount={displayProducts.length}
              selectedCategory={selectedCategory}
            />

            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
            />
            <ProductGrid
              key={`${selectedCategory}:${normalizedSearchQuery}:${sortOption}:${showFeaturedOnly}`}
              featuredCount={featuredLoadedCount}
              featuredOnly={showFeaturedOnly}
              hasMoreSource={hasMoreSource}
              isLoading={isLoadingProducts}
              isLoadingMoreSource={isLoadingMoreSource}
              loadedCount={displayProducts.length}
              loadError={productsError}
              onFeaturedOnlyChange={() => setShowFeaturedOnly((currentValue) => !currentValue)}
              onLoadMoreSource={loadMoreFromSource}
              onSortChange={setSortOption}
              products={collectionProducts}
              searchQuery={searchQuery}
              selectedCategory={selectedCategory}
              sortOption={sortOption}
              statusMessage={statusMessage}
              totalCount={activeTotalCount}
              wishlist={wishlist}
              onToggleSave={toggleSave}
            />
          </>
        )}
      </main>
      <Footer />
      <Wishlist
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        items={wishlist}
        onRemove={toggleSave}
      />
    </div>
  );
}

export default App;
