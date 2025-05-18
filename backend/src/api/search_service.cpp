#include "api/search_service.h"

#include <fstream>
#include <sstream>
#include <filesystem>
#include <vector>
#include <mutex>
#include <chrono>
#include <atomic>

#include <spdlog/spdlog.h>
#include <nlohmann/json.hpp>
#include <grpcpp/grpcpp.h>

#include "core/vector_search.h"
#include "models/model_inference.h"
#include "generated/search_service.grpc.pb.h"

namespace nlsearch {
namespace api {

namespace {
    // Directory for temporary files
    constexpr const char* kTempDir = "/tmp/nlsearch";
    
    // Generate a unique ID
    std::string generateUniqueId() {
        static std::atomic<uint64_t> counter{0};
        auto now = std::chrono::system_clock::now();
        auto now_ms = std::chrono::time_point_cast<std::chrono::milliseconds>(now);
        auto value = now_ms.time_since_epoch().count();
        
        std::stringstream ss;
        ss << std::hex << value << "-" << counter++;
        return ss.str();
    }
    
    // Save uploaded media to a temporary file
    std::string saveTempMedia(const std::string& media_id, const std::string& media_type, const std::string& data) {
        std::filesystem::create_directories(kTempDir);
        
        // Determine file extension based on media type
        std::string ext = ".bin";
        if (media_type.find("jpeg") != std::string::npos || media_type.find("jpg") != std::string::npos) {
            ext = ".jpg";
        } else if (media_type.find("png") != std::string::npos) {
            ext = ".png";
        } else if (media_type.find("mp4") != std::string::npos) {
            ext = ".mp4";
        }
        
        std::string file_path = std::string(kTempDir) + "/" + media_id + ext;
        
        std::ofstream file(file_path, std::ios::binary);
        file.write(data.data(), data.size());
        
        return file_path;
    }
}

// Private implementation class
class SearchServiceImpl::Impl final : public SearchService::Service {
public:
    Impl(const std::string& model_path, const std::string& index_path, const std::string& index_type)
        : model_path_(model_path), index_path_(index_path), next_media_id_(1) {
        
        // Initialize model
        try {
            model_ = models::createClipModel(model_path);
            spdlog::info("Model loaded successfully from {}", model_path);
        } catch (const std::exception& e) {
            spdlog::error("Failed to load model: {}", e.what());
            throw;
        }
        
        // Initialize vector search
        search_engine_ = core::createFaissVectorSearch(model_->dimension(), index_type);
        
        // Try to load existing index
        if (!index_path.empty() && std::filesystem::exists(index_path + ".index")) {
            if (search_engine_->load(index_path)) {
                spdlog::info("Loaded existing index with {} vectors", search_engine_->size());
            }
        }
    }
    
    ~Impl() {
        // Save index on shutdown
        if (!index_path_.empty() && search_engine_->size() > 0) {
            if (search_engine_->save(index_path_)) {
                spdlog::info("Saved index with {} vectors", search_engine_->size());
            }
        }
    }
    
    // RPC method implementations
    grpc::Status TextSearch(grpc::ServerContext* context, const TextSearchRequest* request,
                         SearchResponse* response) override {
        spdlog::info("Text search request: {}", request->query());
        
        // Convert text to embedding
        std::vector<float> query_embedding = model_->encodeText(request->query());
        
        // Search for similar media
        size_t k = request->max_results() > 0 ? request->max_results() : 10;
        auto results = search_engine_->search(query_embedding, k);
        
        // Fill response
        response->set_total_results(results.size());
        response->set_truncated(false);
        
        for (const auto& result : results) {
            auto* media_result = response->add_results();
            media_result->set_media_id(std::to_string(result.id));
            media_result->set_score(result.score);
            media_result->set_url(result.path);
            
            // Set metadata if available
            if (result.metadata) {
                media_result->set_metadata(*result.metadata);
            }
        }
        
        return grpc::Status::OK;
    }
    
