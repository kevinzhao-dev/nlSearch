#include "core/vector_search.h"

#include <unordered_map>
#include <fstream>
#include <filesystem>
#include <mutex>

#include <spdlog/spdlog.h>
#include <nlohmann/json.hpp>
#include <faiss/IndexFlat.h>
#include <faiss/IndexHNSW.h>
#include <faiss/index_io.h>

namespace nlsearch {
namespace core {

namespace {
    // File extension for metadata
    constexpr const char* kMetadataExt = ".meta.json";
}

/**
 * @brief FAISS implementation of VectorSearch
 */
class FaissVectorSearch : public VectorSearch {
public:
    FaissVectorSearch(size_t dimension, const std::string& index_type)
        : dimension_(dimension) {
        
        // Create the appropriate index type
        if (index_type == "Flat") {
            index_ = std::make_unique<faiss::IndexFlatL2>(dimension);
            spdlog::info("Created FAISS Flat index with dimension {}", dimension);
        } else if (index_type == "HNSW") {
            // HNSW parameters: M=16 (graph connectivity), efConstruction=200 (build-time exploration)
            faiss::IndexHNSWFlat* hnsw_index = new faiss::IndexHNSWFlat(dimension, 16);
            hnsw_index->hnsw.efConstruction = 200;
            hnsw_index->hnsw.efSearch = 128;
            index_.reset(hnsw_index);
            spdlog::info("Created FAISS HNSW index with dimension {}", dimension);
        } else {
            // Default to Flat index
            index_ = std::make_unique<faiss::IndexFlatL2>(dimension);
            spdlog::warn("Unknown index type '{}', defaulting to Flat index", index_type);
        }
    }
    
    bool addVector(int64_t id, const std::vector<float>& vector, 
                  const std::string& path, 
                  const std::optional<std::string>& metadata = std::nullopt) override {
        if (vector.size() != dimension_) {
            spdlog::error("Vector dimension mismatch: expected {}, got {}", 
                          dimension_, vector.size());
            return false;
        }
        
        std::lock_guard<std::mutex> lock(mutex_);
        
        // Add to FAISS index
        index_->add_with_ids(1, vector.data(), &id);
        
        // Store metadata
        paths_[id] = path;
        if (metadata) {
            metadata_[id] = *metadata;
        }
        
        return true;
    }
    
    std::vector<SearchResult> search(const std::vector<float>& query, size_t k) const override {
        if (query.size() != dimension_) {
            spdlog::error("Query dimension mismatch: expected {}, got {}", 
                          dimension_, query.size());
            return {};
        }
        
        if (index_->ntotal == 0) {
            spdlog::warn("Search on empty index");
            return {};
        }
        
        // Cap k to the number of vectors in the index
        k = std::min(k, static_cast<size_t>(index_->ntotal));
        
        // Perform search
        std::vector<int64_t> ids(k);
        std::vector<float> distances(k);
        
        {
            std::lock_guard<std::mutex> lock(mutex_);
            index_->search(1, query.data(), k, distances.data(), ids.data());
        }
        
        // Convert to search results
        std::vector<SearchResult> results;
        results.reserve(k);
        
        for (size_t i = 0; i < k; i++) {
            const int64_t id = ids[i];
            
            // Check if this is a valid ID (FAISS might return -1 for padding)
            if (id < 0) {
                continue;
            }
            
            SearchResult result;
            result.id = id;
            result.score = distances[i];
            
            // Look up path and metadata
            auto path_it = paths_.find(id);
            if (path_it != paths_.end()) {
                result.path = path_it->second;
            }
            
            auto meta_it = metadata_.find(id);
            if (meta_it != metadata_.end()) {
                result.metadata = meta_it->second;
            }
            
            results.push_back(std::move(result));
        }
        
        return results;
    }
    
    bool save(const std::string& path) const override {
        try {
            std::filesystem::create_directories(std::filesystem::path(path).parent_path());
            
            // Save FAISS index
            const std::string index_path = path + ".index";
            {
                std::lock_guard<std::mutex> lock(mutex_);
                faiss::write_index(index_.get(), index_path.c_str());
            }
            
            // Save paths and metadata
            nlohmann::json json_data;
            json_data["paths"] = paths_;
            json_data["metadata"] = metadata_;
            
            std::ofstream meta_file(path + kMetadataExt);
            meta_file << json_data.dump();
            
            spdlog::info("Index saved to {} with {} vectors", path, index_->ntotal);
            return true;
        } catch (const std::exception& e) {
            spdlog::error("Failed to save index: {}", e.what());
            return false;
        }
    }
    
    bool load(const std::string& path) override {
        try {
            // Load FAISS index
            const std::string index_path = path + ".index";
            {
                std::lock_guard<std::mutex> lock(mutex_);
                auto loaded_index = faiss::read_index(index_path.c_str());
                
                // Check dimension
                if (loaded_index->d != dimension_) {
                    spdlog::error("Index dimension mismatch: expected {}, got {}", 
                                  dimension_, loaded_index->d);
                    delete loaded_index;
                    return false;
                }
                
                index_.reset(loaded_index);
            }
            
            // Load paths and metadata
            std::ifstream meta_file(path + kMetadataExt);
            if (meta_file) {
                nlohmann::json json_data;
                meta_file >> json_data;
                
                paths_ = json_data["paths"].get<std::unordered_map<int64_t, std::string>>();
                metadata_ = json_data["metadata"].get<std::unordered_map<int64_t, std::string>>();
            }
            
            spdlog::info("Index loaded from {} with {} vectors", path, index_->ntotal);
            return true;
        } catch (const std::exception& e) {
            spdlog::error("Failed to load index: {}", e.what());
            return false;
        }
    }
    
    size_t size() const override {
        std::lock_guard<std::mutex> lock(mutex_);
        return index_->ntotal;
    }
    
private:
    size_t dimension_;
    std::unique_ptr<faiss::Index> index_;
    std::unordered_map<int64_t, std::string> paths_;
    std::unordered_map<int64_t, std::string> metadata_;
    mutable std::mutex mutex_;
};

std::unique_ptr<VectorSearch> createFaissVectorSearch(size_t dimension, const std::string& index_type) {
    return std::make_unique<FaissVectorSearch>(dimension, index_type);
}

} // namespace core
} // namespace nlsearch