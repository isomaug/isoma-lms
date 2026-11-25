from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def rlhf_data_list(request):
    from .models import DataCollectionItem
    if not request.user.is_superuser:
        return Response({"error": "Unauthorized"}, status=403)
    items = DataCollectionItem.objects.all().order_by("-created_at")
    data = []
    for i in items:
        data.append({
            "id": i.id,
            "data_source": i.data_source,
            "data_type": i.data_type,
            "source_language": i.source_language,
            "original_text": i.original_text,
            "translated_prompt": i.translated_prompt,
            "ai_response_candidate_1": i.ai_response_candidate_1,
            "status": "REVIEWED" if i.is_gold_standard else "RAW",
            "taxonomy_tags": i.quality_tags,
            "media_file": i.media_file.url if i.media_file and i.media_file.name else None,
            "created_at": i.created_at
        })
    return Response(data)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def rlhf_data_detail(request, pk):
    from .models import DataCollectionItem
    if not request.user.is_superuser:
        return Response({"error": "Unauthorized"}, status=403)
    
    try:
        item = DataCollectionItem.objects.get(pk=pk)
    except DataCollectionItem.DoesNotExist:
        return Response({"error": "Not found"}, status=404)
        
    data = request.data
    if "translated_prompt" in data:
        item.translated_prompt = data["translated_prompt"]
    if "ai_response_candidate_1" in data:
        item.ai_response_candidate_1 = data["ai_response_candidate_1"]
    if "taxonomy_tags" in data:
        item.quality_tags = data["taxonomy_tags"]
    if "status" in data:
        item.is_gold_standard = (data["status"] == "REVIEWED")
        
    item.save()
    
    return Response({
        "id": item.id,
        "data_source": item.data_source,
        "data_type": item.data_type,
        "source_language": item.source_language,
        "original_text": item.original_text,
        "translated_prompt": item.translated_prompt,
        "ai_response_candidate_1": item.ai_response_candidate_1,
        "status": "REVIEWED" if item.is_gold_standard else "RAW",
        "taxonomy_tags": item.quality_tags,
        "media_file": item.media_file.url if item.media_file and item.media_file.name else None,
        "created_at": item.created_at
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def rlhf_export_jsonl(request):
    import json
    from django.http import HttpResponse
    from .models import DataCollectionItem
    
    if not request.user.is_superuser:
        return Response({"error": "Unauthorized"}, status=403)
        
    items = DataCollectionItem.objects.filter(is_gold_standard=True)
    
    lines = []
    for item in items:
        # Construct standard JSONL instruction fine-tuning format
        record = {
            "messages": [
                {"role": "user", "content": item.translated_prompt},
                {"role": "assistant", "content": item.ai_response_candidate_1}
            ],
            "metadata": {
                "source_language": item.source_language,
                "taxonomy_tags": item.quality_tags
            }
        }
        lines.append(json.dumps(record))
        
    response = HttpResponse("\n".join(lines), content_type="application/jsonl")
    response["Content-Disposition"] = 'attachment; filename="ekebuai_rlhf_dataset.jsonl"'
    return response
