import os
import uuid
from io import BytesIO
import openpyxl
from docx import Document
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
import logging

logger = logging.getLogger(__name__)

def build_excel(title, rows):
    """
    Creates an Excel file from a list of rows and saves it via default_storage.
    Args:
        title (str): Title for the spreadsheet.
        rows (list of list): Example: [["Name", "Age"], ["Alice", 25], ["Bob", 30]]
    Returns:
        str: Public URL of the saved file.
    """
    try:
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = title[:31] if title else "Sheet1"

        if not rows:
            rows = [["No data provided"]]

        for row in rows:
            ws.append(row)

        file_stream = BytesIO()
        wb.save(file_stream)
        file_stream.seek(0)
        
        filename = f"artifacts/{uuid.uuid4().hex[:8]}_{title.replace(' ', '_')}.xlsx"
        path = default_storage.save(filename, ContentFile(file_stream.read()))
        
        return default_storage.url(path)
    except Exception as e:
        logger.error(f"Error building excel: {e}")
        return None

def build_word(title, content):
    """
    Creates a Word document from text content and saves it via default_storage.
    """
    try:
        doc = Document()
        doc.add_heading(title, 0)
        
        # Simple text paragraphs
        for paragraph in content.split('\n\n'):
            if paragraph.strip():
                doc.add_paragraph(paragraph.strip())
                
        file_stream = BytesIO()
        doc.save(file_stream)
        file_stream.seek(0)
        
        filename = f"artifacts/{uuid.uuid4().hex[:8]}_{title.replace(' ', '_')}.docx"
        path = default_storage.save(filename, ContentFile(file_stream.read()))
        
        return default_storage.url(path)
    except Exception as e:
        logger.error(f"Error building word document: {e}")
        return None
