"""Build an unsigned Firefox package using only the Python standard library."""
import hashlib
import json
from datetime import datetime
from pathlib import Path
from shutil import copy2
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parents[1]
source = root / "extension"
manifest = json.loads((source / "manifest.json").read_text(encoding="utf-8"))
version = manifest["version"]
if not all(part.isdecimal() for part in version.split(".")):
    raise ValueError("Invalid package version")
destination = root / "dist"
destination.mkdir(exist_ok=True)
archive = destination / f"yahoo-classique-{version}.zip"
stamp = datetime.now().strftime("%Y%m%d-%H%M%S-%f")
if archive.exists():
    copy2(archive, archive.with_name(archive.name + ".backup-" + stamp))
allowed = {".json", ".js", ".css", ".html", ".svg"}
with ZipFile(archive, "w", compression=ZIP_DEFLATED, compresslevel=9) as package:
    for path in sorted(source.rglob("*")):
        if path.is_file() and path.suffix in allowed:
            package.write(path, path.relative_to(source).as_posix())
with ZipFile(archive) as package:
    assert package.testzip() is None
    assert json.loads(package.read("manifest.json"))["version"] == version
print(f"Unsigned package: {archive}")
print(f"SHA256: {hashlib.sha256(archive.read_bytes()).hexdigest()}")
