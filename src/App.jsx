import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import Footer from './components/Footer';
import productsData from './data/products.json';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Load products from JSON
    setProducts(productsData);
  }, []);

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Hero />
        <ProductGrid products={products} />
      </main>
      <Footer />
    </div>
  );
}

export default App;
