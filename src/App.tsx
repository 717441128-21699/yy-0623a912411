import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home } from "@/pages/Home";
import { Game } from "@/pages/Game";
import { Result } from "@/pages/Result";
import { WrongBook } from "@/pages/WrongBook";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game/:levelId" element={<Game />} />
        <Route path="/practice/:levelId" element={<Game />} />
        <Route path="/result/:levelId" element={<Result />} />
        <Route path="/wrong-book" element={<WrongBook />} />
      </Routes>
    </Router>
  );
}
