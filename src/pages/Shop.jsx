
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { shoes } from "../data/shoes";
import { getImageUrl } from "../utils/imageUrl";
import "./Shop.css";

export default function Shop() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");

  const products = useMemo(() => {
    let results = shoes.filter((shoe) =>
      shoe.name.toLowerCase().includes(
        search.toLowerCase().trim()
      )
    );

    if (sort === "low") {
      results = [...results].sort(
        (a, b) => a.price - b.price
      );
    }

    if (sort === "high") {
      results = [...results].sort(
        (a, b) => b.price - a.price
      );
    }

    return results;
  }, [search, sort]);

  return (
    <main className="shop-page">
      <section className="shop-banner">
        <div className="shop-banner-content">
          <span>SNOOPCOLLECTIONS / THE COLLECTION</span>
          <h1>FIND YOUR NEXT PAIR.</h1>
          <p>
            Explore our sneaker collection.
            Your style starts here.
          </p>
        </div>
      </section>

      <section className="shop-content">
        <div className="shop-heading">
          <div>
            <span className="shop-eyebrow">
              EXPLORE THE COLLECTION
            </span>
            <h2>ALL SNEAKERS.</h2>
            <p>
              {products.length} sneakers available
              to explore
            </p>
          </div>
        </div>

        <div className="shop-toolbar">
          <input
            type="search"
            placeholder="Search sneakers..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            aria-label="Search sneakers"
          />

          <select
            value={sort}
            onChange={(e) =>
              setSort(e.target.value)
            }
            aria-label="Sort sneakers"
          >
            <option value="default">
              Featured
            </option>
            <option value="low">
              Price: Low to High
            </option>
            <option value="high">
              Price: High to Low
            </option>
          </select>
        </div>

        {products.length === 0 ? (
          <div className="shop-empty">
            <h3>No sneakers found.</h3>
            <p>Try another search.</p>
            <button
              onClick={() => setSearch("")}
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="shop-grid">
            {products.map((shoe) => (
              <Link
                to={`/product/${shoe.id}`}
                className="shop-card"
                key={shoe.id}
              >
                <div className="shop-card-image">
                  <img
                    src={getImageUrl(shoe.image)}
                    alt={shoe.name}
                    loading="lazy"
                  />
                  <span>VIEW SNEAKER ↗</span>
                </div>

                <div className="shop-card-info">
                  <h3>{shoe.name}</h3>

                  {typeof shoe.price === "number" && (
                    <p>
                      ₦{shoe.price.toLocaleString()}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
      <p style={{ textAlign: "center", padding: "20px", fontSize: "50px", color: "#555" }}>
        MORE COLLECTIONS COMING SOON ....
      </p>
    </main>
  );
}
