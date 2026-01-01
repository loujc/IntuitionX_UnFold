from huggingface_hub import snapshot_download

snapshot_download(
    "mlx-community/whisper-large-v3-turbo",
    local_dir="/Users/jclou/models/whisper-large-v3-turbo",
    local_dir_use_symlinks=False,
)
print("done")