    grpc::Status IndexMedia(grpc::ServerContext* context, const IndexMediaRequest* request,
                         IndexMediaResponse* response) override {
        std::string media_id = generateUniqueId();
        spdlog::info("Index media request: {} (type: {})", request->file_name(), request->media_type());
        
        try {
            // Save media to temporary file
            std::string media_path = saveTempMedia(media_id, request->media_type(), request->media_data());
            
            // Generate embedding
            std::optional<std::vector<float>> embedding;
            
            if (request->media_type().find("video") != std::string::npos) {
                // For videos, use the first frame
                embedding = model_->encodeVideoFrame(media_path, 0);
            } else {
                // For images
                embedding = model_->encodeImage(media_path);
            }
            
            if (!embedding) {
                response->set_success(false);
                response->set_error_message("Failed to generate embedding for media");
                return grpc::Status::OK;
            }
            
            // Create metadata
            nlohmann::json metadata;
            metadata["file_name"] = request->file_name();
            metadata["media_type"] = request->media_type();
            metadata["album_id"] = request->album_id();
            
            if (!request->metadata().empty()) {
                // Parse and merge user metadata
                try {
                    nlohmann::json user_metadata = nlohmann::json::parse(request->metadata());
                    metadata.merge_patch(user_metadata);
                } catch (const std::exception& e) {
                    spdlog::warn("Failed to parse user metadata: {}", e.what());
                }
            }
            
            // Add to search index
            int64_t id = next_media_id_++;
            if (search_engine_->addVector(id, *embedding, media_path, metadata.dump())) {
                response->set_success(true);
                response->set_media_id(media_id);
            } else {
                response->set_success(false);
                response->set_error_message("Failed to add media to search index");
            }
            
        } catch (const std::exception& e) {
            spdlog::error("Exception during media indexing: {}", e.what());
            response->set_success(false);
            response->set_error_message(e.what());
        }
        
        return grpc::Status::OK;
    }
    
    grpc::Status MediaSearch(grpc::ServerContext* context, const MediaSearchRequest* request,
                          SearchResponse* response) override {
        spdlog::info("Media search request (type: {})", request->media_type());
        
        try {
            // Save query media to temporary file
            std::string query_id = generateUniqueId();
            std::string media_path = saveTempMedia(query_id, request->media_type(), request->media_data());
            
            // Generate embedding
            std::optional<std::vector<float>> embedding;
            
            if (request->media_type().find("video") != std::string::npos) {
                // For videos, use the first frame
                embedding = model_->encodeVideoFrame(media_path, 0);
            } else {
                // For images
                embedding = model_->encodeImage(media_path);
            }
            
            if (!embedding) {
                return grpc::Status(grpc::StatusCode::INTERNAL, "Failed to generate embedding for query media");
            }
            
            // Search for similar media
            size_t k = request->max_results() > 0 ? request->max_results() : 10;
            auto results = search_engine_->search(*embedding, k);
            
            // Fill response
            response->set_total_results(results.size());
            response->set_truncated(false);
            
            for (const auto& result : results) {
                auto* media_result = response->add_results();
                media_result->set_media_id(std::to_string(result.id));
                media_result->set_score(result.score);
                media_result->set_url(result.path);
                
                // Set metadata if available
                if (result.metadata) {
                    media_result->set_metadata(*result.metadata);
                    
                    // Try to extract media type from metadata
                    try {
                        auto json = nlohmann::json::parse(*result.metadata);
                        if (json.contains("media_type")) {
                            media_result->set_media_type(json["media_type"]);
                        }
                    } catch (...) {
                        // Ignore parsing errors
                    }
                }
            }
            
            // Clean up temporary file
            std::filesystem::remove(media_path);
            
        } catch (const std::exception& e) {
            spdlog::error("Exception during media search: {}", e.what());
            return grpc::Status(grpc::StatusCode::INTERNAL, e.what());
        }
        
        return grpc::Status::OK;
    }
    
    grpc::Status GetInfo(grpc::ServerContext* context, const GetInfoRequest* request,
                      GetInfoResponse* response) override {
        response->set_version("0.1.0");
        response->set_total_media_count(search_engine_->size());
        
        // Add supported types
        response->add_supported_types("image/jpeg");
        response->add_supported_types("image/png");
        response->add_supported_types("video/mp4");
        
        return grpc::Status::OK;
    }
    
private:
    std::string model_path_;
    std::string index_path_;
    std::unique_ptr<models::ModelInference> model_;
    std::unique_ptr<core::VectorSearch> search_engine_;
    std::atomic<int64_t> next_media_id_;
    std::mutex mutex_;
};

// Public implementation
SearchServiceImpl::SearchServiceImpl(
    const std::string& model_path,
    const std::string& index_path,
    const std::string& index_type)
    : impl_(std::make_unique<Impl>(model_path, index_path, index_type)) {
}

SearchServiceImpl::~SearchServiceImpl() = default;

SearchService* SearchServiceImpl::service() {
    return impl_.get();
}

} // namespace api
} // namespace nlsearch