import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GitSurgeon | Autonomous Test-Reproducing & Codebase Patching Agent Harness',
  description:
    'Powered by BharatCode (qwen-3.8-27b & deepseek-v4.1-flash). An autonomous AI harness that turns ambiguous bug reports into reproducing unit tests and verified surgical PRs.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#070b14] text-slate-100 antialiased selection:bg-cyan-500/20 selection:text-cyan-300">
        {children}
      </body>
    </html>
  );
}
