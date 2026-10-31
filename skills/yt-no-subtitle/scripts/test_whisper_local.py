"""Unit tests for the pure helpers in whisper_local. No model download needed.

Run: python3 scripts/test_whisper_local.py
"""
from whisper_local import repo_for


def test_repo_for():
    assert repo_for("small") == "mlx-community/whisper-small-mlx"
    assert repo_for("base") == "mlx-community/whisper-base-mlx"
    # large-* repos have no -mlx suffix upstream; getting this wrong 401s
    assert repo_for("large-v3") == "mlx-community/whisper-large-v3"
    assert repo_for("large-v3-turbo") == "mlx-community/whisper-large-v3-turbo"
    # a full repo id passes through untouched
    assert repo_for("someone/custom-model") == "someone/custom-model"


if __name__ == "__main__":
    test_repo_for()
    print("ok")
