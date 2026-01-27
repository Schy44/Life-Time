"""
Django management command to check for refund-eligible interest requests.
Run this daily via cron job to automatically process refunds for unresponded interests.

Usage:
    python manage.py refund_checker
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from api.models import Interest, AppConfig


class Command(BaseCommand):
    help = 'Check for interest requests with no response after 10 days and process automated refunds'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be refunded without actually processing',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        # Get refund eligibility period from config (default 10 days)
        refund_days = int(AppConfig.get_value('interest_refund_days', 10))
        cutoff_date = timezone.now() - timedelta(days=refund_days)
        
        self.stdout.write(f"Checking for interests older than {refund_days} days (before {cutoff_date})")
        
        # Find interests that are still 'sent' and older than 10 days
        eligible_interests = Interest.objects.filter(
            status='sent',
            created_at__lt=cutoff_date,
            refund_status='none'
        ).select_related('sender', 'receiver')
        
        refund_count = 0
        skip_count = 0
        
        for interest in eligible_interests:
            if dry_run:
                self.stdout.write(
                    self.style.WARNING(
                        f"[DRY RUN] Would refund: {interest.sender.user.username} for interest to {interest.receiver.name}"
                    )
                )
                refund_count += 1
            else:
                # Mark as cancelled and process refund
                interest.status = 'cancelled'
                interest.refund_status = 'eligible'
                interest.save()
                
                # Process refund immediately (credits returned to wallet)
                success = interest.process_refund()
                
                if success:
                    self.stdout.write(
                        self.style.SUCCESS(
                            f"✓ Refunded & Cancelled: {interest.sender.user.username} -> {interest.receiver.name}"
                        )
                    )
                    refund_count += 1
                else:
                    self.stdout.write(
                        self.style.ERROR(
                            f"✗ Failed to refund: {interest.sender.user.username}"
                        )
                    )
        
        # Summary
        if dry_run:
            self.stdout.write(
                self.style.SUCCESS(
                    f"\n[DRY RUN] Would process {refund_count} refunds"
                )
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    f"\n✓ Processed {refund_count} refunds"
                )
            )
