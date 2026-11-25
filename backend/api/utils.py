from io import BytesIO
from django.core.files.uploadedfile import InMemoryUploadedFile


def compress_image(image_field, max_width=1200):
    if not image_field:
        return image_field
    try:
        from PIL import Image

        img = Image.open(image_field)
        if img.mode != "RGB":
            img = img.convert("RGB")
        if img.width > max_width:
            ratio = max_width / img.width
            img = img.resize((max_width, int(img.height * ratio)), Image.Resampling.LANCZOS)
        output_io = BytesIO()
        img.save(output_io, format="WEBP", quality=85, optimize=True)
        output_io.seek(0)
        original_name = image_field.name.split(".")[0]
        return InMemoryUploadedFile(
            output_io, "ImageField", f"{original_name}.webp", "image/webp", len(output_io.getvalue()), None
        )
    except Exception:
        return image_field


def user_is_verified(user):
    return bool(user and getattr(user, "is_authenticated", False) and getattr(user, "is_active", False))
