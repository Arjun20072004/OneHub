import { useState } from "react";
import {
  Search,
  ShoppingCart,
  Smartphone,
  Shirt,
  Home,
  Sparkles,
} from "lucide-react";
import { shoppingProducts } from "../services/shopping";
import "./ServicePages.css";

function getProductIcon(category: string) {
  const normalized = category.toLowerCase();

  if (normalized.includes("mobile")) {
    return Smartphone;
  }

  if (normalized.includes("fashion")) {
    return Shirt;
  }

  if (normalized.includes("home")) {
    return Home;
  }

  if (normalized.includes("electronics")) {
    return Sparkles;
  }

  return ShoppingCart;
}

export default function ShoppingPage() {
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");

  const visible = shoppingProducts.filter((product) =>
    `${product.name} ${product.category} ${product.keywords.join(" ")}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  return (
    <main className="service-page">
      <section className="service-hero service-hero--travel">
        <div>
          <span className="eyebrow">OneHub Shopping</span>

          <h1>Everything you need, delivered.</h1>

          <p>
            Browse electronics, fashion, home, beauty, groceries and everyday
            essentials from trusted sellers.
          </p>
        </div>

        <ShoppingCart size={46} />
      </section>

      <div className="service-toolbar">
        <label className="search-field">
          <Search size={18} />

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products, brands or categories"
          />
        </label>
      </div>

      <section className="section-heading">
        <div>
          <span className="eyebrow">Curated marketplace</span>
          <h2>Popular right now</h2>
        </div>

        <span>{visible.length} products</span>
      </section>

      <div className="catalog-grid">
        {visible.map((product) => {
          const Icon = getProductIcon(product.category);

          return (
            <article className="catalog-card" key={product.id}>
              <div className="stay-art">
                <Icon size={36} />
              </div>

              <div className="catalog-card__body">
                <h3>{product.name}</h3>

                <p>{product.category}</p>

                <strong>{product.price}</strong>

                <small>
                  Free delivery available • 7-day returns
                </small>

                <button
                  className="primary-button"
                  onClick={() =>
                    setMessage(`${product.name} added to cart.`)
                  }
                >
                  <ShoppingCart size={16} />
                  Add to cart
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {visible.length === 0 && (
        <div className="empty-state">
          No products found for "{query}".
        </div>
      )}

      {message && (
        <div className="toast" role="status">
          {message}
        </div>
      )}
    </main>
  );
}