import { Button, Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { Link } from "react-router";
import { hasRole } from "main/utils/currentUser";
import AppNavbarLocalhost from "main/components/Nav/AppNavbarLocalhost";

export default function AppNavbar({
  currentUser,
  systemInfo,
  doLogout,
  currentUrl = window.location.href,
}) {
  var oauthLogin = systemInfo?.oauthLogin || "/oauth2/authorization/google";
  return (
    <>
      {(currentUrl.startsWith("http://localhost:3000") ||
        currentUrl.startsWith("http://127.0.0.1:3000")) && (
        <AppNavbarLocalhost url={currentUrl} />
      )}
      <Navbar
        expand="xl"
        variant="dark"
        bg="dark"
        sticky="top"
        data-testid="AppNavbar"
      >
        <Container>
          <Navbar.Brand
            as={Link}
            to="/"
            style={
              // Stryker disable all : don't mutation test CSS
              {
                fontFamily: "Rye",
              }
              // Stryker restore all
            }
          >
            Happy Cows
          </Navbar.Brand>

          <Navbar.Toggle />

          <Nav className="me-auto">
            {systemInfo?.springH2ConsoleEnabled && (
              <>
                <Nav.Link href="/h2-console">H2Console</Nav.Link>
              </>
            )}
            {systemInfo?.showSwaggerUILink && (
              <>
                <Nav.Link href="/swagger-ui/index.html">Swagger</Nav.Link>
              </>
            )}
          </Nav>

          <>
            {/* be sure that each NavDropdown has a unique id and data-testid  */}
          </>

          <Navbar.Collapse className="justify-content-between">
            <Nav className="mr-auto">
              {hasRole(currentUser, "ROLE_ADMIN") && (
                <NavDropdown
                  title="Admin"
                  id="appnavbar-admin-dropdown"
                  data-testid="appnavbar-admin-dropdown"
                >
                  <NavDropdown.Item href="/admin/createcommons">
                    Create Commons
                  </NavDropdown.Item>
                  <NavDropdown.Item href="/admin/listcommons">
                    List Commons
                  </NavDropdown.Item>
                  <NavDropdown.Item href="/admin/liststudents">
                    Students
                  </NavDropdown.Item>
                  <NavDropdown.Item href="/admin/listcourses">
                    Courses
                  </NavDropdown.Item>
                  <NavDropdown.Item href="/admin/users">Users</NavDropdown.Item>
                  <NavDropdown.Item href="/admin/jobs">
                    Manage Jobs
                  </NavDropdown.Item>
                  <NavDropdown.Item href="/admin/reports">
                    Instructor Reports
                  </NavDropdown.Item>
                  <NavDropdown.Item href="/admin/developer">
                    Developer Info
                  </NavDropdown.Item>
                </NavDropdown>
              )}
            </Nav>

            <Nav className="ml-auto">
              {currentUser && currentUser.loggedIn ? (
                <>
                  <Navbar.Text className="me-3" as={Link} to="/profile">
                    Welcome, {currentUser.root.user.email}
                  </Navbar.Text>
                  <Button
                    onClick={
                      doLogout
                    } /*Stryker disable next-line all : don't mutation test CSS*/
                    style={{ fontFamily: "Rye" }}
                  >
                    Log Out
                  </Button>
                </>
              ) : (
                <Button
                  href={oauthLogin}
                  /*Stryker disable next-line all : don't mutation test CSS*/
                  style={{ fontFamily: "Rye" }}
                >
                  Log In
                </Button>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}
