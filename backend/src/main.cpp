#include <iostream>
#include <memory>
#include <string>
#include <filesystem>

#include <spdlog/spdlog.h>
#include <grpcpp/grpcpp.h>
#include <nlohmann/json.hpp>

#include "api/search_service.h"

// Configuration structure
struct Config {
    std::string server_address = "0.0.0.0:50051";
    std::string model_path = "models/clip-model.onnx";
    std::string index_path = "data/vector_index";
    std::string index_type = "Flat";
    bool verbose = false;
};

// Load configuration from file
Config loadConfig(const std::string& config_path) {
    Config config;
    
    try {
        if (std::filesystem::exists(config_path)) {
            std::ifstream file(config_path);
            nlohmann::json json;
            file >> json;
            
            if (json.contains("server_address")) {
                config.server_address = json["server_address"];
            }
            
            if (json.contains("model_path")) {
                config.model_path = json["model_path"];
            }
            
            if (json.contains("index_path")) {
                config.index_path = json["index_path"];
            }
            
            if (json.contains("index_type")) {
                config.index_type = json["index_type"];
            }
            
            if (json.contains("verbose")) {
                config.verbose = json["verbose"];
            }
        }
    } catch (const std::exception& e) {
        spdlog::warn("Failed to load config from {}: {}", config_path, e.what());
    }
    
    return config;
}

int main(int argc, char** argv) {
    // Initialize logger
    spdlog::set_level(spdlog::level::info);
    spdlog::info("Starting nlSearch backend server");
    
    // Load configuration
    std::string config_path = "config.json";
    if (argc > 1) {
        config_path = argv[1];
    }
    
    Config config = loadConfig(config_path);
    
    // Set logging level
    if (config.verbose) {
        spdlog::set_level(spdlog::level::debug);
    }
    
    // Create directories if they don't exist
    try {
        std::filesystem::create_directories(std::filesystem::path(config.model_path).parent_path());
        std::filesystem::create_directories(std::filesystem::path(config.index_path).parent_path());
    } catch (const std::exception& e) {
        spdlog::warn("Failed to create directories: {}", e.what());
    }
    
    // Create service instance
    std::unique_ptr<nlsearch::api::SearchServiceImpl> service = nullptr;
    
    try {
        service = std::make_unique<nlsearch::api::SearchServiceImpl>(
            config.model_path, config.index_path, config.index_type);
        
        // Set up the server
        grpc::ServerBuilder builder;
        builder.AddListeningPort(config.server_address, grpc::InsecureServerCredentials());
        
        // Register service
        builder.RegisterService(service->service());
        
        // Start the server
        std::unique_ptr<grpc::Server> server = builder.BuildAndStart();
        spdlog::info("Server listening on {}", config.server_address);
        
        // Wait for the server to shutdown
        server->Wait();
    } catch (const std::exception& e) {
        spdlog::critical("Failed to start server: {}", e.what());
        return 1;
    }
    
    return 0;
}