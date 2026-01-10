from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.contrib.auth.models import User
from django.db.models import Count, Sum
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta
from subscription.models import Transaction

class AdminDashboardAnalyticsView(APIView):
    """
    Returns analytics data for the admin dashboard.
    Only accessible by staff/admin.
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        today = timezone.now().date()
        
        # Determine Date Range
        range_param = request.query_params.get('range', '7')
        
        if range_param == 'all':
            # Get earliest user date or default to 30 days ago if no users
            first_user = User.objects.order_by('date_joined').first()
            start_date = first_user.date_joined.date() if first_user else today - timedelta(days=30)
            date_label_format = '%Y-%m-%d' # Full date for all time
        else:
            try:
                days = int(range_param)
            except ValueError:
                days = 7
            start_date = today - timedelta(days=days - 1)
            date_label_format = '%a %d' if days <= 30 else '%Y-%m-%d'

        # 1. User Growth
        new_users_daily = User.objects.filter(
            date_joined__date__gte=start_date
        ).annotate(
            date=TruncDate('date_joined')
        ).values('date').annotate(
            count=Count('id')
        ).order_by('date')
        
        # Process Data for Chart
        chart_labels = []
        chart_data = []
        
        # delta between start_date and today
        delta = (today - start_date).days + 1
        
        # If range is huge (e.g. > 90 days), maybe we shouldn't fill every single missing day with 0 if it's too sparse?
        # But for smooth line charts, 0s are good. Let's fill them.
        existing_data = {item['date']: item['count'] for item in new_users_daily}
        
        for i in range(delta):
            d = start_date + timedelta(days=i)
            # Label
            chart_labels.append(d.strftime(date_label_format))
            # Data
            chart_data.append(existing_data.get(d, 0))

        # 2. Total Stats
        total_users = User.objects.count()
        total_revenue = Transaction.objects.filter(
            status='completed'
        ).aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        # 3. Recent Transactions (Last 5)
        recent_txns = Transaction.objects.filter(status='completed').order_by('-created_at')[:5].values(
            'user__username', 'amount', 'currency', 'gateway', 'created_at'
        )

        data = {
            'growth': {
                'labels': chart_labels,
                'data': chart_data
            },
            'stats': {
                'total_users': total_users,
                'revenue': total_revenue
            },
            'recent_transactions': list(recent_txns)
        }
        
        return Response(data)
