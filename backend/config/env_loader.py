import os
from pathlib import Path
from io import StringIO

def load_with_heuristics(path):
    if not path.exists():
        return
    
    try:
        from dotenv import dotenv_values
    except ImportError:
        return

    try:
        content = path.read_bytes()
        decoded = None
        encoding_used = "unknown"
        
        # Heuristic for UTF-16
        if content.startswith(b'\xff\xfe') or content.startswith(b'\xfe\xff'):
            decoded = content.decode('utf-16')
            encoding_used = "utf-16"
        elif b'\x00' in content:
            try:
                decoded = content.decode('utf-16')
                encoding_used = "utf-16-le-heuristic"
            except UnicodeError:
                pass
        
        if decoded is None:
            decoded = content.decode('utf-8', errors='replace')
            encoding_used = "utf-8"
            
        # Parse without setting
        env_dict = dotenv_values(stream=StringIO(decoded))
        
        loaded_count = 0
        for k, v in env_dict.items():
            if k: # Key must be present
                try:
                    # check if key has nulls (just in case)
                    if '\0' in k:
                        continue
                    # Value can be None in dotenv_values if 'KEY' without '='? No usually 'KEY=' is empty string.
                    val = v if v is not None else ""
                    os.environ[k] = val
                    loaded_count += 1
                except Exception:
                    # Ignore bad keys
                    pass
                    
        print(f"Loaded {loaded_count} variables from {path.name} (encoding: {encoding_used})")

    except Exception as e:
        print(f"Warning: Failed to load env file {path}: {e}")

def init_env():
    # Path to backend/.env
    backend_env = Path(__file__).resolve().parent.parent / '.env'
    # Path to project_root/.env.local
    project_env = Path(__file__).resolve().parent.parent.parent / '.env.local'
    
    load_with_heuristics(backend_env)
    load_with_heuristics(project_env)
