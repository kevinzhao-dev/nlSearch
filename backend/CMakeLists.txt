cmake_minimum_required(VERSION 3.15)
project(nlSearch VERSION 0.1.0 LANGUAGES CXX)

# Set C++ standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Set build type to Release by default
if(NOT CMAKE_BUILD_TYPE)
    set(CMAKE_BUILD_TYPE Release)
endif()

# Enable warnings
if(MSVC)
    add_compile_options(/W4)
else()
    add_compile_options(-Wall -Wextra -Wpedantic)
endif()

# Include directories
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/include)

# Option to build tests
option(BUILD_TESTS "Build tests" OFF)

# Add FetchContent for dependency management
include(FetchContent)

# Add third-party dependencies
# gRPC
find_package(gRPC CONFIG QUIET)
if(NOT gRPC_FOUND)
    message(STATUS "gRPC not found, fetching...")
    
    # First fetch and build protobuf
    FetchContent_Declare(
        protobuf
        GIT_REPOSITORY https://github.com/protocolbuffers/protobuf.git
        GIT_TAG v3.21.12
    )
    FetchContent_MakeAvailable(protobuf)
    
    # Then fetch gRPC
    FetchContent_Declare(
        grpc
        GIT_REPOSITORY https://github.com/grpc/grpc.git
        GIT_TAG v1.54.0
    )
    FetchContent_MakeAvailable(grpc)
endif()

# FAISS
find_package(FAISS CONFIG QUIET)
if(NOT FAISS_FOUND)
    message(STATUS "FAISS not found, fetching...")
    
    # Fetch FAISS
    FetchContent_Declare(
        faiss
        GIT_REPOSITORY https://github.com/facebookresearch/faiss.git
        GIT_TAG v1.7.4
    )
    
    # Configure FAISS options
    set(FAISS_ENABLE_GPU OFF CACHE BOOL "Build with GPU support" FORCE)
    set(FAISS_ENABLE_PYTHON OFF CACHE BOOL "Build Python bindings" FORCE)
    set(BUILD_TESTING OFF CACHE BOOL "Build tests" FORCE)
    
    FetchContent_MakeAvailable(faiss)
endif()

# ONNX Runtime
find_package(ONNXRuntime CONFIG QUIET)
if(NOT ONNXRuntime_FOUND)
    message(STATUS "ONNX Runtime not found, fetching...")
    
    # Set ONNX Runtime version
    set(ONNX_RUNTIME_VERSION "1.15.1")
    
    # Download precompiled ONNX Runtime based on platform
    if(WIN32)
        set(ONNX_RUNTIME_URL "https://github.com/microsoft/onnxruntime/releases/download/v${ONNX_RUNTIME_VERSION}/onnxruntime-win-x64-${ONNX_RUNTIME_VERSION}.zip")
        set(ONNX_RUNTIME_ARCHIVE "onnxruntime-win-x64-${ONNX_RUNTIME_VERSION}.zip")
    elseif(APPLE)
        if(CMAKE_SYSTEM_PROCESSOR MATCHES "arm64")
            set(ONNX_RUNTIME_URL "https://github.com/microsoft/onnxruntime/releases/download/v${ONNX_RUNTIME_VERSION}/onnxruntime-osx-arm64-${ONNX_RUNTIME_VERSION}.tgz")
            set(ONNX_RUNTIME_ARCHIVE "onnxruntime-osx-arm64-${ONNX_RUNTIME_VERSION}.tgz")
        else()
            set(ONNX_RUNTIME_URL "https://github.com/microsoft/onnxruntime/releases/download/v${ONNX_RUNTIME_VERSION}/onnxruntime-osx-x64-${ONNX_RUNTIME_VERSION}.tgz")
            set(ONNX_RUNTIME_ARCHIVE "onnxruntime-osx-x64-${ONNX_RUNTIME_VERSION}.tgz")
        endif()
    else() # Linux
        set(ONNX_RUNTIME_URL "https://github.com/microsoft/onnxruntime/releases/download/v${ONNX_RUNTIME_VERSION}/onnxruntime-linux-x64-${ONNX_RUNTIME_VERSION}.tgz")
        set(ONNX_RUNTIME_ARCHIVE "onnxruntime-linux-x64-${ONNX_RUNTIME_VERSION}.tgz")
    endif()
    
    # Create lib directory if it doesn't exist
    file(MAKE_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/lib)
    
    # Download ONNX Runtime
    if(NOT EXISTS ${CMAKE_CURRENT_SOURCE_DIR}/lib/${ONNX_RUNTIME_ARCHIVE})
        message(STATUS "Downloading ONNX Runtime from ${ONNX_RUNTIME_URL}")
        file(DOWNLOAD ${ONNX_RUNTIME_URL} ${CMAKE_CURRENT_SOURCE_DIR}/lib/${ONNX_RUNTIME_ARCHIVE})
        
        # Extract archive
        execute_process(
            COMMAND ${CMAKE_COMMAND} -E tar xzf ${CMAKE_CURRENT_SOURCE_DIR}/lib/${ONNX_RUNTIME_ARCHIVE}
            WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/lib
        )
    endif()
    
    # Set include and library paths
    set(ONNX_RUNTIME_INCLUDE_DIR "${CMAKE_CURRENT_SOURCE_DIR}/lib/onnxruntime-${ONNX_RUNTIME_VERSION}/include")
    
    if(WIN32)
        set(ONNX_RUNTIME_LIB "${CMAKE_CURRENT_SOURCE_DIR}/lib/onnxruntime-${ONNX_RUNTIME_VERSION}/lib/onnxruntime.lib")
    else()
        set(ONNX_RUNTIME_LIB "${CMAKE_CURRENT_SOURCE_DIR}/lib/onnxruntime-${ONNX_RUNTIME_VERSION}/lib/libonnxruntime.so")
        if(APPLE)
            set(ONNX_RUNTIME_LIB "${CMAKE_CURRENT_SOURCE_DIR}/lib/onnxruntime-${ONNX_RUNTIME_VERSION}/lib/libonnxruntime.dylib")
        endif()
    endif()
    
    # Create imported target
    add_library(ONNXRuntime SHARED IMPORTED)
    set_target_properties(ONNXRuntime PROPERTIES
        IMPORTED_LOCATION ${ONNX_RUNTIME_LIB}
        INTERFACE_INCLUDE_DIRECTORIES ${ONNX_RUNTIME_INCLUDE_DIR}
    )
