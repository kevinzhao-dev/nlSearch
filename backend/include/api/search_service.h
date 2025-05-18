#pragma once

#include <memory>
#include <string>
#include <unordered_map>

// Forward declarations
namespace grpc {
    class ServerCompletionQueue;
    class ServerContext;
}

namespace nlsearch {
namespace core {
    class VectorSearch;
}
namespace models {
    class ModelInference;
}

namespace api {

// Forward declaration for the generated service class
class SearchService;

/**
 * @brief Implementation of the SearchService gRPC service
 */
class SearchServiceImpl {
public:
    /**
     * @brief Constructor
     * @param model_path Path to the CLIP model file
     * @param index_path Path to save/load the vector index
     * @param index_type Type of FAISS index to use
     */
    SearchServiceImpl(
        const std::string& model_path,
        const std::string& index_path,
        const std::string& index_type = "Flat");
    
    ~SearchServiceImpl();
    
    /**
     * @brief Get the gRPC service implementation
     * @return Raw pointer to the service (ownership remains with this class)
     */
    SearchService* service();
    
private:
    // Actual implementation classes, managed by this class
    class Impl;
    std::unique_ptr<Impl> impl_;
};

} // namespace api
} // namespace nlsearch