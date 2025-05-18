# nlSearch

This project implements a simple natural language image and video search engine following the provided blueprint.

The backend is written in **C++17** and built with **CMake**. It uses a very
minimal HTTP server implementation to avoid external dependencies. The frontend
is built with **TypeScript** and **React** using **Vite**.

## Building the Backend

```bash
mkdir -p build && cd build
cmake ..
make -j
./backend/nlsearch_server
```

## Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

Navigate to `http://localhost:3000` to access the UI.
