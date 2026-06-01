import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer>

      {/* ── Curve transition: gray → blue ── */}
      <div style={{ display: 'block', lineHeight: 0, background: 'var(--gray-50)' }}>
        <svg
          viewBox="0 0 1440 90"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: 'block', width: '100%', height: '70px' }}
          preserveAspectRatio="none"
        >
          <path
            d="M0,40 C240,100 480,0 720,50 C960,100 1200,20 1440,60 L1440,90 L0,90 Z"
            fill="var(--blue)"
          />
        </svg>
      </div>

      {/* ── Main Footer Body ── */}
      <div style={{ background: 'var(--blue)', padding: '8px 12px 32px' }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1.4fr',
          gap: '40px',
        }}>

          {/* Col 1 – Logo + Language */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '22px' }}>🏥</span>
              <span style={{ fontSize: '20px', fontWeight: '800', color: 'white' }}>
                Medi<span style={{ color: 'var(--orange)' }}>Care+</span>
              </span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', lineHeight: 1.7, marginBottom: '20px' }}>
              Your trusted hospital management platform in Kigali, Rwanda.
            </p>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {['EN', 'FR', 'RW'].map((lang, i) => (
                <React.Fragment key={lang}>
                  <button style={{
                    background: 'none', border: 'none',
                    color: i === 0 ? 'var(--orange)' : 'rgba(255,255,255,0.75)',
                    fontSize: '13px', fontWeight: '700',
                    cursor: 'pointer', padding: '0 10px',
                    fontFamily: 'inherit',
                  }}>
                    {lang}
                  </button>
                  {i < 2 && <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px' }}>|</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Col 2 – Contact Info */}
          <div>
            <h4 style={{ color: 'white', fontSize: '15px', fontWeight: '700', marginBottom: '20px' }}>
              Contact Info
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { icon: '📍', text: 'Musanze-Rwanda, KG 7 ' },
                { icon: '✉️', text: 'erneste@medicare.rw' },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: 'var(--orange)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', flexShrink: 0,
                  }}>
                    {icon}
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Col 3 – Quick Links */}
          <div>
            <h4 style={{ color: 'white', fontSize: '15px', fontWeight: '700', marginBottom: '20px' }}>
              Quick Links
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'About Us',  to: '/about'     },
                { label: 'Dashboard', to: '/dashboard' },
                { label: 'Blog',      to: '/blog'      },
                { label: 'FAQ',       to: '/faq'       },
              ].map(({ label, to }) => (
                <li key={to}>
                  <Link
                    to={to}
                    style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', textDecoration: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--orange)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.85)'}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 – Newsletter */}
          <div>
            <h4 style={{ color: 'white', fontSize: '15px', fontWeight: '700', marginBottom: '8px' }}>
              Subscribe to Newsletter
            </h4>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', marginBottom: '20px', lineHeight: 1.6 }}>
              Get the latest health tips and hospital updates delivered to your inbox.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                background: 'rgba(255,255,255,0.08)',
                border: '1.5px solid rgba(255,255,255,0.25)',
                borderRadius: '40px',
                padding: '6px 6px 6px 16px',
              }}>
                <span style={{ fontSize: '14px' }}>✉️</span>
                <input
                  type="email"
                  placeholder="Your email address"
                  style={{
                    flex: 1, background: 'transparent', border: 'none', outline: 'none',
                    color: 'white', fontSize: '13px', fontFamily: 'inherit',
                  }}
                />
                <button style={{
                  padding: '8px 18px', borderRadius: '40px', border: 'none',
                  cursor: 'pointer', fontSize: '13px', fontWeight: '700',
                  background: 'var(--orange)', color: 'white',
                  fontFamily: 'inherit', flexShrink: 0, transition: 'all 0.2s ease',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--orange-dark)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--orange)';      e.currentTarget.style.transform = 'translateY(0)';    }}
                >
                  Subscribe
                </button>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', paddingLeft: '4px' }}>
                🔒 No spam. Unsubscribe anytime.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ── White Divider ── */}
      <div style={{ background: 'var(--blue)', padding: '0 12px' }}>
        <div style={{
          maxWidth: '1100px', margin: '0 auto',
          height: '1px', background: 'rgba(255,255,255,0.25)',
        }} />
      </div>

      {/* ── Orange Bottom Bar ── */}
      <div style={{ background: 'var(--orange)', padding: '14px 12px' }}>
        <div style={{
          maxWidth: '1100px', margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '12px',
        }}>
          <span style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>
            © 2026 MediCare+
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {[
              { label: '📷', title: 'Instagram' },
              { label: '✕',  title: 'X'         },
              { label: 'f',  title: 'Facebook'   },
              { label: 'in', title: 'LinkedIn'   },
            ].map(({ label, title }) => (
              <a key={title} href="#" title={title} style={{
                width: '30px', height: '30px', borderRadius: '50%',
                border: '1.5px solid rgba(255,255,255,0.6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: '12px', fontWeight: '700', textDecoration: 'none',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;