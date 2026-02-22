#!/usr/bin/env python3
"""Export trained model from Modal volume."""

import modal
import json
import base64

app = modal.App("cipher-ml-export")
model_volume = modal.Volume.from_name("cipher-ml-models")


@app.function(volumes={"/models": model_volume})
def export_models():
    """Read model files and return their contents."""
    import os

    results = {}

    for version in os.listdir("/models"):
        version_path = f"/models/{version}"
        if os.path.isdir(version_path):
            results[version] = {}

            for filename in os.listdir(version_path):
                file_path = f"{version_path}/{filename}"
                with open(file_path, "rb") as f:
                    content = f.read()

                # For JSON files, return as dict
                if filename.endswith(".json"):
                    results[version][filename] = json.loads(content.decode("utf-8"))
                else:
                    # For binary files, base64 encode
                    results[version][filename] = base64.b64encode(content).decode("utf-8")

    return results


@app.local_entrypoint()
def main():
    import os

    print("📥 Exporting Cipher ML models from Modal...")

    # Get models from Modal
    models = export_models.remote()

    # Save locally
    local_dir = "models/cipher-ml"
    os.makedirs(local_dir, exist_ok=True)

    for version, files in models.items():
        print(f"\n📦 {version}:")
        version_dir = f"{local_dir}/{version}"
        os.makedirs(version_dir, exist_ok=True)

        for filename, content in files.items():
            file_path = f"{version_dir}/{filename}"

            if filename.endswith(".json"):
                with open(file_path, "w") as f:
                    json.dump(content, f, indent=2)
                size_kb = len(json.dumps(content)) / 1024
            else:
                import base64
                binary = base64.b64decode(content)
                with open(file_path, "wb") as f:
                    f.write(binary)
                size_kb = len(binary) / 1024

            print(f"   ✓ {filename} ({size_kb:.1f} KB)")

    print(f"\n✅ Models saved to {local_dir}/")

    # Show what we have
    print("\n📁 Local model files:")
    for version in models.keys():
        print(f"   models/cipher-ml/{version}/model.json")
        print(f"   models/cipher-ml/{version}/metadata.json")
