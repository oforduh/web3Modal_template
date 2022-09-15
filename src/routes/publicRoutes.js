import Navbar from "../components/navbar/Navbar";

export default function PublicRoute({ children }) {
  return (
    <>
      <aside>
        <Navbar />
        {children}
      </aside>
    </>
  );
}
