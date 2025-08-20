# HappyCows/HappierCows - GitHub Copilot Development Instructions

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Project Overview

HappyCows/HappierCows is a Spring Boot (Java) + React (JavaScript) web application that simulates the Tragedy of the Commons. The backend uses Spring Security with Google OAuth for authentication, and the frontend is a React single-page application.

## Working Effectively

### Prerequisites and Environment Setup

**CRITICAL**: Install exact versions to avoid compatibility issues:

1. **Install Java 17**:
   ```bash
   # Java 17 is required (check with java -version)
   # The project is configured for Java 17 in .java-version and pom.xml
   # The only exception to this is if you are told, in a specific issue, to migrate the code base to another version of Java (e.g. Java 21), in which case you should update this instruction to refer to, for example, Java 21 instead of Java 17.
   ```

2. **Install Node.js 22.18.0 exactly**:
   ```bash
   # Download and install Node.js 22.18.0 (EXACT VERSION REQUIRED)
   curl -fsSL https://nodejs.org/dist/v22.18.0/node-v22.18.0-linux-x64.tar.xz -o /tmp/node-v22.18.0-linux-x64.tar.xz
   cd /tmp && tar -xf node-v22.18.0-linux-x64.tar.xz
   export PATH="/tmp/node-v22.18.0-linux-x64/bin:$PATH"
   # Verify: node -v should show v22.18.0

   The only exception to this is if/when you are instructed to migrate the code base to a new version of node.
   In that case, you should use the current LTS version of node, and update these instructions to reflect that.

3. **Setup OAuth configuration**:
   ```bash
   # Copy environment template (REQUIRED before running)
   cp .env.SAMPLE .env
   # Edit .env to add your Google OAuth credentials (see docs/oauth.md)
   ```

### Backend Commands

**NEVER CANCEL these commands - builds and tests may take longer than expected:**

- **Build backend**: `mvn compile` - takes ~45 seconds (first time with dependency downloads)
- **Run unit tests**: `mvn test` - takes ~53 seconds, NEVER CANCEL. Set timeout to 90+ seconds.
- **Start backend server**: `mvn spring-boot:run` - starts in ~4 seconds, runs on http://localhost:8080
- **Clean build**: `mvn clean` - takes ~2 seconds

### Frontend Commands

**All frontend commands must use Node.js 22.18.0:**

- **Install dependencies**: `cd frontend && npm install` - takes ~22 seconds (first time)
- **Start dev server**: `cd frontend && npm start` - compiles in ~10 seconds, runs on http://localhost:3000
- **Run tests**: `cd frontend && npm test -- --coverage --watchAll=false` - takes ~26 seconds, achieves 100% coverage
- **Production build**: `cd frontend && npm run build` - takes ~12 seconds
- **Start Storybook**: `cd frontend && npm run storybook` - starts on http://localhost:6006
- **Run ESLint**: `cd frontend && npx eslint src --ext .js` - takes ~5 seconds

### Integration Tests

**NEVER CANCEL - Integration tests require patience:**

```bash
# Complete integration test sequence (takes ~1-2 minutes total)
mvn clean
INTEGRATION=true mvn test-compile  # takes ~60 seconds with frontend build
INTEGRATION=true mvn failsafe:integration-test  # takes ~27 seconds
```

**Note**: Integration tests may fail in environments without Playwright browsers installed. This is normal in CI environments.

For headless mode:
```bash
INTEGRATION=true HEADLESS=false mvn failsafe:integration-test
```

### Mutation Testing

**NEVER CANCEL - Mutation testing takes significant time:**

- **Single class**: `mvn pitest:mutationCoverage -DtargetClasses=edu.ucsb.cs156.happiercows.entities.Commons` - takes ~72 seconds
- **Single package**: `mvn pitest:mutationCoverage -DtargetClasses=edu.ucsb.cs156.happiercows.controllers.\*` - takes 5-15+ minutes
- **Full mutation coverage**: `mvn pitest:mutationCoverage` - takes 30-60+ minutes. NEVER CANCEL. Set timeout to 90+ minutes.

Frontend mutation testing (Stryker):
```bash
cd frontend && npx stryker run
# Takes 10-30+ minutes depending on scope. NEVER CANCEL.
```

## Application Startup

**To run the complete application:**

1. **Terminal 1 - Backend**:
   ```bash
   mvn spring-boot:run
   # Wait for "Started HappierCowsApplication" message (~4 seconds)
   ```

2. **Terminal 2 - Frontend**:
   ```bash
   cd frontend
   export PATH="/tmp/node-v22.18.0-linux-x64/bin:$PATH"  # Use exact Node version
   npm start
   # Wait for "Compiled successfully!" message (~10 seconds)
   ```

3. **Access the application**:
   - Main app: http://localhost:8080 (serves both backend API and frontend)
   - Frontend dev: http://localhost:3000 (development mode with hot reload)
   - API docs: http://localhost:8080/swagger-ui/index.html
   - Database: http://localhost:8080/h2-console (localhost only)
   - Storybook: http://localhost:6006 (when running)

## Validation and Testing

### Always run these validation steps after making changes:

1. **Backend validation**:
   ```bash
   mvn test  # Ensure all unit tests pass
   mvn compile  # Ensure compilation succeeds
   ```

2. **Frontend validation**:
   ```bash
   cd frontend
   npm test -- --coverage --watchAll=false  # Ensure 100% test coverage
   npx eslint src --ext .js  # Ensure no linting errors
   npm run build  # Ensure production build succeeds
   ```

3. **Integration validation**:
   ```bash
   # Test complete application startup
   mvn spring-boot:run &  # Start backend
   cd frontend && npm start &  # Start frontend
   # Verify both http://localhost:8080 and http://localhost:3000 respond
   ```

### Manual Testing Scenarios

After making changes, always test these user workflows:

1. **Basic navigation**: Visit home page, verify it loads without errors
2. **Authentication flow**: Click login, verify OAuth redirect works (requires valid .env)
3. **API access**: Visit http://localhost:8080/swagger-ui/index.html and verify Swagger loads
4. **Database access**: Visit http://localhost:8080/h2-console and verify console loads

## Common Issues and Solutions

### Environment Issues

- **Node version mismatch**: Always use exactly Node.js 22.18.0. Check with `node -v`.
- **OAuth errors**: Ensure `.env` file exists and contains valid Google OAuth credentials
- **Port conflicts**: Default ports are 8080 (backend), 3000 (frontend), 6006 (Storybook)

### Build Issues

- **Maven download timeouts**: Use longer timeouts (90+ seconds) for first builds
- **Frontend dependency issues**: Delete `node_modules` and run `npm install` again
- **Integration test failures**: Usually due to missing Playwright browsers in CI environments

### Timing Expectations

- **NEVER CANCEL** any build or test command - they may take longer than expected
- Maven compile: 45 seconds (first time), 10 seconds (subsequent)
- Maven tests: 53 seconds, never cancel
- npm install: 22 seconds (first time)
- Integration tests: 60-90 seconds total
- Mutation testing: 5-60+ minutes depending on scope

## Repository Structure

### Key Directories

- **`/`**: Spring Boot backend root with `pom.xml`
- **`/src/main/java`**: Java backend source code
- **`/src/test/java`**: Java backend test code
- **`/frontend`**: React frontend application root with `package.json`
- **`/frontend/src/main`**: React source code
- **`/frontend/src/tests`**: React test code
- **`/docs`**: Documentation including OAuth setup guide

### Important Files

- **`.env.SAMPLE`**: Template for environment variables (copy to `.env`)
- **`.java-version`**: Specifies Java 17 requirement
- **`pom.xml`**: Maven configuration with Spring Boot dependencies
- **`frontend/package.json`**: npm configuration with React dependencies
- **`Dockerfile`**: Production deployment configuration

### CI/CD Integration

The repository has extensive GitHub Actions workflows:
- Backend unit tests: `.github/workflows/10-backend-unit.yml`
- Frontend tests: `.github/workflows/30-frontend-tests.yml`
- Integration tests: `.github/workflows/11-backend-integration.yml`
- Mutation testing: `.github/workflows/13-backend-incremental-pitest.yml`

Always ensure your changes pass all CI checks by running equivalent local commands before committing.