endif()

# spdlog for logging
find_package(spdlog CONFIG QUIET)
if(NOT spdlog_FOUND)
    message(STATUS "spdlog not found, fetching...")
    FetchContent_Declare(
        spdlog
        GIT_REPOSITORY https://github.com/gabime/spdlog.git
        GIT_TAG v1.11.0
    )
    FetchContent_MakeAvailable(spdlog)
endif()

# fmt for string formatting
find_package(fmt CONFIG QUIET)
if(NOT fmt_FOUND)
    message(STATUS "fmt not found, fetching...")
    FetchContent_Declare(
        fmt
        GIT_REPOSITORY https://github.com/fmtlib/fmt.git
        GIT_TAG 9.1.0
    )
    FetchContent_MakeAvailable(fmt)
endif()

# nlohmann_json for JSON handling
find_package(nlohmann_json CONFIG QUIET)
if(NOT nlohmann_json_FOUND)
    message(STATUS "nlohmann_json not found, fetching...")
    FetchContent_Declare(
        nlohmann_json
        GIT_REPOSITORY https://github.com/nlohmann/json.git
        GIT_TAG v3.11.2
    )
    FetchContent_MakeAvailable(nlohmann_json)
endif()

# Generate gRPC code from proto files
file(GLOB_RECURSE PROTO_FILES "${CMAKE_CURRENT_SOURCE_DIR}/protos/*.proto")
if(PROTO_FILES)
    # Create output directories
    file(MAKE_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/include/generated)
    file(MAKE_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/src/generated)
    
    # Generate gRPC code
    foreach(PROTO_FILE ${PROTO_FILES})
        get_filename_component(PROTO_NAME ${PROTO_FILE} NAME_WE)
        execute_process(
            COMMAND protoc
                --grpc_out=${CMAKE_CURRENT_SOURCE_DIR}/src/generated
                --cpp_out=${CMAKE_CURRENT_SOURCE_DIR}/src/generated
                --proto_path=${CMAKE_CURRENT_SOURCE_DIR}/protos
                ${PROTO_FILE}
            RESULT_VARIABLE PROTOC_RESULT
        )
        if(NOT PROTOC_RESULT EQUAL 0)
            message(WARNING "Failed to generate gRPC code for ${PROTO_FILE}")
        endif()
    endforeach()
endif()

# Add subdirectories
add_subdirectory(src)

# Build tests if enabled
if(BUILD_TESTS)
    enable_testing()
    add_subdirectory(tests)
endif()