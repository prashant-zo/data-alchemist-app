interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Optional: Add a Header or Navbar here that's specific to your main app */}
      <header className="bg-blue-600 text-white p-4">
        <h1>Data Alchemist</h1>
      </header>

      <main className="flex-grow container mx-auto p-4">
        {children} {/* This will render src/app/(main)/page.tsx or other nested routes */}
      </main>

      {/* Optional: Add a Footer here */}
      <footer className="bg-gray-800 text-white p-4 text-center">
        &copy; {new Date().getFullYear()} Data Alchemist. All rights reserved.
      </footer>
    </div>
  );
}