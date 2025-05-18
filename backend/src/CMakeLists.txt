# Collect source files
file(GLOB_RECURSE CORE_SOURCES "${CMAKE_CURRENT_SOURCE_DIR}/core/*.cpp")
file(GLOB_RECURSE MODELS_SOURCES "${CMAKE_CURRENT_SOURCE_DIR}/models/*.cpp")
file(GLOB_RECURSE API_SOURCES "${CMAKE_CURRENT_SOURCE_DIR}/api/*.cpp")
file(GLOB_RECURSE UTILS_SOURCES "${CMAKE_CURRENT_SOURCE_DIR}/utils/*.cpp")
file(GLOB_RECURSE GENERATED_SOURCES "${CMAKE_CURRENT_SOURCE_DIR}/generated/*.cc")

# Main library
add_library(nlsearch_lib STATIC
    ${CORE_SOURCES}
    ${MODELS_SOURCES}
    ${API_SOURCES}
    ${UTILS_SOURCES}
    ${GENERATED_SOURCES}
)

# Set include directories
target_include_directories(nlsearch_lib PUBLIC
    ${CMAKE_SOURCE_DIR}/include
    ${CMAKE_CURRENT_SOURCE_DIR}
)

# Link dependencies
target_link_libraries(nlsearch_lib PUBLIC
    faiss
    ONNXRuntime
    gRPC::grpc++
    protobuf::libprotobuf
    spdlog::spdlog
    fmt::fmt
    nlohmann_json::nlohmann_json
)

# Server executable
add_executable(nlsearch_server main.cpp)
target_link_libraries(nlsearch_server PRIVATE nlsearch_lib)

# Install targets
install(TARGETS nlsearch_server DESTINATION bin)
install(TARGETS nlsearch_lib DESTINATION lib)