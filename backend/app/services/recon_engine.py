import os
import subprocess
import json
from typing import Dict, Any

def run_nmap(target: str, xml_output_path: str = "/tmp/scan.xml") -> Dict[str, Any]:
    """
    Run nmap -sV -oX and return a parsed JSON result.
    SAFE BEHAVIOR: unless ENABLE_NMAP env var is 'true', this returns a mocked result.
    Use this only in an isolated lab and with ROE.
    """
    enable = os.getenv("ENABLE_NMAP", "false").lower() == "true"
    if not enable:
        # Return a mocked result for safe dev/testing
        return {
            "target": target,
            "ports": [
                {"port": 22, "proto": "tcp", "service": "ssh", "product": "OpenSSH", "version": "7.2p2"},
                {"port": 80, "proto": "tcp", "service": "http", "product": "nginx", "version": "1.18"}
            ],
            "note": "mocked result (ENABLE_NMAP not true)"
        }

    # Real run (only runs when ENABLE_NMAP=true)
    cmd = ["nmap", "-sV", "-oX", xml_output_path, target]
    proc = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
    if proc.returncode != 0:
        raise RuntimeError(f"nmap failed: {proc.stderr[:200]}")

    # Very small parser: we won't do full XML parsing here to keep it simple.
    # For production, use xml.etree.ElementTree or python-nmap to parse.
    # For now return raw xml as base64-like string and a note.
    with open(xml_output_path, "rb") as f:
        raw = f.read()
    return {"target": target, "raw_xml_length": len(raw), "note": "raw XML stored in file"}
