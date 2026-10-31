#!/usr/bin/env python3
"""Local speech-to-text for one audio/video file. Apple Silicon only.

Usage:
  ~/.venvs/whisper-bench/bin/python whisper_local.py audio.m4a --lang zh --out out.txt

This is the only transcription implementation in the skill set. yt-no-subtitle and
audio-to-txt both call it; don't write a transcribe.py by hand anywhere else.

Two engines. Measured here on a 740s Taiwanese-Mandarin conversation (M2 Air):

  qwen3    Qwen3-ASR 0.6B, 132s (5.6x realtime), 4001 chars, no repetition loops.
           Default for Chinese: same speed as whisper-turbo, ~17% more content
           recovered, and coherent punctuation.
  whisper  mlx-whisper. --model picks the size; on the same file:
             small            98s  (7.6x)  3475 chars, safe
             large-v3-turbo  187s (4.0x)  3429 chars, and it loops on real
                              conversation ("你先來你先來…") — use only when the
                              qwen3 package is unavailable. Tried as the default
                              on 2026-10-31 and reverted: slower, shorter and
                              looping on real audio. Its advantage on clean TTS
                              audio does not transfer.
             base             ~35s        whole sentences come out wrong
             medium/large-v3  slower than realtime here (memory bandwidth bound)

Chinese output is Traditional by default: Whisper and Qwen3-ASR both emit
Simplified even for Traditional audio, so zh runs post-convert with OpenCC
(s2twp, Taiwan phrasing). Pass --simplified to keep the raw output.

Omit --lang to auto-detect; naming the language raises accuracy. mp4/mov work
directly. Long files (over ~30 min) exceed the foreground timeout: run this in the
background and read the .txt when it lands. Do not run several of these at once,
they fight over GPU memory. If a qwen3 run reports truncation, split the file.

faster-whisper is the last-resort fallback when MLX itself is broken:
  from faster_whisper import WhisperModel
  model = WhisperModel("base", device="cpu", compute_type="int8")
  segs, _ = model.transcribe(audio, beam_size=5, language="zh")
CPU int8, roughly 3x realtime. Leave the VAD filter off; it makes some segments
an order of magnitude slower.
"""
import argparse
import os
import sys

QWEN_MODEL = "Qwen/Qwen3-ASR-0.6B"
WHISPER_MODEL = "small"
LANGS = {"zh": "Chinese", "en": "English", "ja": "Japanese", "ko": "Korean"}
_converter = None


def repo_for(model):
    """Upstream naming is inconsistent: whisper-base-mlx vs whisper-large-v3-turbo."""
    if "/" in model:
        return model
    if model.startswith("large"):
        return f"mlx-community/whisper-{model}"
    return f"mlx-community/whisper-{model}-mlx"


def to_traditional(text):
    """Whisper and Qwen3-ASR both emit Simplified. s2twp also fixes word choice."""
    global _converter
    if _converter is None:
        from opencc import OpenCC

        _converter = OpenCC("s2twp")
    return _converter.convert(text)


def _qwen3(audio, lang, model):
    from mlx_qwen3_asr import transcribe as qwen

    r = qwen(audio, model=model, language=LANGS.get(lang, lang))
    if r.truncated:
        print("WARNING: output truncated — split the file and rerun", file=sys.stderr)
    return r.text.strip()


def _whisper(audio, lang, model, prompt):
    import mlx_whisper

    return mlx_whisper.transcribe(
        audio, path_or_hf_repo=repo_for(model), language=lang, initial_prompt=prompt
    )["text"].strip()


def transcribe(audio, lang=None, engine="qwen3", model=None, out=None, prompt=None,
               simplified=False):
    if engine == "qwen3":
        text = _qwen3(audio, lang, model or QWEN_MODEL)
    elif engine == "whisper":
        text = _whisper(audio, lang, model or WHISPER_MODEL, prompt)
    else:
        sys.exit(f"unknown engine: {engine}")

    if lang and lang.startswith("zh") and not simplified:
        text = to_traditional(text)
    if out:
        with open(out, "w", encoding="utf-8") as f:
            f.write(text + "\n")
    return text


def main():
    ap = argparse.ArgumentParser(
        description="Transcribe one audio/video file to plain text (no timestamps)."
    )
    ap.add_argument("audio", help="path to .m4a/.mp3/.wav/.mp4/...")
    ap.add_argument("--lang", default=None, help="zh/en/ja; omit to auto-detect")
    ap.add_argument("--engine", default="qwen3", choices=["qwen3", "whisper"])
    ap.add_argument("--model", help="override the engine's default model")
    ap.add_argument("--prompt", help="whisper-only decoder prompt; small models echo it back, beware")
    ap.add_argument("--simplified", action="store_true", help="keep raw Simplified output (zh only)")
    ap.add_argument("--out", help="output .txt path; defaults to <audio>.txt beside it")
    a = ap.parse_args()

    if not os.path.exists(a.audio):
        sys.exit(f"no such file: {a.audio}")

    out = a.out or os.path.splitext(a.audio)[0] + ".txt"
    text = transcribe(a.audio, a.lang, a.engine, a.model, out, a.prompt, a.simplified)
    print(out)
    print(f"chars={len(text)} engine={a.engine} lang={a.lang or 'auto'}")


if __name__ == "__main__":
    main()
