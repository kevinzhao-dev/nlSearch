#pragma once

#include <string>
#include <vector>
#include <cstdint>

namespace nlsearch {
namespace utils {

/**
 * @brief Load and preprocess an image for neural network input
 * @param image_path Path to the image file
 * @param height Desired height
 * @param width Desired width
 * @return Preprocessed image tensor as flattened vector (NCHW format)
 */
std::vector<float> loadAndPreprocessImage(const std::string& image_path, int height, int width);

/**
 * @brief Load and preprocess a video frame for neural network input
 * @param video_path Path to the video file
 * @param frame_idx Index of the frame to extract (0 for first frame)
 * @param height Desired height
 * @param width Desired width
 * @return Preprocessed frame tensor as flattened vector (NCHW format)
 */
std::vector<float> loadAndPreprocessVideoFrame(const std::string& video_path, int frame_idx, int height, int width);

/**
 * @brief Extract multiple frames from a video
 * @param video_path Path to the video file
 * @param num_frames Number of frames to extract
 * @param height Desired height
 * @param width Desired width
 * @return Vector of preprocessed frame tensors
 */
std::vector<std::vector<float>> extractVideoFrames(const std::string& video_path, int num_frames, int height, int width);

/**
 * @brief Tokenize text for CLIP model input
 * @param text Text to tokenize
 * @param max_length Maximum token sequence length
 * @return Vector of token IDs
 */
std::vector<int64_t> tokenizeText(const std::string& text, size_t max_length);

} // namespace utils
} // namespace nlsearch