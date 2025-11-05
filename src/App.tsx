import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from 'react';
import MobileFloatingMenu from "@/components/MobileFloatingMenu";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Greeting = lazy(() => import("./pages/Greeting"));
const AdmissionInfo = lazy(() => import("./pages/AdmissionInfo"));
const Recommendations = lazy(() => import("./pages/intro/Recommendations"));
const Objectives = lazy(() => import("./pages/intro/Objectives"));
const CourseBenefits = lazy(() => import("./pages/intro/CourseBenefits"));
const Professors = lazy(() => import("./pages/intro/Professors"));
const Rules = lazy(() => import("./pages/admission/Rules"));
const ScheduleLecturers = lazy(() => import("./pages/ScheduleLecturers"));
const ScheduleCalendar = lazy(() => import("./pages/ScheduleCalendar"));
const ScheduleActivities = lazy(() => import("./pages/ScheduleActivities"));
const Gallery = lazy(() => import("./pages/Gallery"));
const GalleryByTerm = lazy(() => import("./pages/GalleryByTerm"));
const Notices = lazy(() => import("./pages/Notices"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Admin pages - separate chunks for admin functionality
const Admin = lazy(() => import("./pages/Admin"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const GreetingManage = lazy(() => import("./pages/admin/GreetingManage"));
const RecommendationsManage = lazy(() => import("./pages/admin/RecommendationsManage"));
const CourseGoalManage = lazy(() => import("./pages/admin/CourseGoalManage"));
const CourseBenefitsManage = lazy(() => import("./pages/admin/CourseBenefitsManage"));
const ProfessorsManage = lazy(() => import("./pages/admin/ProfessorsManage"));
const FacultyManage = lazy(() => import("./pages/admin/FacultyManage"));
const UsersManage = lazy(() => import("./pages/admin/UsersManage"));
const ScheduleManage = lazy(() => import("./pages/admin/ScheduleManage"));
const GalleryManage = lazy(() => import("./pages/admin/GalleryManage"));
const NoticesManage = lazy(() => import("./pages/admin/NoticesManage"));
const AdmissionManage = lazy(() => import("./pages/admin/AdmissionManage"));
const FooterManage = lazy(() => import("./pages/admin/FooterManage"));

// Loading component
const Loading = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mainBlue"></div>
  </div>
);

import withAdminHomeButton from "./components/admin/withAdminHomeButton";

// Apply HOC to admin pages - keeping HOC simple while lazy loading the pages
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
            <Route path="/gallery/term/:term" element={<GalleryByTerm />} />
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
