import os

import streamlit as st
import requests

st.set_page_config(page_title="VLM Search Engine", layout="wide")

# Load custom CSS for styling
style_path = os.path.join(os.path.dirname(__file__), "style.css")
if os.path.exists(style_path):
    with open(style_path) as f:
        st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)

# Sidebar config
backend_url = st.sidebar.text_input("Backend URL", "http://localhost:8000")

st.title("🔍 VLM Search Engine")

# Use tabs to separate upload and search sections
upload_tab, search_tab = st.tabs(["📥 Index Media", "🔎 Search Media"])

with upload_tab:
    uploaded_file = st.file_uploader(
        "Upload Image or Video",
        type=["jpg", "png", "mp4", "avi"],
        key="upload_file",
    )
    media_id = st.text_input("Media ID", key="upload_media_id")
    album = st.text_input("Album", key="upload_album")
    tags_str = st.text_input("Tags (comma separated)", key="upload_tags")
    if st.button("Index", key="index_button"):
        if not uploaded_file or not media_id or not album:
            st.error("Please provide a file, media ID, and album.")
        else:
            tags = [t.strip() for t in tags_str.split(",") if t.strip()]
            try:
                files = {"file": (uploaded_file.name, uploaded_file.getvalue())}
                data = {
                    "media_id": media_id,
                    "album": album,
                    "tags": ",".join(tags),
                }
                resp = requests.post(
                    f"{backend_url}/upload", files=files, data=data
                )
                if resp.ok:
                    st.success("Indexed successfully.")
                else:
                    st.error(f"Error: {resp.text}")
            except Exception as e:
                st.error(str(e))

with search_tab:
    query = st.text_input("Search query", key="search_query")
    album_filter = st.text_input("Album filter (optional)", key="search_album")
    top_k = st.number_input(
        "Top K results", min_value=1, max_value=50, value=5, key="search_topk"
    )
    if st.button("Search", key="search_button"):
        if not query:
            st.error("Please enter a search query.")
        else:
            payload = {
                "query": query,
                "album": album_filter or None,
                "top_k": top_k,
            }
            try:
                resp = requests.post(f"{backend_url}/search", json=payload)
                if resp.ok:
                    results = resp.json().get("results", [])
                    if not results:
                        st.info("No results found.")
                    for res in results:
                        with st.container():
                            st.markdown(
                                "<div class='result-block'>",
                                unsafe_allow_html=True,
                            )
                            st.subheader(f"Media ID: {res['media_id']}")
                            st.write(
                                f"Album: {res['album']} | Tags: {', '.join(res['tags'])} | Score: {res['score']:.4f}"
                            )
                            path = res.get("path")
                            if path and os.path.exists(path):
                                if path.lower().endswith((".jpg", ".png")):
                                    st.image(path, use_column_width=True)
                                else:
                                    st.video(path)
                            else:
                                st.write(f"Media file not found at: {path}")
                            st.markdown("</div>", unsafe_allow_html=True)
                else:
                    st.error(f"Search error: {resp.text}")
            except Exception as e:
                st.error(str(e))
