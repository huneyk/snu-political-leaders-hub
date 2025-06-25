import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from 'react';
import MobileFloatingMenu from "@/components/MobileFloatingMenu";

import Index from "./pages/Index";
import Greeting from "./pages/Greeting";
import AdmissionInfo from "./pages/AdmissionInfo";
import Recommendations from "./pages/intro/Recommendations";
import Objectives from "./pages/intro/Objectives";
import CourseBenefits from "./pages/intro/CourseBenefits";
import Professors from "./pages/intro/Professors";
import Rules from "./pages/admission/Rules";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import GreetingManage from "./pages/admin/GreetingManage";
import RecommendationsManage from "./pages/admin/RecommendationsManage";
import CourseGoalManage from "./pages/admin/CourseGoalManage";
import CourseBenefitsManage from "./pages/admin/CourseBenefitsManage";
import ProfessorsManage from "./pages/admin/ProfessorsManage";
import FacultyManage from "./pages/admin/FacultyManage";
import UsersManage from "./pages/admin/UsersManage";
import ScheduleManage from "./pages/admin/ScheduleManage";
import GalleryManage from "./pages/admin/GalleryManage";
import NoticesManage from "./pages/admin/NoticesManage";
import AdmissionManage from "./pages/admin/AdmissionManage";
import FooterManage from "./pages/admin/FooterManage";
import ScheduleLecturers from "./pages/ScheduleLecturers";
import ScheduleCalendar from "./pages/ScheduleCalendar";
import ScheduleActivities from "./pages/ScheduleActivities";
import Gallery from "./pages/Gallery";
import Notices from "./pages/Notices";
import NotFound from "./pages/NotFound";

// Loading component
const Loading = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mainBlue"></div>
  </div>
);

import withAdminHomeButton from "./components/admin/withAdminHomeButton";

// Apply HOC to admin pages
const GreetingManageWithButton = withAdminHomeButton(GreetingManage);
const RecommendationsManageWithButton = withAdminHomeButton(RecommendationsManage);
const CourseGoalManageWithButton = withAdminHomeButton(CourseGoalManage);
const CourseBenefitsManageWithButton = withAdminHomeButton(CourseBenefitsManage);
const ProfessorsManageWithButton = withAdminHomeButton(ProfessorsManage);
const FacultyManageWithButton = withAdminHomeButton(FacultyManage);
const UsersManageWithButton = withAdminHomeButton(UsersManage);
const ScheduleManageWithButton = withAdminHomeButton(ScheduleManage);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/intro/greeting" element={<Greeting />} />
            <Route path="/intro/recommendations" element={<Recommendations />} />
            <Route path="/intro/objectives" element={<Objectives />} />
            <Route path="/intro/benefits" element={<CourseBenefits />} />
            <Route path="/intro/professors" element={<Professors />} />
            <Route path="/admission/info" element={<AdmissionInfo />} />
            <Route path="/admission/rules" element={<Rules />} />
            <Route path="/schedule/lecturers" element={<ScheduleLecturers />} />
            <Route path="/schedule/calendar" element={<ScheduleCalendar />} />
            <Route path="/schedule/activities" element={<ScheduleActivities />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/notices" element={<Notices />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            
            {/* 관리자 페이지 경로 추가 */}
            <Route path="/admin/greeting" element={<GreetingManageWithButton />} />
            <Route path="/admin/recommendations" element={<RecommendationsManageWithButton />} />
            <Route path="/admin/course-goal" element={<CourseGoalManageWithButton />} />
            <Route path="/admin/course-benefits" element={<CourseBenefitsManageWithButton />} />
            <Route path="/admin/professors" element={<ProfessorsManageWithButton />} />
            <Route path="/admin/faculty" element={<FacultyManageWithButton />} />
            <Route path="/admin/users" element={<UsersManageWithButton />} />
            <Route path="/admin/schedule" element={<ScheduleManageWithButton />} />
            <Route path="/admin/gallery" element={<GalleryManage />} />
            <Route path="/admin/notices" element={<NoticesManage />} />
            <Route path="/admin/admission" element={<AdmissionManage />} />
            <Route path="/admin/footer" element={<FooterManage />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <MobileFloatingMenu />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
