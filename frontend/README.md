
  # Association Management Platform

  This is a code bundle for Association Management Platform. The original project is available at https://www.figma.com/design/chW1QTvgk8m76liKttEKRS/Association-Management-Platform.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  The app runs on http://localhost:3000.

  ## Using Docker (optional)

  You can also run the frontend in Docker (useful with docker-compose):

  ```bash
  # Build the image
  docker build -t gestion-assos-frontend .

  # Run the container, mapping port 3000
  docker run --rm -p 3000:3000 gestion-assos-frontend
  ```

  When using the top-level docker-compose.yml, simply run from the repository root:

  ```bash
  docker compose up frontend --build
  ```

  Vite is bound to 0.0.0.0 so it is reachable from the host.
  