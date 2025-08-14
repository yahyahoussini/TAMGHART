import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export const PublicLayout = () => {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};
