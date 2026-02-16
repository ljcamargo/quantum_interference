import "./globals.css";

export const metadata = {
  title: "Quantum Interference",
  description: "Artistic portrayal of quantum mechanics interference fields",
  icons: {
    icon: "/interfence_logo_64.png",
    shortcut: "/interfence_logo_64.png",
    apple: "/interfence_logo_192.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/interfence_logo_64.png" sizes="any" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Doto:wght@100..900&family=SUSE+Mono:ital,wght@0,100..800;1,100..800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
