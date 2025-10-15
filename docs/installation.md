# Setup
1. Be sure to be using java 21.0.6-librca, otherwise, you may hit compiling issues with the jvm. Run with `sdk use java 21.0.6-librca`
2. In the [env sample](https://github.com/ucsb-cs156/proj-happycows/blob/main/.env.SAMPLE), set each environment variable up:
- `ADMIN_EMAILS=<check slack or ask teaching team>`
- `GOOGLE_CLIENT_ID=<google client id>`   (see [here](https://ucsb-cs156.github.io/topics/oauth/oauth_google_setup.html) for how to set it up)
- `GOOGLE_CLIENT_SECRET=<google_client_secret>`   (see [here](https://ucsb-cs156.github.io/topics/oauth/oauth_google_setup.html) for how to set it up)

# Running 
1. Backend: on the project directory, run `mvn compile` and `mvn spring-boot:run`
2. `cd frontend`, then `npm install` (to install dependencies from `package.json`)
3. Frontend: `npm start`
