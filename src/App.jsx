import { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import CategoryFilter from './components/CategoryFilter';
import ProductGrid from './components/ProductGrid';
import Footer from './components/Footer';
import Wishlist from './components/Wishlist';
import productsData from './data/products.json';
import './App.css';

function App() {
  const [allProducts, setAllProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlist, setWishlist] = useState([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  useEffect(() => {
    // Load products and shuffle them for a fresh look
    const shuffled = [...productsData].sort(() => 0.5 - Math.random());
    setAllProducts(shuffled);

    // Initial load of wishlist
    const saved = JSON.parse(localStorage.getItem('savedProducts') || '[]');
    setWishlist(saved);

    // Deep linking: Check for category in URL
    const params = new URLSearchParams(window.location.search);
    const categoryParam = params.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, []);

  const toggleWishlist = () => setIsWishlistOpen(!isWishlistOpen);

  const toggleSave = (product) => {
    setWishlist(prev => {
      const isSaved = prev.some(item => item.id === product.id);
      let newWishlist;
      if (isSaved) {
        newWishlist = prev.filter(item => item.id !== product.id);
      } else {
        newWishlist = [...prev, product];
      }
      localStorage.setItem('savedProducts', JSON.stringify(newWishlist));
      return newWishlist;
    });
  };

  const categories = useMemo(() => {
    const cats = new Set(allProducts.map(p => p.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    return allProducts.filter(p => {
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tagline.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [allProducts, selectedCategory, searchQuery]);

  const jsonLd = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "itemListElement": filteredProducts.slice(0, 20).map((p, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Product",
          "name": p.title,
          "description": p.tagline,
          "image": p.image,
          "offers": {
            "@type": "Offer",
            "price": p.price ? p.price.replace('$', '').replace(',', '') : '0.00',
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
          }
        }
      }))
    };
  }, [filteredProducts]);

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
        <Hero
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
          resultCount={filteredProducts.length}
        />

        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
        <ProductGrid
          products={filteredProducts}
          wishlist={wishlist}
          onToggleSave={toggleSave}
        />
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
