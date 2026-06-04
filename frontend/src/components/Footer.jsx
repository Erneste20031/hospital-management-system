import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer>
      <style>{`
        .footer-grid {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1.4fr;
          gap: 40px;
          padding: 0 20px 32px;
        }
        .footer-heading {
          color: #fff;
          font-size: 15px;
          font-weight: 600;
          margin: 0 0 16px;
        }
        .footer-text {
          color: rgba(255,255,255,0.80);
          font-size: 13px;
          line-height: 1.7;
          margin: 0 0 20px;
        }
        .footer-link {
          color: rgba(255,255,255,0.82);
          font-size: 14px;
          text-decoration: none;
          transition: color 0.15s;
        }
        .footer-link:hover { color: #f5a623; }
        .footer-contact-row {
          display: flex; align-items: center; gap: 10px;
        }
        .footer-contact-icon {
          width: 34px; height: 34px; border-radius: 50%;
          background: #f5a623;
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; flex-shrink: 0;
        }
        .newsletter-box {
          display: flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.08);
          border: 1.5px solid rgba(255,255,255,0.22);
          border-radius: 40px;
          padding: 6px 6px 6px 14px;
        }
        .newsletter-input {
          flex: 1; background: transparent; border: none; outline: none;
          color: #fff; font-size: 13px; font-family: inherit;
          min-width: 0;
        }
        .newsletter-input::placeholder { color: rgba(255,255,255,0.5); }
        .newsletter-btn {
          padding: 8px 16px; border-radius: 40px; border: none;
          cursor: pointer; font-size: 13px; font-weight: 600;
          background: #f5a623; color: #fff;
          font-family: inherit; flex-shrink: 0; transition: all 0.2s;
          white-space: nowrap;
        }
        .newsletter-btn:hover { background: #e09415; transform: translateY(-1px); }
        .lang-btn {
          background: none; border: none; cursor: pointer;
          font-size: 13px; font-weight: 600;
          font-family: inherit; padding: 0 10px;
          transition: color 0.15s;
        }
        .social-btn {
          width: 32px; height: 32px; border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,0.55);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 12px; font-weight: 700;
          text-decoration: none; transition: background 0.15s;
          flex-shrink: 0;
        }
        .social-btn:hover { background: rgba(255,255,255,0.2); }

        /* ── Tablet ── */
        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 28px;
            padding: 0 16px 28px;
          }
        }

        /* ── Mobile ── */
        @media (max-width: 540px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 24px;
            padding: 0 14px 24px;
          }
          .footer-heading { font-size: 14px; margin-bottom: 12px; }
          .footer-text    { font-size: 13px; }
          .footer-link    { font-size: 14px; }
          .newsletter-btn { padding: 8px 12px; font-size: 12px; }
        }
      `}</style>

      {/* ── Curve: gray → blue ── */}
      <div style={{ lineHeight: 0, background: '#f8fafc' }}>
        <svg viewBox="0 0 1440 80" style={{ display: 'block', width: '100%', height: '60px' }} preserveAspectRatio="none">
          <path d="M0,40 C240,90 480,0 720,50 C960,100 1200,20 1440,60 L1440,80 L0,80 Z" fill="#1e3a8a" />
        </svg>
      </div>

      {/* ── Main footer body ── */}
      <div style={{ background: '#1e3a8a', paddingTop: '8px' }}>
        <div className="footer-grid">

          {/* Col 1 — Logo + tagline + language */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '9px',
                background: 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', flexShrink: 0,
              }}>🏥</div>
              <span style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>
                Medi<span style={{ color: '#f5a623' }}>Care+</span>
              </span>
            </div>
            <p className="footer-text">
              Your trusted hospital management platform in Kigali, Rwanda.
            </p>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {['EN', 'FR', 'RW'].map((lang, i) => (
                <React.Fragment key={lang}>
                  <button
                    className="lang-btn"
                    style={{ color: i === 0 ? '#f5a623' : 'rgba(255,255,255,0.7)' }}
                  >
                    {lang}
                  </button>
                  {i < 2 && <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Col 2 — Contact info */}
          <div>
            <h4 className="footer-heading">Contact Info</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { icon: '📍', text: 'Musanze, Rwanda, KG 7' },
                { icon: '✉️', text: 'erneste@medicare.rw'   },
              ].map(({ icon, text }) => (
                <div key={text} className="footer-contact-row">
                  <div className="footer-contact-icon">{icon}</div>
                  <span style={{ color: 'rgba(255,255,255,0.88)', fontSize: '13px', lineHeight: 1.5 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Col 3 — Quick links */}
          <div>
            <h4 className="footer-heading">Quick Links</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '13px' }}>
              {[
                { label: 'About Us',  to: '/about'     },
                { label: 'Dashboard', to: '/dashboard' },
                { label: 'Blog',      to: '/blog'      },
                { label: 'FAQ',       to: '/faq'       },
              ].map(({ label, to }) => (
                <li key={to}>
                  <Link to={to} className="footer-link">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Newsletter */}
          <div>
            <h4 className="footer-heading">Subscribe to Newsletter</h4>
            <p className="footer-text" style={{ marginBottom: '16px', fontSize: '13px' }}>
              Get the latest health tips and hospital updates delivered to your inbox.
            </p>
            <div className="newsletter-box">
              <span style={{ fontSize: '14px' }}>✉️</span>
              <input
                type="email"
                placeholder="Your email address"
                className="newsletter-input"
              />
              <button className="newsletter-btn">Subscribe</button>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11px', marginTop: '8px', paddingLeft: '4px' }}>
              🔒 No spam. Unsubscribe anytime.
            </p>
          </div>

        </div>
      </div>

      {/* ── Divider ── */}
      <div style={{ background: '#1e3a8a', padding: '0 20px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', height: '1px', background: 'rgba(255,255,255,0.18)' }} />
      </div>

      {/* ── Bottom bar ── */}
      <div style={{ background: '#f5a623', padding: '13px 20px' }}>
        <div style={{
          maxWidth: '1100px', margin: '0 auto',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '10px',
        }}>
          <span style={{ color: '#fff', fontSize: '13px', fontWeight: '600' }}>
            © 2026 MediCare+. All rights reserved.
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {[
              { label: '📷', title: 'Instagram' },
              { label: '✕',  title: 'X'         },
              { label: 'f',  title: 'Facebook'   },
              { label: 'in', title: 'LinkedIn'   },
            ].map(({ label, title }) => (
              <a key={title} href="#" title={title} className="social-btn">{label}</a>
            ))}
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
