from rest_framework import serializers

from .models import (
    InstructorSolution,
    InstructorSolutionSection,
    PastPaper,
    PastPaperMaterial,
)


class PastPaperMaterialSerializer(serializers.ModelSerializer):
    download_url = serializers.SerializerMethodField()

    class Meta:
        model = PastPaperMaterial
        fields = ["id", "material_type", "title", "download_url"]

    def get_download_url(self, obj):
        request = self.context.get("request")
        path = f"/api/courses/instructor/past-papers/materials/{obj.pk}/download/"
        return request.build_absolute_uri(path) if request else path


class InstructorSolutionSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstructorSolutionSection
        fields = [
            "id",
            "question_number",
            "question_path",
            "question_summary",
            "maximum_marks",
            "mark_scheme_reference",
            "worked_solution_markdown",
            "examiner_guidance",
            "common_errors",
            "alternative_answers",
            "confidence",
            "order",
            "is_complete",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "question_number",
            "question_path",
            "maximum_marks",
            "order",
            "updated_at",
        ]

    def validate(self, attrs):
        forbidden = ("undefined", "\x00")
        for field in (
            "worked_solution_markdown",
            "mark_scheme_reference",
            "examiner_guidance",
            "common_errors",
            "alternative_answers",
        ):
            value = attrs.get(field)
            if value and any(token in value.lower() for token in forbidden):
                raise serializers.ValidationError(
                    {field: "Remove undefined or invalid placeholder content."}
                )
        return attrs


class InstructorSolutionSerializer(serializers.ModelSerializer):
    sections = InstructorSolutionSectionSerializer(many=True, read_only=True)
    completed_sections = serializers.SerializerMethodField()

    class Meta:
        model = InstructorSolution
        fields = [
            "id",
            "title",
            "status",
            "overview_markdown",
            "total_marks",
            "version",
            "completed_sections",
            "sections",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "title",
            "total_marks",
            "version",
            "completed_sections",
            "sections",
            "updated_at",
        ]

    def get_completed_sections(self, obj):
        return obj.sections.filter(is_complete=True).count()


class InstructorPastPaperListSerializer(serializers.ModelSerializer):
    series_label = serializers.CharField(
        source="get_exam_series_display", read_only=True
    )
    solution_status = serializers.SerializerMethodField()
    section_count = serializers.SerializerMethodField()
    completed_sections = serializers.SerializerMethodField()

    class Meta:
        model = PastPaper
        fields = [
            "id",
            "subject",
            "syllabus_code",
            "exam_year",
            "exam_series",
            "series_label",
            "paper_number",
            "variant",
            "component_code",
            "level",
            "status",
            "source_verified",
            "solution_status",
            "section_count",
            "completed_sections",
        ]

    def get_solution_status(self, obj):
        solution = getattr(obj, "instructor_solution", None)
        return solution.status if solution else "not_started"

    def get_section_count(self, obj):
        solution = getattr(obj, "instructor_solution", None)
        return solution.sections.count() if solution else 0

    def get_completed_sections(self, obj):
        solution = getattr(obj, "instructor_solution", None)
        return solution.sections.filter(is_complete=True).count() if solution else 0


class InstructorPastPaperDetailSerializer(InstructorPastPaperListSerializer):
    materials = PastPaperMaterialSerializer(many=True, read_only=True)
    instructor_solution = InstructorSolutionSerializer(read_only=True)

    class Meta(InstructorPastPaperListSerializer.Meta):
        fields = InstructorPastPaperListSerializer.Meta.fields + [
            "syllabus_era",
            "materials",
            "instructor_solution",
        ]
