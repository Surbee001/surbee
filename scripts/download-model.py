#!/usr/bin/env python3
"""Download trained model from Modal to local storage."""

import modal
import json
import os

def main():
    print("📥 Downloading Cipher ML models from Modal...")

    # Create local directory
    local_dir = "models/cipher-ml"
    os.makedirs(local_dir, exist_ok=True)

    # Get the volume
    vol = modal.Volume.from_name("cipher-ml-models")

    # Download each version
    for entry in vol.listdir("/"):
        version = entry.path
        print(f"\n📦 Downloading {version}...")

        version_dir = f"{local_dir}/{version}"
        os.makedirs(version_dir, exist_ok=True)

        # Download model.json
        try:
            for file_entry in vol.listdir(f"/{version}"):
                file_path = f"/{version}/{file_entry.path}"
                local_path = f"{version_dir}/{file_entry.path}"

                # Read file from volume
                with vol.read_file(file_path) as f:
                    content = f.read()

                # Write to local
                with open(local_path, "wb") as f:
                    f.write(content)

                size_kb = len(content) / 1024
                print(f"   ✓ {file_entry.path} ({size_kb:.1f} KB)")
        except Exception as e:
            print(f"   ✗ Error: {e}")

    print(f"\n✅ Models downloaded to {local_dir}/")
    print("\nTo use locally, set CIPHER_ML_LOCAL_MODEL=true")

if __name__ == "__main__":
    main()
