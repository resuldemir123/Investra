
import firebase_admin
from firebase_admin import credentials, firestore
from django.conf import settings
import os

_db = None

def get_firestore_client():
    global _db
    if _db:
        return _db

    # Check if already initialized
    if not firebase_admin._apps:
        # Path to service account key
        cred_path = os.path.join(settings.BASE_DIR, 'serviceAccountKey.json')
        
        if os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
        else:
            # Fallback or warning - user needs to provide this file
            print("WARNING: 'serviceAccountKey.json' not found in backend directory. Firestore Sync will fail.")
            # We might initialize without creds if running on GCP, but likely local requires key
            # returning None might break views, so we handle there
            return None

    _db = firestore.client()
    return _db
