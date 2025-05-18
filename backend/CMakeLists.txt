cmake_minimum_required(VERSION 3.15)

project(nlsearch_backend)

# Simple standalone build without external dependencies.

add_executable(nlsearch_server
    main.cpp)

target_link_libraries(nlsearch_server PRIVATE pthread)

