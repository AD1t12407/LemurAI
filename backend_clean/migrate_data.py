#!/usr/bin/env python3
"""
Data migration script
Migrates existing data from Backend_Lemur_Waitlist to clean structure
"""

import os
import shutil
import sys
from pathlib import Path

def migrate_data():
    """Migrate existing data to clean structure"""
    print("🔄 Migrating data from Backend_Lemur_Waitlist...")
    
    # Source and destination paths
    source_dir = Path("../Backend_Lemur_Waitlist")
    dest_dir = Path("./data")
    
    if not source_dir.exists():
        print("❌ Backend_Lemur_Waitlist directory not found")
        return False
    
    # Create destination directories
    dest_dir.mkdir(exist_ok=True)
    (dest_dir / "uploads").mkdir(exist_ok=True)
    (dest_dir / "chroma_db").mkdir(exist_ok=True)
    (dest_dir / "test_data").mkdir(exist_ok=True)
    
    # Migrate uploads
    source_uploads = source_dir / "uploads"
    if source_uploads.exists():
        print("📁 Migrating uploads...")
        shutil.copytree(source_uploads, dest_dir / "uploads", dirs_exist_ok=True)
        print(f"✅ Migrated uploads directory")
    
    # Migrate ChromaDB
    source_chroma = source_dir / "chroma_db"
    if source_chroma.exists():
        print("🧠 Migrating ChromaDB...")
        shutil.copytree(source_chroma, dest_dir / "chroma_db", dirs_exist_ok=True)
        print(f"✅ Migrated ChromaDB")
    
    # Migrate test data
    test_files = [
        "quarterly_report.txt",
        "test_clients",
        "test_data"
    ]
    
    for test_file in test_files:
        source_path = source_dir / test_file
        if source_path.exists():
            dest_path = dest_dir / "test_data" / test_file
            if source_path.is_dir():
                shutil.copytree(source_path, dest_path, dirs_exist_ok=True)
            else:
                shutil.copy2(source_path, dest_path)
            print(f"✅ Migrated {test_file}")
    
    print("🎉 Data migration completed successfully!")
    return True

if __name__ == "__main__":
    migrate_data()
