import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Contacts from "./pages/Contacts";
import Search from "./pages/Search";
import ContactDetail from "./pages/ContactDetail";
import Categories from "./pages/Categories";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-bg">
        <div className="app-layout">
          <Navbar />
          <main className="app-main">
            <Routes>
              <Route path="/"               element={<Home />} />
              <Route path="/contacts"       element={<Contacts />} />
              <Route path="/contacts/:id"   element={<ContactDetail />} />
              <Route path="/search"         element={<Search />} />
              <Route path="/categories"     element={<Categories />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
