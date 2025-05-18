// Minimal HTTP server using POSIX sockets. This avoids external
// dependencies so the project can build in constrained environments.

#include <arpa/inet.h>
#include <netinet/in.h>
#include <sys/socket.h>
#include <unistd.h>

#include <cstring>
#include <iostream>
#include <string>
#include <thread>

void handle_client(int client_fd) {
  char buffer[4096];
  ssize_t received = read(client_fd, buffer, sizeof(buffer) - 1);
  if (received <= 0) {
    close(client_fd);
    return;
  }
  buffer[received] = '\0';
  std::string body = "{\"results\":[\"stub result\"]}";
  std::string response =
      "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n";
  response +=
      "Content-Length: " + std::to_string(body.size()) + "\r\n\r\n" + body;
  send(client_fd, response.c_str(), response.size(), 0);
  close(client_fd);
}

int main() {
  int server_fd = socket(AF_INET, SOCK_STREAM, 0);
  if (server_fd < 0) {
    std::cerr << "Failed to create socket\n";
    return 1;
  }

  int opt = 1;
  setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

  sockaddr_in addr{};
  addr.sin_family = AF_INET;
  addr.sin_addr.s_addr = INADDR_ANY;
  addr.sin_port = htons(50051);

  if (bind(server_fd, reinterpret_cast<sockaddr*>(&addr), sizeof(addr)) < 0) {
    std::cerr << "Bind failed\n";
    return 1;
  }

  if (listen(server_fd, 5) < 0) {
    std::cerr << "Listen failed\n";
    return 1;
  }

  std::cout << "Server listening on 0.0.0.0:50051" << std::endl;
  while (true) {
    int client_fd = accept(server_fd, nullptr, nullptr);
    if (client_fd < 0) {
      continue;
    }
    std::thread(handle_client, client_fd).detach();
  }

  close(server_fd);
  return 0;
}
