import Header from "../components/Header";

export function ClientLayout({ children }) {
  return (
    <div className="client-layout d-flex flex-column min-vh-100 bg-black text-light">
      <Header />
      <main className="flex-grow-1">{children}</main>
    </div>
  );
}

export default ClientLayout;
