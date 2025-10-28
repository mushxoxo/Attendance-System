import os
import shutil
from typing import List, Dict, Any
from pathlib import Path
from fastapi import UploadFile
import aiofiles


async def save_uploaded_file(file: UploadFile, destination_folder: str) -> str:
    """
    Save an uploaded file to the specified destination folder
    
    Args:
        file: The uploaded file
        destination_folder: Directory to save the file
        
    Returns:
        Path to the saved file
    """
    # Create destination folder if it doesn't exist
    os.makedirs(destination_folder, exist_ok=True)
    
    # Create file path
    file_path = os.path.join(destination_folder, file.filename)
    
    # Save the file
    async with aiofiles.open(file_path, 'wb') as out_file:
        content = await file.read()
        await out_file.write(content)
    
    return file_path


def clean_temp_directory(temp_dir: str) -> None:
    """
    Clean temporary directory by removing all files
    
    Args:
        temp_dir: Path to temporary directory
    """
    if os.path.exists(temp_dir):
        for filename in os.listdir(temp_dir):
            file_path = os.path.join(temp_dir, filename)
            try:
                if os.path.isfile(file_path) or os.path.islink(file_path):
                    os.unlink(file_path)
                elif os.path.isdir(file_path):
                    shutil.rmtree(file_path)
            except Exception as e:
                print(f'Failed to delete {file_path}. Reason: {e}')


def get_csv_files(directory: str) -> List[Dict[str, Any]]:
    """
    Get list of CSV files in directory with metadata
    
    Args:
        directory: Directory to search for CSV files
        
    Returns:
        List of dictionaries containing file information
    """
    csv_files = []
    
    if not os.path.exists(directory):
        return csv_files
    
    for filename in os.listdir(directory):
        if filename.endswith('.csv'):
            file_path = os.path.join(directory, filename)
            file_stats = os.stat(file_path)
            
            csv_files.append({
                'filename': filename,
                'size': file_stats.st_size,
                'created': file_stats.st_ctime,
                'modified': file_stats.st_mtime
            })
    
    # Sort by modified time (newest first)
    csv_files.sort(key=lambda x: x['modified'], reverse=True)
    
    return csv_files
