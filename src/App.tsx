import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home } from "@/pages/Home";
import { Game } from "@/pages/Game";
import { Result } from "@/pages/Result";
import { WrongBook } from "@/pages/WrongBook";
import { LearningProfilePage } from "@/pages/LearningProfile";
import { ReportDetail } from "@/pages/ReportDetail";
import { PracticeBuilder } from "@/pages/PracticeBuilder";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game/:levelId" element={<Game />} />
        <Route path="/practice/:levelId" element={<Game />} />
        <Route path="/practice-builder/:levelId" element={<PracticeBuilder />} />
        <Route path="/result/:levelId" element={<Result />} />
        <Route path="/wrong-book" element={<WrongBook />} />
        <Route path="/learning-profile" element={<LearningProfilePage />} />
        <Route path="/learning-profile/:levelId" element={<LearningProfilePage />} />
        <Route path="/report/:reportId" element={<ReportDetail />} />
      </Routes>
    </Router>
  );
}
