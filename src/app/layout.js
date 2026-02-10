import "./globals.css";

export const metadata = {
  title: "Ranking Nacional de Panamá",
  description: "Ranking oficial de jugadores de pádel en Panamá",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundImage: "url('/fondo elo.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to right, rgba(8, 145, 178, 0.65), rgba(6, 182, 212, 0.55))',
          }} />
          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1.5rem 1rem', position: 'relative' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', letterSpacing: '-0.02em' }}>Ranking Nacional de Panamá</h1>
              </div>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', fontWeight: '500' }}>Panamá 🇵🇦</p>
            </div>
          </div>
        </header>

        <main style={{ flex: 1 }}>
          {children}
        </main>

        <footer style={{ backgroundColor: 'rgb(15, 23, 42)', color: 'white', marginTop: '5rem' }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '3rem 1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Ranking Pádel</h3>
                <p style={{ color: 'rgb(148, 163, 184)', fontSize: '0.875rem' }}>
                  Ranking oficial de los mejores jugadores de pádel en Panamá.
                </p>
              </div>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Contacto</h3>
                <p style={{ color: 'rgb(148, 163, 184)', fontSize: '0.875rem' }}>
                  Email: info@rankingpadel.pa
                </p>
              </div>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Síguenos</h3>
                <p style={{ color: 'rgb(148, 163, 184)', fontSize: '0.875rem' }}>
                  Instagram • Facebook • Twitter
                </p>
              </div>
            </div>
            <div style={{ borderTop: '1px solid rgb(30, 41, 59)', paddingTop: '2rem' }}>
              <p style={{ color: 'rgb(148, 163, 184)', textAlign: 'center', fontSize: '0.875rem' }}>
                &copy; 2025 Ranking de Pádel Panamá. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
