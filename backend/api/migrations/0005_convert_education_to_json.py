
from django.db import migrations, models
import json

def convert_education_to_json(apps, schema_editor):
    Profile = apps.get_model('api', 'Profile')
    for profile in Profile.objects.all():
        if profile.education and isinstance(profile.education, str):
            profile.education = json.dumps([{'degree': profile.education, 'school': '', 'field_of_study': ''}])
            profile.save()

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_profile_document_number_profile_document_type'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='dietary_preference',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='lifestyle_habits',
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name='profile',
            name='living_situation',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.RunPython(convert_education_to_json),
        migrations.AlterField(
            model_name='profile',
            name='education',
            field=models.JSONField(blank=True, default=list),
        ),
    ]
