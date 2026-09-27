import "./globals.css";

export const metadata = {
  title: "OSINT Nukz — Verificação de E-mail",
  description:
    "Consulte informações públicas associadas a um e-mail: validade, vazamentos conhecidos, presença pública e mais.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
