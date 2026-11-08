import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
 title: "Algoritmo Pessoal | Alex Nunes Feitoza",
 description: "Uma caminhada de fé, presença e transformação. Os frutos de uma vida em Cristo, um dia de cada vez.",
 robots: { index: false, follow: false },
 icons: { icon: "/favicon.svg" },
};
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
 return <html lang="pt-BR"><body>{children}</body></html>;
}
