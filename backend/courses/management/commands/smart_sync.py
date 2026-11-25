import json
from django.core.management.base import BaseCommand
from django.apps import apps
from django.db import transaction

class Command(BaseCommand):
    help = "Smart syncs database objects from a JSON dump by matching natural keys instead of forcing primary keys, avoiding live DB conflicts."

    def add_arguments(self, parser):
        parser.add_argument('fixture', type=str, help="Path to the JSON fixture file")

    def handle(self, *args, **options):
        fixture_path = options['fixture']
        
        try:
            with open(fixture_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Failed to open {fixture_path}: {e}"))
            return

        id_map = {} # {model_name: {old_pk: new_pk}}
        
        # Natural key definitions for the models we care about
        NATURAL_KEYS = {
            'auth.user': ['username'],
            'courses.course': ['slug'],
            'courses.module': ['course_id', 'title'],
            'courses.lesson': ['module_id', 'title'],
            'courses.lessonmaterial': ['lesson_id', 'title'],
            'courses.quiz': ['title'], 
            'courses.question': ['quiz_id', 'text'],
            'courses.choice': ['question_id', 'text'],
            'courses.coupon': ['code'],
            'courses.userxp': ['user_id', 'course_id'],
            'courses.studysession': ['user_id', 'course_id'],
            'courses.quizattempt': ['user_id', 'quiz_id', 'started_at'],
            'courses.enrollment': ['user_id', 'course_id'],
            'courses.certificate': ['user_id', 'course_id'],
            'courses.project': ['slug'],
            'courses.post': ['slug'],
            'courses.usermemory': ['user_id', 'category', 'fact'],
            'courses.corporatesponsor': ['name'],
            'courses.cohort': ['course_id', 'name'],
            'courses.coursescholarship': ['student_id', 'cohort_id'],
            'courses.cambridgetextbook': ['key'],
            'courses.cambridgetextbookpage': ['textbook_id', 'page_number'],
            'courses.cambridgetextbookchunk': ['textbook_id', 'topic_code', 'order', 'page_start'],
            'courses.cambridgetextbookimage': ['textbook_id', 'sha256'],
            'courses.pastpaper': ['seed_key'],
            'courses.pastpapermaterial': ['past_paper_id', 'material_type', 'title'],
            'courses.instructorsolution': ['past_paper_id'],
            'courses.instructorsolutionsection': ['solution_id', 'question_path'],
            'gadgets.gadgetcategory': ['slug'],
            'gadgets.gadget': ['slug'],
            'gadgets.gadgetloan': ['plan_number'],
        }

        success_count = 0
        cache_by_model = {}
        total = len(data)
        
        with transaction.atomic():
            for idx, item in enumerate(data):
                model_name = item['model']
                old_pk = item['pk']
                fields = item['fields']
                
                if model_name not in id_map:
                    id_map[model_name] = {}
                    
                try:
                    Model = apps.get_model(model_name)
                except LookupError:
                    continue

                mapped_fields = {}
                m2m_fields_data = {}
                
                for field in Model._meta.get_fields():
                    field_name = field.name
                    
                    if field.many_to_many:
                        if field_name in fields:
                            m2m_fields_data[field_name] = (fields[field_name], field)
                        continue
                        
                    if field.is_relation and (field.many_to_one or field.one_to_one):
                        if field_name in fields:
                            old_rel_pk = fields[field_name]
                            if old_rel_pk is not None:
                                rel_model_name = field.related_model._meta.label_lower
                                if rel_model_name in id_map and old_rel_pk in id_map[rel_model_name]:
                                    mapped_fields[field_name + '_id'] = id_map[rel_model_name][old_rel_pk]
                                else:
                                    mapped_fields[field_name + '_id'] = old_rel_pk
                            else:
                                mapped_fields[field_name + '_id'] = None
                    else:
                        if field_name in fields:
                            mapped_fields[field_name] = fields[field_name]

                unique_fields = NATURAL_KEYS.get(model_name, [])
                
                # Dynamic fallback for quiz (can belong to module or lesson)
                if model_name == 'courses.quiz':
                    if mapped_fields.get('module_id'):
                        unique_fields = ['module_id', 'title']
                    elif mapped_fields.get('lesson_id'):
                        unique_fields = ['lesson_id', 'title']

                if not unique_fields:
                    lookup_kwargs = {'pk': old_pk}
                    defaults = mapped_fields
                else:
                    lookup_kwargs = {}
                    for k in unique_fields:
                        if k in mapped_fields and mapped_fields[k] is not None:
                            lookup_kwargs[k] = mapped_fields[k]
                    defaults = {k: v for k, v in mapped_fields.items() if k not in unique_fields}
                
                if not lookup_kwargs or (unique_fields and len(lookup_kwargs) != len(unique_fields)):
                    continue
                
                # Pre-load cache for this model to avoid thousands of round trips
                if unique_fields and model_name not in cache_by_model:
                    cache_by_model[model_name] = {}
                    try:
                        for row in Model.objects.values('pk', *unique_fields):
                            ckey = tuple(row.get(k) for k in unique_fields)
                            cache_by_model[model_name][ckey] = row['pk']
                    except Exception:
                        pass
                
                cache_key = tuple(lookup_kwargs.get(k) for k in unique_fields) if unique_fields else None
                
                try:
                    if cache_key and model_name in cache_by_model and cache_key in cache_by_model[model_name]:
                        existing_pk = cache_by_model[model_name][cache_key]
                        id_map[model_name][old_pk] = existing_pk
                        success_count += 1
                    else:
                        obj, created = Model.objects.get_or_create(
                            **lookup_kwargs,
                            defaults=defaults
                        )
                        
                        if not created:
                            updated = False
                            for field_name, val in defaults.items():
                                current_val = getattr(obj, field_name, None)
                                if (current_val is None or current_val == '') and val:
                                    setattr(obj, field_name, val)
                                    updated = True
                            if updated:
                                obj.save()

                        id_map[model_name][old_pk] = obj.pk
                        if cache_key and model_name in cache_by_model:
                            cache_by_model[model_name][cache_key] = obj.pk
                        
                        # Handle M2M
                        for m2m_name, (old_m2m_pks, field) in m2m_fields_data.items():
                            rel_model_name = field.related_model._meta.label_lower
                            new_m2m_pks = []
                            for old_rel_pk in old_m2m_pks:
                                if isinstance(old_rel_pk, list):
                                    try:
                                        if rel_model_name == 'auth.user':
                                            rel_obj = field.related_model.objects.get(username=old_rel_pk[0])
                                        else:
                                            rel_obj = field.related_model.objects.get_by_natural_key(*old_rel_pk)
                                        new_m2m_pks.append(rel_obj.pk)
                                    except:
                                        pass
                                else:
                                    if rel_model_name in id_map and old_rel_pk in id_map[rel_model_name]:
                                        new_m2m_pks.append(id_map[rel_model_name][old_rel_pk])
                                    else:
                                        new_m2m_pks.append(old_rel_pk)
                            getattr(obj, m2m_name).set(new_m2m_pks)
                        
                        success_count += 1
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f"Failed to sync {model_name} {old_pk}: {e}"))
                
                if (idx + 1) % 500 == 0 or (idx + 1) == total:
                    self.stdout.write(f"Synced {idx + 1}/{total} objects...")

        self.stdout.write(self.style.SUCCESS(f"Successfully smart synced {success_count} objects!"))
