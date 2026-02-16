import "./globals.css";

export const metadata = {
  title: "Quantum Interference Pattern",
  description: "Artistic portrayal of quantum mechanics interference fields",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
