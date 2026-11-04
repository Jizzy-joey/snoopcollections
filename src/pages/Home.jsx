
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { shoes } from "../data/shoes";
import { formatMoney } from "../config/store";


const heroSlides = [
  `${import.meta.env.BASE_URL}hero/hero1.jpg`,
  `${import.meta.env.BASE_URL}hero/hero2.jpg`,
  `${import.meta.env.BASE_URL}hero/hero3.jpg`,
  `${import.meta.env.BASE_URL}hero/hero4.jpg`,
    `${import.meta.env.BASE_URL}hero/hero5.jpg`,
    `${import.meta.env.BASE_URL}hero/hero6.jpg`,
    `${import.meta.env.BASE_URL}hero/hero7.jpg`,
];


export default function Home() {
  const [search, setSearch] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (heroSlides.length < 2) return;

    const timer = setInterval(() => {
      setCurrentSlide(
        (previous) => (previous + 1) % heroSlides.length
      );
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide(
      (previous) => (previous + 1) % heroSlides.length
    );
  };

  const previousSlide = () => {
    setCurrentSlide(
      (previous) =>
        (previous - 1 + heroSlides.length) %
        heroSlides.length
    );
  };

  const filteredShoes = shoes.filter((shoe) =>
    shoe.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* HERO SECTION */}
      <section className="hero" id="home">
        <div className="hero-content">
          <p className="eyebrow">STEP INTO YOUR STYLE</p>

          <h1>
            YOUR STYLE.
            <br />
            YOUR RULES.
          </h1>

          <p className="hero-description">
            Discover sneakers that make every step a
            statement. Fresh styles, bold designs,
            and everyday comfort.
          </p>

          <a href="#shop" className="primary-button">
            Shop Collection →
          </a>
        </div>

        <div
          className="hero-slideshow"
          aria-label="Featured sneaker photography"
          aria-roledescription="carousel"
        >
          {heroSlides.map((image, index) => (
            <img
              key={image}
              src={image}
              alt={`Featured sneaker style ${index + 1}`}
              className={
                index === currentSlide
                  ? "hero-slide active"
                  : "hero-slide"
              }
              aria-hidden={index !== currentSlide}
            />
          ))}

          <button
            type="button"
            className="slide-arrow slide-prev"
            onClick={previousSlide}
            aria-label="Previous slide"
          >
            &#10094;
          </button>

          <button
            type="button"
            className="slide-arrow slide-next"
            onClick={nextSlide}
            aria-label="Next slide"
          >
            &#10095;
          </button>

          <div className="slide-dots">
            {heroSlides.map((_, index) => (
              <button
                type="button"
                key={index}
                className={
                  index === currentSlide
                    ? "slide-dot active"
                    : "slide-dot"
                }
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={
                  index === currentSlide
                    ? "true"
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      </section>

      {/* SHOP SECTION */}
      <section className="shop" id="shop">
        <div className="section-heading">
          <div>
            <p className="eyebrow">THE COLLECTION</p>
            <h2>FIND YOUR NEXT PAIR.</h2>
          </div>

          <p>{filteredShoes.length} styles</p>
        </div>

        <input
          type="search"
          className="search-input"
          placeholder="Search sneakers..."
          aria-label="Search sneakers"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        <div className="shoe-grid">
          {filteredShoes.map((shoe) => (
            <article className="shoe-card" key={shoe.id}>
                <p className="shoe-price">
                    {formatMoney(shoe.price)}
                </p>
              <Link
                to={`/product/${shoe.id}`}
                className="shoe-image"
              >
                <img
                  src={shoe.image}
                  alt={shoe.name}
                  loading="lazy"
                />
              </Link>

              <div className="shoe-info">
                <h3>{shoe.name}</h3>
                <p className="product-price-note">
                  Price to be confirmed
                </p>

                <Link
                  to={`/product/${shoe.id}`}
                  className="view-product-button"
                >
                  View Product →
                </Link>
              </div>
            </article>
          ))}
        </div>

        {filteredShoes.length === 0 && (
          <p className="no-results">
            No sneakers found. Try another search.
          </p>
        )}
      </section>

      {/* ABOUT SECTION */}
      <section className="about" id="about">
        <p className="eyebrow">
          MORE THAN JUST SNEAKERS
        </p>

        <h2>BUILT FOR THE WAY YOU MOVE.</h2>

        <p>
          SNOOPCOLLECTIONS brings together standout
          footwear for people who express themselves
          through style.
        </p>
      </section>

      {/* FOOTER */}
      <footer>
        <h2>SNOOPCOLLECTIONS.</h2>
        <p>Find your fit. Own your style.</p>
        <small>
          © {new Date().getFullYear()} SNOOPCOLLECTIONS.
        </small>
      </footer>
    </>
  );
}
