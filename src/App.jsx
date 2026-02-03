import { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import CategoryFilter from './components/CategoryFilter';
import ProductGrid from './components/ProductGrid';
import Footer from './components/Footer';
import productsData from './data/products.json';
import './App.css';

function App() {
  const [allProducts, setAllProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    // Load products and shuffle them for a fresh look
    const shuffled = [...productsData].sort(() => 0.5 - Math.random());
    setAllProducts(shuffled);
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(allProducts.map(p => p.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') return allProducts;
    return allProducts.filter(p => p.category === selectedCategory);
  }, [allProducts, selectedCategory]);

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Hero />
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
        <ProductGrid products={filteredProducts} />
      </main>
      <Footer />
    </div>
  );
}

export default App;
