# Generated migration for messaging system
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
from django.utils import timezone


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0030_matchunlock'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('subscription', '0001_initial'),  # Assuming subscription app exists
    ]

    operations = [
        # App Config table for dynamic settings
        migrations.CreateModel(
            name='AppConfig',
            fields=[
                ('key', models.CharField(max_length=100, primary_key=True, serialize=False)),
                ('value', models.JSONField()),
                ('description', models.TextField(blank=True, null=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'App Configuration',
                'verbose_name_plural': 'App Configurations',
                'db_table': 'api_appconfig',
            },
        ),
        
        # Chat Room model
        migrations.CreateModel(
            name='ChatRoom',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('participant_1', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='chat_rooms_as_p1', to='api.profile')),
                ('participant_2', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='chat_rooms_as_p2', to='api.profile')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Chat Room',
                'verbose_name_plural': 'Chat Rooms',
                'ordering': ['-updated_at'],
                'db_table': 'api_chatroom',
            },
        ),
        
        # Add unique constraint for chat room participants
        migrations.AddConstraint(
            model_name='chatroom',
            constraint=models.UniqueConstraint(
                fields=['participant_1', 'participant_2'],
                name='unique_chat_participants'
            ),
        ),
        
        # Add index for faster lookups
        migrations.AddIndex(
            model_name='chatroom',
            index=models.Index(fields=['participant_1', 'participant_2'], name='chatroom_participants_idx'),
        ),
        
        # Chat Unlock model
        migrations.CreateModel(
            name='ChatUnlock',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='chat_unlocks', to=settings.AUTH_USER_MODEL)),
                ('chat_room', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='unlocks', to='api.chatroom')),
                ('transaction', models.ForeignKey(null=True, blank=True, on_delete=django.db.models.deletion.SET_NULL, related_name='chat_unlock', to='subscription.transaction')),
                ('unlocked_at', models.DateTimeField(auto_now_add=True)),
                ('refund_eligible_at', models.DateTimeField(null=True, blank=True)),
                ('refund_status', models.CharField(
                    max_length=20,
                    choices=[
                        ('none', 'No Refund'),
                        ('eligible', 'Refund Eligible'),
                        ('processed', 'Refund Processed'),
                    ],
                    default='none',
                    db_index=True
                )),
                ('refund_processed_at', models.DateTimeField(null=True, blank=True)),
            ],
            options={
                'verbose_name': 'Chat Unlock',
                'verbose_name_plural': 'Chat Unlocks',
                'ordering': ['-unlocked_at'],
                'db_table': 'api_chatunlock',
            },
        ),
        
        # Add unique constraint for chat unlock
        migrations.AddConstraint(
            model_name='chatunlock',
            constraint=models.UniqueConstraint(
                fields=['user', 'chat_room'],
                name='unique_user_chat_unlock'
            ),
        ),
        
        # Add indexes for refund queries
        migrations.AddIndex(
            model_name='chatunlock',
            index=models.Index(fields=['refund_status', 'unlocked_at'], name='chatunlock_refund_idx'),
        ),
        
        # Message model
        migrations.CreateModel(
            name='Message',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('chat_room', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='messages', to='api.chatroom')),
                ('sender', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sent_messages', to='api.profile')),
                ('receiver', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='received_messages', to='api.profile')),
                ('content', models.TextField()),
                ('sent_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('is_read', models.BooleanField(default=False, db_index=True)),
            ],
            options={
                'verbose_name': 'Message',
                'verbose_name_plural': 'Messages',
                'ordering': ['sent_at'],
                'db_table': 'api_message',
            },
        ),
        
        # Add indexes for message queries
        migrations.AddIndex(
            model_name='message',
            index=models.Index(fields=['chat_room', 'sent_at'], name='message_room_time_idx'),
        ),
        migrations.AddIndex(
            model_name='message',
            index=models.Index(fields=['receiver', 'is_read'], name='message_unread_idx'),
        ),
    ]
