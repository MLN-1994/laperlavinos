import Header from './components/Header';
import ProductList from './components/ProductList';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <ProductList />
      </main>
      <footer className="border-t bg-white py-10 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} MiTienda - Hecho con Next.js
      </footer>
    </div>
  );
}