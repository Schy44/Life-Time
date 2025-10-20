
from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings

def convert_height_to_cm(apps, schema_editor):
    Profile = apps.get_model('api', 'Profile')
    for profile in Profile.objects.all():
        if isinstance(profile.height, str):
            try:
                feet, inches = profile.height.split("'")
                feet = int(feet)
                inches = int(inches.replace('"', ''))
                total_inches = (feet * 12) + inches
                cm = total_inches * 2.54
                profile.height = round(cm)
                profile.save()
            except (ValueError, TypeError):
                profile.height = None
                profile.save()

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_convert_education_to_json'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RunPython(convert_height_to_cm),
        migrations.RemoveField(
            model_name='profile',
            name='age',
        ),
        migrations.RemoveField(
            model_name='profile',
            name='education',
        ),
        migrations.RemoveField(
            model_name='profile',
            name='profession',
        ),
        migrations.RemoveField(
            model_name='profile',
            name='languages_spoken',
        ),
        migrations.RemoveField(
            model_name='profile',
            name='location',
        ),
        migrations.RemoveField(
            model_name='profile',
            name='lifestyle_habits',
        ),
        migrations.RemoveField(
            model_name='profile',
            name='religion',
        ),
        migrations.RemoveField(
            model_name='profile',
            name='dietary_preference',
        ),
        migrations.RemoveField(
            model_name='profile',
            name='living_situation',
        ),
        migrations.AddField(
            model_name='profile',
            name='date_of_birth',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='profile',
            name='height',
            field=models.PositiveSmallIntegerField(blank=True, help_text='in cm', null=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='consent',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='profile',
            name='tos_accepted',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='profile',
            name='is_deleted',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='profile',
            name='religion',
            field=models.CharField(blank=True, choices=[('islam', 'Islam'), ('christianity', 'Christianity'), ('hinduism', 'Hinduism'), ('buddhism', 'Buddhism'), ('judaism', 'Judaism'), ('other', 'Other')], max_length=20, null=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='lifestyle_habits',
            field=models.CharField(blank=True, choices=[('smoker', 'Smoker'), ('non_smoker', 'Non-Smoker'), ('drinks', 'Drinks'), ('does_not_drink', "Doesn't Drink"), ('early_bird', 'Early Bird'), ('night_owl', 'Night Owl')], max_length=20, null=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='current_city',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='current_country',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='origin_city',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='origin_country',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='visa_status',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='citizenship',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='profile',
            name='user',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.CreateModel(
            name='Education',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')), 
                ('degree', models.CharField(max_length=100)),
                ('school', models.CharField(max_length=100)),
                ('field_of_study', models.CharField(max_length=100)),
                ('profile', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='education', to='api.profile')),
            ],
        ),
        migrations.CreateModel(
            name='WorkExperience',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')), 
                ('title', models.CharField(max_length=100)),
                ('company', models.CharField(max_length=100)),
                ('profile', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='work_experience', to='api.profile')),
            ],
        ),
        migrations.CreateModel(
            name='UserLanguage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')), 
                ('language', models.CharField(max_length=50)),
                ('profile', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='languages', to='api.profile')),
            ],
        ),
        migrations.CreateModel(
            name='Preference',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')), 
                ('min_age', models.PositiveSmallIntegerField(blank=True, null=True)),
                ('max_age', models.PositiveSmallIntegerField(blank=True, null=True)),
                ('religion', models.CharField(blank=True, choices=[('islam', 'Islam'), ('christianity', 'Christianity'), ('hinduism', 'Hinduism'), ('buddhism', 'Buddhism'), ('judaism', 'Judaism'), ('other', 'Other')], max_length=20, null=True)),
                ('min_height', models.PositiveSmallIntegerField(blank=True, help_text='in cm', null=True)),
                ('max_height', models.PositiveSmallIntegerField(blank=True, help_text='in cm', null=True)),
                ('is_hard_filter', models.BooleanField(default=False)),
                ('profile', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='api.profile')),
            ],
        ),
    ]
