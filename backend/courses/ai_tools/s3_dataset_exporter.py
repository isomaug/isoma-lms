import json
import logging
import io
from datetime import datetime
from django.conf import settings
import boto3

logger = logging.getLogger(__name__)

def export_chat_logs_to_s3(chat_logs_queryset, s3_prefix="ai-training"):
    """
    Exports a queryset of ChatLogs into a Google Vertex AI / OpenAI compatible 
    JSONL fine-tuning dataset and uploads it to AWS S3.
    """
    if not chat_logs_queryset.exists():
        return {"success": False, "error": "No chat logs available to export."}

    lines = []
    default_system_prompt = (
        "You are EkebuAI, the digital teaching assistant and highly intelligent AI clone of Peter Gordon Ekebu. "
        "Your tone is professional with warm humor. You explain complex technical concepts simply using relatable real-world analogies."
    )

    count = 0
    for log in chat_logs_queryset:
        if not log.query or not log.response:
            continue

        # Format system prompt with course context if present
        course_title = log.course.title if log.course else "General"
        lesson_title = log.lesson.title if log.lesson else ""
        
        system_text = default_system_prompt + f" Current Course: '{course_title}'."
        if lesson_title:
            system_text += f" Current Lesson: '{lesson_title}'."

        record = {
            "messages": [
                {"role": "system", "content": system_text},
                {"role": "user", "content": log.query},
                {"role": "assistant", "content": log.response}
            ]
        }
        lines.append(json.dumps(record))
        count += 1

    if not lines:
        return {"success": False, "error": "No valid conversation records compiled."}

    jsonl_content = "\n".join(lines)

    # Prepare S3 upload
    timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_name = f"ekebuai_dataset_{timestamp_str}_{count}_records.jsonl"
    s3_key = f"{s3_prefix}/{file_name}"

    bucket_name = getattr(settings, "AWS_STORAGE_BUCKET_NAME", None)
    aws_access_key = getattr(settings, "AWS_ACCESS_KEY_ID", None)
    aws_secret_key = getattr(settings, "AWS_SECRET_ACCESS_KEY", None)
    aws_region = getattr(settings, "AWS_S3_REGION_NAME", "us-east-1")

    if not bucket_name or not aws_access_key or not aws_secret_key:
        # Fallback: Save to local media directory if S3 is not configured
        local_path = f"media/ai_training/{file_name}"
        try:
            import os
            os.makedirs("media/ai_training", exist_ok=True)
            with open(local_path, "w", encoding="utf-8") as f:
                f.write(jsonl_content)
            return {
                "success": True,
                "record_count": count,
                "s3_uploaded": False,
                "local_path": local_path,
                "file_name": file_name,
                "message": f"Dataset saved locally at {local_path} ({count} records)."
            }
        except Exception as local_e:
            return {"success": False, "error": f"Failed to save locally: {local_e}"}

    try:
        s3_client = boto3.client(
            "s3",
            aws_access_key_id=aws_access_key,
            aws_secret_access_key=aws_secret_key,
            region_name=aws_region,
        )

        s3_client.put_object(
            Bucket=bucket_name,
            Key=s3_key,
            Body=jsonl_content.encode("utf-8"),
            ContentType="application/x-jsonlines",
        )

        s3_url = f"https://{bucket_name}.s3.amazonaws.com/{s3_key}"
        logger.info(f"S3 Fine-Tuning Export Success: Uploaded {count} records to {s3_url}")

        return {
            "success": True,
            "record_count": count,
            "s3_uploaded": True,
            "s3_key": s3_key,
            "s3_url": s3_url,
            "file_name": file_name,
            "message": f"Successfully uploaded {count} conversation records to S3 at {s3_key}."
        }

    except Exception as s3_err:
        logger.error(f"S3 Export error: {s3_err}", exc_info=True)
        return {"success": False, "error": f"S3 upload error: {str(s3_err)}"}
