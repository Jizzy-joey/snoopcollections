
import { Link } from "react-router-dom";
import "./About.css";
import { getImageUrl } from "../utils/imageUrl";
import Contact from "../components/Contact";


export default function About() {
  return (
    <main className="about-page">
      {/* HERO SECTION */}
      <section
       className="about-hero"
       style={{
        backgroundImage: `
        linear-gradient(
        90deg,
        rgba(0, 0, 0, 0.88),
        rgba(0, 0, 0, 0.2)),
        url("${getImageUrl("/shoes/shoe1.jpeg")}")`,}}
        >
        <div className="about-hero-overlay" />

        <div className="about-hero-content">
          <span className="about-tag">
            THE SNOOPCOLLECTIONS STORY
          </span>

          <h1>
            MORE THAN
            <br />
            SNEAKERS.
            <br />
            <span>IT'S A STATEMENT.</span>
          </h1>

          <p>
            Style is personal. Confidence is everything.
            We're here for people who want their
            sneakers to speak before they do.
          </p>

          <a href="#our-story" className="about-hero-btn">
            DISCOVER OUR STORY ↗
          </a>
        </div>
      </section>

      {/* OUR STORY */}
      <section className="about-story" id="our-story">
        <div className="about-story-label">
          <span>01 / WHO WE ARE</span>
        </div>

        <div className="about-story-content">
          <h2>
            BUILT FOR
            <br />
            THE CULTURE.
          </h2>

          <p>
            SNOOPCOLLECTIONS is a sneaker-focused
            fashion store built around individuality,
            everyday style, and the culture of
            self-expression.
          </p>

          <p>
            We believe the right pair of sneakers
            can transform an outfit and give you
            the confidence to own your look.
          </p>

          <p>
            Whether you love timeless classics,
            bold streetwear designs, or everyday
            essentials, our goal is to help you
            find a pair that feels like you.
          </p>
        </div>
      </section>

      {/* BRAND MESSAGE */}
      <section className="about-statement">
        <div className="about-statement-inner">
          <span>THE SNOOP MINDSET</span>

          <h2>
            DON'T JUST
            <br />
            FOLLOW STYLE.
            <br />
            <em>DEFINE IT.</em>
          </h2>

          <p>
            Your style. Your identity. Your statement.
          </p>
        </div>
      </section>

      {/* WHY SHOP WITH US */}
      <section className="about-values">
        <div className="about-values-heading">
          <span>02 / WHAT WE BELIEVE</span>
          <h2>THE SNOOP STANDARD.</h2>
          <p>
            Everything we do starts with a love
            for sneakers and the people who wear them.
          </p>
        </div>

        <div className="about-values-grid">
          <article className="about-value-card">
            <span className="about-value-number">01</span>
            <div className="about-value-icon">↗</div>
            <h3>STYLE FIRST</h3>
            <p>
              A collection focused on sneakers
              that complement different styles,
              moods, and occasions.
            </p>
          </article>

          <article className="about-value-card">
            <span className="about-value-number">02</span>
            <div className="about-value-icon">◎</div>
            <h3>INDIVIDUALITY</h3>
            <p>
              We celebrate personal expression.
              Your sneakers should reflect
              who you are.
            </p>
          </article>

          <article className="about-value-card">
            <span className="about-value-number">03</span>
            <div className="about-value-icon">✦</div>
            <h3>CUSTOMER EXPERIENCE</h3>
            <p>
              We aim to make discovering,
              choosing, and ordering your
              next pair simple and enjoyable.
            </p>
          </article>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="about-cta">
        <span>READY FOR YOUR NEXT PAIR?</span>

        <h2>
          YOUR NEXT
          <br />
          FAVORITE PAIR
          <br />
          STARTS HERE.
        </h2>

        <p>
          Explore the SNOOPCOLLECTIONS sneaker
          collection and find your next look.
        </p>

        <Link to="/shop" className="about-shop-btn">
          SHOP THE COLLECTION ↗
        </Link>
      </section>
      <Contact />
    </main>
  );
}
