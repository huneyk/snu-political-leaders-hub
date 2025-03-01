
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import Greeting from "./pages/Greeting";
import AdmissionApply from "./pages/AdmissionApply";
import ScheduleLecturers from "./pages/ScheduleLecturers";
import Gallery from "./pages/Gallery";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";

// 관리자 페이지 컴포넌트 추가
import GreetingManage from "./pages/admin/GreetingManage";
import RecommendationsManage from "./pages/admin/RecommendationsManage";
import CourseGoalManage from "./pages/admin/CourseGoalManage";
import CourseBenefitsManage from "./pages/admin/CourseBenefitsManage";
import ProfessorsManage from "./pages/admin/ProfessorsManage";
import UsersManage from "./pages/admin/UsersManage";
import ScheduleManage from "./pages/admin/ScheduleManage";
import GalleryManage from "./pages/admin/GalleryManage";
import NoticesManage from "./pages/admin/NoticesManage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/intro/greeting" element={<Greeting />} />
          <Route path="/admission/apply" element={<AdmissionApply />} />
          <Route path="/schedule/lecturers" element={<ScheduleLecturers />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* 관리자 페이지 경로 추가 */}
          <Route path="/admin/greeting" element={<GreetingManage />} />
          <Route path="/admin/recommendations" element={<RecommendationsManage />} />
          <Route path="/admin/course-goal" element={<CourseGoalManage />} />
          <Route path="/admin/course-benefits" element={<CourseBenefitsManage />} />
          <Route path="/admin/professors" element={<ProfessorsManage />} />
          <Route path="/admin/users" element={<UsersManage />} />
          <Route path="/admin/schedule" element={<ScheduleManage />} />
          <Route path="/admin/gallery" element={<GalleryManage />} />
          <Route path="/admin/notices" element={<NoticesManage />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
