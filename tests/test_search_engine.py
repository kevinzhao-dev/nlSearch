import os
import sys
import importlib
import types
import numpy as np
import pytest


def create_faiss_stub():
    class IndexFlatL2:
        def __init__(self, d):
            self.d = d
            self.vectors = []

        @property
        def ntotal(self):
            return len(self.vectors)

        def add(self, arr):
            for row in arr:
                self.vectors.append(np.array(row, dtype='float32'))

        def search(self, qv, k):
            q = qv[0]
            dists = [
                (float(np.sum((vec - q) ** 2)), idx)
                for idx, vec in enumerate(self.vectors)
            ]
            dists.sort(key=lambda x: x[0])
            top = dists[:k]
            distances = np.array([d for d, _ in top], dtype='float32').reshape(1, -1)
            indices = np.array([i for _, i in top], dtype='int64').reshape(1, -1)
            return distances, indices

    class IndexIDMap:
        def __init__(self, base):
            self.base = base
            self.id_map = []

        @property
        def d(self):
            return self.base.d

        @property
        def ntotal(self):
            return self.base.ntotal

        def add_with_ids(self, arr, ids):
            self.base.add(arr)
            self.id_map.extend([int(i) for i in ids])

        def search(self, qv, k):
            dists, inds = self.base.search(qv, k)
            mapped = np.array([self.id_map[i] for i in inds[0]], dtype='int64').reshape(1, -1)
            return dists, mapped

    def write_index(index, path):
        pass

    def read_index(path):
        raise FileNotFoundError

    return types.SimpleNamespace(
        IndexFlatL2=IndexFlatL2,
        IndexIDMap=IndexIDMap,
        write_index=write_index,
        read_index=read_index,
    )


@pytest.fixture
def search_engine(tmp_path, monkeypatch):
    stub = create_faiss_stub()
    monkeypatch.setitem(sys.modules, 'faiss', stub)
    monkeypatch.setenv('DATA_DIR', str(tmp_path))
    search_module = importlib.import_module('backend.services.search')
    importlib.reload(search_module)
    return search_module.SearchEngine()


def test_add_and_search(search_engine):
    se = search_engine
    se.add('id1', [1.0, 0.0, 0.0], 'a1', ['t1'])
    se.add('id2', [0.0, 1.0, 0.0], 'a1', ['t2'])
    se.add('id3', [0.0, 0.0, 1.0], 'a2', ['t3'])

    assert se.index.ntotal == 3

    results = se.search([1.0, 0.0, 0.0], top_k=2)
    assert len(results) == 2
    assert results[0]['media_id'] == 'id1'


def test_search_album_filter(search_engine):
    se = search_engine
    se.add('id1', [1.0, 0.0, 0.0], 'a1', ['t1'])
    se.add('id2', [0.0, 1.0, 0.0], 'a2', ['t2'])

    results = se.search([0.0, 1.0, 0.0], top_k=5, album='a2')
    assert len(results) == 1
    assert results[0]['media_id'] == 'id2'
