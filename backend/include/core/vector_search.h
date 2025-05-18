#pragma once

#include <string>
#include <vector>
#include <memory>
#include <optional>

namespace nlsearch {
namespace core {

/**
 * @brief Result item from vector search
 */
struct SearchResult {
    int64_t id;                  // Unique identifier
    float score;                 // Similarity score
    std::string path;            // Path to the image/video file
    std::optional<std::string> metadata; // Optional JSON metadata
};

/**
 * @brief Vector search engine interface
 */
class VectorSearch {
public:
    virtual ~VectorSearch() = default;
    
    /**
     * @brief Add a vector to the index
     * @param id Unique identifier for the vector
     * @param vector The embedding vector
     * @param path Path to the original image/video file
     * @param metadata Optional JSON metadata
     * @return true if successful, false otherwise
     */
    virtual bool addVector(int64_t id, const std::vector<float>& vector, 
                          const std::string& path, 
                          const std::optional<std::string>& metadata = std::nullopt) = 0;
    
    /**
     * @brief Search for similar vectors
     * @param query The query vector
     * @param k Number of results to return
     * @return Vector of search results ordered by similarity
     */
    virtual std::vector<SearchResult> search(const std::vector<float>& query, size_t k) const = 0;
    
    /**
     * @brief Save the index to disk
     * @param path Path to save the index
     * @return true if successful, false otherwise
     */
    virtual bool save(const std::string& path) const = 0;
    
    /**
     * @brief Load the index from disk
     * @param path Path to load the index from
     * @return true if successful, false otherwise
     */
    virtual bool load(const std::string& path) = 0;
    
    /**
     * @brief Get the number of vectors in the index
     * @return Number of vectors
     */
    virtual size_t size() const = 0;
};

/**
 * @brief Create a new FAISS vector search engine
 * @param dimension Dimension of the vectors
 * @param index_type Type of FAISS index (e.g., "Flat", "HNSW")
 * @return Unique pointer to the vector search engine
 */
std::unique_ptr<VectorSearch> createFaissVectorSearch(size_t dimension, const std::string& index_type = "Flat");

} // namespace core
} // namespace nlsearch