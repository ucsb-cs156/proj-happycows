import { BrowserRouter, Routes, Route } from "react-router";
import { useEffect, useRef } from "react";
import { useBackendMutation } from "main/utils/useBackend";
import HomePage from "main/pages/HomePage";
import LoadingPage from "main/pages/LoadingPage";
import LoginPage from "main/pages/LoginPage";
import ProfilePage from "main/pages/ProfilePage";
import DashboardPage from "main/pages/DashboardPage";

import "bootstrap/dist/css/bootstrap.css";
import "react-toastify/dist/ReactToastify.css";

import AdminUsersPage from "main/pages/AdminUsersPage";
import AdminJobsPage from "main/pages/AdminJobsPage";
import AdminCreateGamePage from "main/pages/AdminCreateGamePage";
import AdminViewReportPage from "main/pages/AdminViewReportPage";
import AdminCoursesIndexPage from "main/pages/AdminCoursesIndexPage";
import AdminCoursesCreatePage from "main/pages/AdminCoursesCreatePage";
import AdminCoursesEditPage from "main/pages/AdminCoursesEditPage";
import AdminEditGamePage from "main/pages/AdminEditGamePage";
import AdminListGamePageV2 from "main/pages/AdminListGamePageV2";
import InstructorAdminShowPage from "main/pages/InstructorAdminShowPage";
import AdminChatPage from "main/pages/AdminChatPage";
import AdminReportsPage from "main/pages/AdminReportsPage";
import { hasRole, useCurrentUser } from "main/utils/currentUser";
import PlayPage from "main/pages/PlayPage";
import NotFoundPage from "main/pages/NotFoundPage";
import AdminViewPlayPage from "main/pages/AdminViewPlayPage";
import AdminFarmerActivityPage from "main/pages/AdminFarmerActivityPage";
import AdminGameActivityPage from "main/pages/AdminGameActivityPage";
import AdminAnnouncementsPage from "main/pages/AdminAnnouncementsPage";
import AdminCreateAnnouncementsPage from "main/pages/AdminCreateAnnouncementsPage";
import AdminEditAnnouncementsPage from "main/pages/AdminEditAnnouncementsPage";
import DeveloperPage from "main/pages/DeveloperPage";
import ChatHistoryPage from "main/pages/ChatHistoryPage";

function App() {
  const { data: currentUser } = useCurrentUser();

  const adminRoutes = hasRole(currentUser, "ROLE_ADMIN") ? (
    <>
      <Route path="/admin/users" element={<AdminUsersPage />} />
      <Route path="/admin/jobs" element={<AdminJobsPage />} />
      <Route path="/admin/reports" element={<AdminReportsPage />} />
      <Route path="/admin/report/:reportId" element={<AdminViewReportPage />} />
      <Route path="/admin/creategame" element={<AdminCreateGamePage />} />
      <Route path="/admin/listgamev2" element={<AdminListGamePageV2 />} />
      <Route path="/admin/editgame/:id" element={<AdminEditGamePage />} />
      <Route path="/admin/chat/:gameId" element={<AdminChatPage />} />
      <Route path="/admin/dashboard/:id" element={<DashboardPage />} />
      <Route path="/admin/listcourses" element={<AdminCoursesIndexPage />} />
      <Route path="/admin/createcourses" element={<AdminCoursesCreatePage />} />
      <Route path="/admin/editcourses/:id" element={<AdminCoursesEditPage />} />
      <Route path="/admin/courses/:id" element={<InstructorAdminShowPage />} />
      <Route
        path="/admin/play/:gameId/user/:userId"
        element={<AdminViewPlayPage />}
      />
      <Route
        path="/admin/farmeractivity/:gameId/user/:userId"
        element={<AdminFarmerActivityPage />}
      />
      <Route
        path="/admin/gameactivity/:gameId"
        element={<AdminGameActivityPage />}
      />
      <Route
        path="/admin/announcements/:gameId"
        element={<AdminAnnouncementsPage />}
      />
      <Route
        path="/admin/announcements/:gameId/create"
        element={<AdminCreateAnnouncementsPage />}
      />
      <Route
        path="/admin/announcements/:gameId/edit/:announcementId"
        element={<AdminEditAnnouncementsPage />}
      />
      <Route path="/developer" element={<DeveloperPage />} />
      <Route path="/chat/:gameId" element={<ChatHistoryPage />} />
    </>
  ) : null;

  const userRoutes = hasRole(currentUser, "ROLE_USER") ? (
    <>
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/dashboard/:gameId" element={<DashboardPage />} />
      <Route path="/play/:gameId" element={<PlayPage />} />
      <Route path="/chat/:gameId" element={<ChatHistoryPage />} />
    </>
  ) : null;

  const homeRoute =
    hasRole(currentUser, "ROLE_ADMIN") || hasRole(currentUser, "ROLE_USER") ? (
      <Route path="/" element={<HomePage />} />
    ) : (
      <Route path="/" element={<LoginPage />} />
    );

  /*  Display the LoadingPage while awaiting currentUser 
      response to prevent the NotFoundPage from displaying */
  const updateLastOnlineMutation = useBackendMutation(
    () => ({ method: "POST", url: "/api/currentUser/last-online" }),
    {},
  );

  const updatedOnlineOnMount = useRef(false);

  useEffect(() => {
    if (currentUser && currentUser.loggedIn) {
      if (!updatedOnlineOnMount.current) {
        updatedOnlineOnMount.current = true;
        updateLastOnlineMutation.mutate();
      }

      const interval = setInterval(() => {
        updateLastOnlineMutation.mutate();
      }, 60000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [currentUser, updateLastOnlineMutation]);

  return (
    <BrowserRouter>
      {currentUser?.initialData ? (
        <LoadingPage />
      ) : (
        <Routes>
          {homeRoute}
          {adminRoutes}
          {userRoutes}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;
