import Header from "../components/Header";

export function CommonLayout({ children }) {
  return (
    <div className="common-layout d-flex flex-column min-vh-100 bg-black text-light">
      <Header />
      <main className="flex-grow-1 d-flex align-items-center justify-content-center py-4">
        {children}
      </main>
    </div>
  );
}

export default CommonLayout;
