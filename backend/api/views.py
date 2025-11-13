from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .serializers import UserSerializer, ProfileSerializer, InterestSerializer, NotificationSerializer
from django.contrib.auth.models import User
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets
from .models import Profile, Interest, WorkExperience, Notification
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q
from django.shortcuts import get_object_or_404
from datetime import date, timedelta
from django.utils import timezone
from rest_framework import generics
from rest_framework.pagination import PageNumberPagination


class CountryListView(APIView):
    def get(self, request):
        countries = [
            {'code': 'AF', 'name': 'Afghanistan'},
            {'code': 'AX', 'name': 'Åland Islands'},
            {'code': 'AL', 'name': 'Albania'},
            {'code': 'DZ', 'name': 'Algeria'},
            {'code': 'AS', 'name': 'American Samoa'},
            {'code': 'AD', 'name': 'Andorra'},
            {'code': 'AO', 'name': 'Angola'},
            {'code': 'AI', 'name': 'Anguilla'},
            {'code': 'AQ', 'name': 'Antarctica'},
            {'code': 'AG', 'name': 'Antigua and Barbuda'},
            {'code': 'AR', 'name': 'Argentina'},
            {'code': 'AM', 'name': 'Armenia'},
            {'code': 'AW', 'name': 'Aruba'},
            {'code': 'AU', 'name': 'Australia'},
            {'code': 'AT', 'name': 'Austria'},
            {'code': 'AZ', 'name': 'Azerbaijan'},
            {'code': 'BS', 'name': 'Bahamas'},
            {'code': 'BH', 'name': 'Bahrain'},
            {'code': 'BD', 'name': 'Bangladesh'},
            {'code': 'BB', 'name': 'Barbados'},
            {'code': 'BY', 'name': 'Belarus'},
            {'code': 'BE', 'name': 'Belgium'},
            {'code': 'BZ', 'name': 'Belize'},
            {'code': 'BJ', 'name': 'Benin'},
            {'code': 'BM', 'name': 'Bermuda'},
            {'code': 'BT', 'name': 'Bhutan'},
            {'code': 'BO', 'name': 'Bolivia'},
            {'code': 'BA', 'name': 'Bosnia and Herzegovina'},
            {'code': 'BW', 'name': 'Botswana'},
            {'code': 'BV', 'name': 'Bouvet Island'},
            {'code': 'BR', 'name': 'Brazil'},
            {'code': 'IO', 'name': 'British Indian Ocean Territory'},
            {'code': 'BN', 'name': 'Brunei Darussalam'},
            {'code': 'BG', 'name': 'Bulgaria'},
            {'code': 'BF', 'name': 'Burkina Faso'},
            {'code': 'BI', 'name': 'Burundi'},
            {'code': 'KH', 'name': 'Cambodia'},
            {'code': 'CM', 'name': 'Cameroon'},
            {'code': 'CA', 'name': 'Canada'},
            {'code': 'CV', 'name': 'Cape Verde'},
            {'code': 'KY', 'name': 'Cayman Islands'},
            {'code': 'CF', 'name': 'Central African Republic'},
            {'code': 'TD', 'name': 'Chad'},
            {'code': 'CL', 'name': 'Chile'},
            {'code': 'CN', 'name': 'China'},
            {'code': 'CX', 'name': 'Christmas Island'},
            {'code': 'CC', 'name': 'Cocos (Keeling) Islands'},
            {'code': 'CO', 'name': 'Colombia'},
            {'code': 'KM', 'name': 'Comoros'},
            {'code': 'CG', 'name': 'Congo'},
            {'code': 'CD', 'name': 'Congo, The Democratic Republic of the'},
            {'code': 'CK', 'name': 'Cook Islands'},
            {'code': 'CR', 'name': 'Costa Rica'},
            {'code': 'CI', 'name': "Cote D'Ivoire"},
            {'code': 'HR', 'name': 'Croatia'},
            {'code': 'CU', 'name': 'Cuba'},
            {'code': 'CY', 'name': 'Cyprus'},
            {'code': 'CZ', 'name': 'Czech Republic'},
            {'code': 'DK', 'name': 'Denmark'},
            {'code': 'DJ', 'name': 'Djibouti'},
            {'code': 'DM', 'name': 'Dominica'},
            {'code': 'DO', 'name': 'Dominican Republic'},
            {'code': 'EC', 'name': 'Ecuador'},
            {'code': 'EG', 'name': 'Egypt'},
            {'code': 'SV', 'name': 'El Salvador'},
            {'code': 'GQ', 'name': 'Equatorial Guinea'},
            {'code': 'ER', 'name': 'Eritrea'},
            {'code': 'EE', 'name': 'Estonia'},
            {'code': 'ET', 'name': 'Ethiopia'},
            {'code': 'FK', 'name': 'Falkland Islands (Malvinas)'},
            {'code': 'FO', 'name': 'Faroe Islands'},
            {'code': 'FJ', 'name': 'Fiji'},
            {'code': 'FI', 'name': 'Finland'},
            {'code': 'FR', 'name': 'France'},
            {'code': 'GF', 'name': 'French Guiana'},
            {'code': 'PF', 'name': 'French Polynesia'},
            {'code': 'TF', 'name': 'French Southern Territories'},
            {'code': 'GA', 'name': 'Gabon'},
            {'code': 'GM', 'name': 'Gambia'},
            {'code': 'GE', 'name': 'Georgia'},
            {'code': 'DE', 'name': 'Germany'},
            {'code': 'GH', 'name': 'Ghana'},
            {'code': 'GI', 'name': 'Gibraltar'},
            {'code': 'GR', 'name': 'Greece'},
            {'code': 'GL', 'name': 'Greenland'},
            {'code': 'GD', 'name': 'Grenada'},
            {'code': 'GP', 'name': 'Guadeloupe'},
            {'code': 'GU', 'name': 'Guam'},
            {'code': 'GT', 'name': 'Guatemala'},
            {'code': 'GG', 'name': 'Guernsey'},
            {'code': 'GN', 'name': 'Guinea'},
            {'code': 'GW', 'name': 'Guinea-Bissau'},
            {'code': 'GY', 'name': 'Guyana'},
            {'code': 'HT', 'name': 'Haiti'},
            {'code': 'HM', 'name': 'Heard Island and Mcdonald Islands'},
            {'code': 'VA', 'name': 'Holy See (Vatican City State)'},
            {'code': 'HN', 'name': 'Honduras'},
            {'code': 'HK', 'name': 'Hong Kong'},
            {'code': 'HU', 'name': 'Hungary'},
            {'code': 'IS', 'name': 'Iceland'},
            {'code': 'IN', 'name': 'India'},
            {'code': 'ID', 'name': 'Indonesia'},
            {'code': 'IR', 'name': 'Iran, Islamic Republic Of'},
            {'code': 'IQ', 'name': 'Iraq'},
            {'code': 'IE', 'name': 'Ireland'},
            {'code': 'IM', 'name': 'Isle of Man'},
            {'code': 'IL', 'name': 'Israel'},
            {'code': 'IT', 'name': 'Italy'},
            {'code': 'JM', 'name': 'Jamaica'},
            {'code': 'JP', 'name': 'Japan'},
            {'code': 'JE', 'name': 'Jersey'},
            {'code': 'JO', 'name': 'Jordan'},
            {'code': 'KZ', 'name': 'Kazakhstan'},
            {'code': 'KE', 'name': 'Kenya'},
            {'code': 'KI', 'name': 'Kiribati'},
            {'code': 'KP', 'name': "Korea, Democratic People's Republic of"},
            {'code': 'KR', 'name': 'Korea, Republic of'},
            {'code': 'KW', 'name': 'Kuwait'},
            {'code': 'KG', 'name': 'Kyrgyzstan'},
            {'code': 'LA', 'name': "Lao People's Democratic Republic"},
            {'code': 'LV', 'name': 'Latvia'},
            {'code': 'LB', 'name': 'Lebanon'},
            {'code': 'LS', 'name': 'Lesotho'},
            {'code': 'LR', 'name': 'Liberia'},
            {'code': 'LY', 'name': 'Libyan Arab Jamahiriya'},
            {'code': 'LI', 'name': 'Liechtenstein'},
            {'code': 'LT', 'name': 'Lithuania'},
            {'code': 'LU', 'name': 'Luxembourg'},
            {'code': 'MO', 'name': 'Macao'},
            {'code': 'MK', 'name': 'Macedonia, The Former Yugoslav Republic of'},
            {'code': 'MG', 'name': 'Madagascar'},
            {'code': 'MW', 'name': 'Malawi'},
            {'code': 'MY', 'name': 'Malaysia'},
            {'code': 'MV', 'name': 'Maldives'},
            {'code': 'ML', 'name': 'Mali'},
            {'code': 'MT', 'name': 'Malta'},
            {'code': 'MH', 'name': 'Marshall Islands'},
            {'code': 'MQ', 'name': 'Martinique'},
            {'code': 'MR', 'name': 'Mauritania'},
            {'code': 'MU', 'name': 'Mauritius'},
            {'code': 'YT', 'name': 'Mayotte'},
            {'code': 'MX', 'name': 'Mexico'},
            {'code': 'FM', 'name': 'Micronesia, Federated States of'},
            {'code': 'MD', 'name': 'Moldova, Republic of'},
            {'code': 'MC', 'name': 'Monaco'},
            {'code': 'MN', 'name': 'Mongolia'},
            {'code': 'MS', 'name': 'Montserrat'},
            {'code': 'MA', 'name': 'Morocco'},
            {'code': 'MZ', 'name': 'Mozambique'},
            {'code': 'MM', 'name': 'Myanmar'},
            {'code': 'NA', 'name': 'Namibia'},
            {'code': 'NR', 'name': 'Nauru'},
            {'code': 'NP', 'name': 'Nepal'},
            {'code': 'NL', 'name': 'Netherlands'},
            {'code': 'AN', 'name': 'Netherlands Antilles'},
            {'code': 'NC', 'name': 'New Caledonia'},
            {'code': 'NZ', 'name': 'New Zealand'},
            {'code': 'NI', 'name': 'Nicaragua'},
            {'code': 'NE', 'name': 'Niger'},
            {'code': 'NG', 'name': 'Nigeria'},
            {'code': 'NU', 'name': 'Niue'},
            {'code': 'NF', 'name': 'Norfolk Island'},
            {'code': 'MP', 'name': 'Northern Mariana Islands'},
            {'code': 'NO', 'name': 'Norway'},
            {'code': 'OM', 'name': 'Oman'},
            {'code': 'PK', 'name': 'Pakistan'},
            {'code': 'PW', 'name': 'Palau'},
            {'code': 'PS', 'name': 'Palestinian Territory, Occupied'},
            {'code': 'PA', 'name': 'Panama'},
            {'code': 'PG', 'name': 'Papua New Guinea'},
            {'code': 'PY', 'name': 'Paraguay'},
            {'code': 'PE', 'name': 'Peru'},
            {'code': 'PH', 'name': 'Philippines'},
            {'code': 'PN', 'name': 'Pitcairn'},
            {'code': 'PL', 'name': 'Poland'},
            {'code': 'PT', 'name': 'Portugal'},
            {'code': 'PR', 'name': 'Puerto Rico'},
            {'code': 'QA', 'name': 'Qatar'},
            {'code': 'RE', 'name': 'Reunion'},
            {'code': 'RO', 'name': 'Romania'},
            {'code': 'RU', 'name': 'Russian Federation'},
            {'code': 'RW', 'name': 'Rwanda'},
            {'code': 'SH', 'name': 'Saint Helena'},
            {'code': 'KN', 'name': 'Saint Kitts and Nevis'},
            {'code': 'LC', 'name': 'Saint Lucia'},
            {'code': 'PM', 'name': 'Saint Pierre and Miquelon'},
            {'code': 'VC', 'name': 'Saint Vincent and the Grenadines'},
            {'code': 'WS', 'name': 'Samoa'},
            {'code': 'SM', 'name': 'San Marino'},
            {'code': 'ST', 'name': 'Sao Tome and Principe'},
            {'code': 'SA', 'name': 'Saudi Arabia'},
            {'code': 'SN', 'name': 'Senegal'},
            {'code': 'CS', 'name': 'Serbia and Montenegro'},
            {'code': 'SC', 'name': 'Seychelles'},
            {'code': 'SL', 'name': 'Sierra Leone'},
            {'code': 'SG', 'name': 'Singapore'},
            {'code': 'SK', 'name': 'Slovakia'},
            {'code': 'SI', 'name': 'Slovenia'},
            {'code': 'SB', 'name': 'Solomon Islands'},
            {'code': 'SO', 'name': 'Somalia'},
            {'code': 'ZA', 'name': 'South Africa'},
            {'code': 'GS', 'name': 'South Georgia and the South Sandwich Islands'},
            {'code': 'ES', 'name': 'Spain'},
            {'code': 'LK', 'name': 'Sri Lanka'},
            {'code': 'SD', 'name': 'Sudan'},
            {'code': 'SR', 'name': 'Suriname'},
            {'code': 'SJ', 'name': 'Svalbard and Jan Mayen'},
            {'code': 'SZ', 'name': 'Swaziland'},
            {'code': 'SE', 'name': 'Sweden'},
            {'code': 'CH', 'name': 'Switzerland'},
            {'code': 'SY', 'name': 'Syrian Arab Republic'},
            {'code': 'TW', 'name': 'Taiwan, Province of China'},
            {'code': 'TJ', 'name': 'Tajikistan'},
            {'code': 'TZ', 'name': 'Tanzania, United Republic of'},
            {'code': 'TH', 'name': 'Thailand'},
            {'code': 'TL', 'name': 'Timor-Leste'},
            {'code': 'TG', 'name': 'Togo'},
            {'code': 'TK', 'name': 'Tokelau'},
            {'code': 'TO', 'name': 'Tonga'},
            {'code': 'TT', 'name': 'Trinidad and Tobago'},
            {'code': 'TN', 'name': 'Tunisia'},
            {'code': 'TR', 'name': 'Turkey'},
            {'code': 'TM', 'name': 'Turkmenistan'},
            {'code': 'TC', 'name': 'Turks and Caicos Islands'},
            {'code': 'TV', 'name': 'Tuvalu'},
            {'code': 'UG', 'name': 'Uganda'},
            {'code': 'UA', 'name': 'Ukraine'},
            {'code': 'AE', 'name': 'United Arab Emirates'},
            {'code': 'GB', 'name': 'United Kingdom'},
            {'code': 'US', 'name': 'United States'},
            {'code': 'UM', 'name': 'United States Minor Outlying Islands'},
            {'code': 'UY', 'name': 'Uruguay'},
            {'code': 'UZ', 'name': 'Uzbekistan'},
            {'code': 'VU', 'name': 'Vanuatu'},
            {'code': 'VE', 'name': 'Venezuela'},
            {'code': 'VN', 'name': 'Viet Nam'},
            {'code': 'VG', 'name': 'Virgin Islands, British'},
            {'code': 'VI', 'name': 'Virgin Islands, U.S.'},
            {'code': 'WF', 'name': 'Wallis and Futuna'},
            {'code': 'EH', 'name': 'Western Sahara'},
            {'code': 'YE', 'name': 'Yemen'},
            {'code': 'ZM', 'name': 'Zambia'},
            {'code': 'ZW', 'name': 'Zimbabwe'},
        ]
        return Response(countries)


class ProfessionListView(APIView):
    def get(self, request):
        professions = WorkExperience.objects.values_list(
            'title', flat=True).distinct()
        return Response(professions)


class RegisterView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Create a profile for the new user
            Profile.objects.create(user=user)
            token, created = Token.objects.get_or_create(user=user)
            return Response({'token': token.key}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            token, created = Token.objects.get_or_create(user=user)
            return Response({'token': token.key})
        return Response({'error': 'Invalid Credentials'}, status=status.HTTP_400_BAD_REQUEST)


class UserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            'username': request.user.username,
            'email': request.user.email,
            'name': request.user.first_name
        })


class ProfileDetailView(generics.RetrieveAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # This view is for the user's own profile, so we fetch it via the request.user
        return get_object_or_404(Profile, user=self.request.user)


class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)
    pagination_class = PageNumberPagination

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # --- Create Notification for Profile View ---
        # Ensure users don't get notified for viewing their own profile
        if request.user.is_authenticated and instance.user != request.user:
            # Check if the viewer has a profile
            if hasattr(request.user, 'profile'):
                # Throttle notifications: only create a new one if a similar one doesn't exist from the last 24 hours.
                recent_notification_exists = Notification.objects.filter(
                    recipient=instance.user,
                    actor_profile=request.user.profile,
                    verb="viewed your profile",
                    created_at__gte=timezone.now() - timedelta(hours=24)
                ).exists()

                if not recent_notification_exists:
                    Notification.objects.create(
                        recipient=instance.user,  # The owner of the profile being viewed
                        actor_profile=request.user.profile,  # The profile of the viewer
                        verb="viewed your profile",
                    )
        # ------------------------------------------
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def get_queryset(self):
        queryset = Profile.objects.all().prefetch_related('work_experience', 'education')
        if self.action == 'list':
            queryset = queryset.exclude(user=self.request.user)

            # Helper to calculate birth year range from age range
            def _get_birth_year_range_from_age(age_range_str):
                current_year = date.today().year
                if '-' in age_range_str:
                    min_age_str, max_age_str = age_range_str.split('-')
                    min_age = int(min_age_str)
                    max_age = int(max_age_str)
                elif '+' in age_range_str:
                    min_age = int(age_range_str.replace('+', ''))
                    max_age = 150  # Effectively no upper limit
                else:
                    return None, None  # Invalid format

                min_birth_year = current_year - max_age
                max_birth_year = current_year - min_age
                return min_birth_year, max_birth_year

            # Apply filters
            search_term = self.request.query_params.get('search', None)
            age_filter = self.request.query_params.get('age', None)
            gender_filter = self.request.query_params.get('gender', None)
            interest_filter = self.request.query_params.get(
                'interest', None)  # Assuming this is a text search for now

            if search_term:
                queryset = queryset.filter(
                    Q(name__icontains=search_term) |
                    Q(current_city__icontains=search_term) |
                    Q(origin_city__icontains=search_term) |
                    Q(about__icontains=search_term) |
                    Q(looking_for__icontains=search_term) |
                    Q(work_experience__title__icontains=search_term)
                ).distinct()

            if age_filter:
                min_birth_year, max_birth_year = _get_birth_year_range_from_age(
                    age_filter)
                if min_birth_year and max_birth_year:
                    queryset = queryset.filter(
                        birth_year__gte=min_birth_year, birth_year__lte=max_birth_year)

            if gender_filter:
                queryset = queryset.filter(gender__iexact=gender_filter)

            if interest_filter:
                # For now, treat interest_filter as a general text search across relevant fields
                queryset = queryset.filter(
                    Q(about__icontains=interest_filter) |
                    Q(looking_for__icontains=interest_filter) |
                    Q(work_experience__title__icontains=interest_filter)
                ).distinct()

        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class InterestViewSet(viewsets.ModelViewSet):
    queryset = Interest.objects.all()
    serializer_class = InterestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        profile_id = self.request.query_params.get('profile_id')
        if profile_id:
            user_profile = get_object_or_404(Profile, id=profile_id)
        else:
            user_profile = self.request.user.profile

        return Interest.objects.filter(
            Q(sender=user_profile) | Q(receiver=user_profile)
        )

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        print("Serialized interests:", serializer.data)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        receiver_id = request.data.get('receiver')
        if not receiver_id:
            return Response({"error": "Receiver ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            receiver = Profile.objects.get(id=receiver_id)
        except Profile.DoesNotExist:
            return Response({"error": "Receiver profile not found."}, status=status.HTTP_404_NOT_FOUND)

        sender = request.user.profile

        if sender == receiver:
            return Response({"error": "You cannot send an interest to yourself."}, status=status.HTTP_400_BAD_REQUEST)

        interest, created = Interest.objects.get_or_create(
            sender=sender, receiver=receiver)

        if not created and interest.status in ['sent', 'accepted']:
            return Response({"error": "An interest has already been sent to this user."}, status=status.HTTP_400_BAD_REQUEST)

        if not created and interest.status == 'rejected':
            interest.status = 'sent'
            interest.save()

        # --- Create Notification for Interest Sent ---
        if created or interest.status == 'sent':
            Notification.objects.create(
                recipient=receiver.user,
                actor_profile=sender,
                verb="sent you an interest request",
                target_profile=receiver
            )
        # -----------------------------------------

        serializer = self.get_serializer(interest)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK, headers=headers)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        interest = self.get_object()
        if interest.receiver.user != request.user:
            return Response({'error': 'You are not authorized to accept this interest.'}, status=status.HTTP_403_FORBIDDEN)

        interest.status = 'accepted'
        interest.save()
        return Response({'status': 'Interest accepted'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        interest = self.get_object()
        if interest.receiver.user != request.user:
            return Response({'error': 'You are not authorized to reject this interest.'}, status=status.HTTP_403_FORBIDDEN)

        interest.status = 'rejected'
        interest.save()
        return Response({'status': 'Interest rejected'})

    def destroy(self, request, *args, **kwargs):
        interest = self.get_object()
        if interest.sender.user != request.user:
            return Response({'error': 'You are not authorized to cancel this interest.'}, status=status.HTTP_403_FORBIDDEN)

        return super().destroy(request, *args, **kwargs)


# --- Notification Views ---
class NotificationListView(generics.ListAPIView):
    """
    List all unread notifications for the current authenticated user.
    """
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Return only unread notifications for the current user, ordered by most recent
        return self.request.user.received_notifications.filter(unread=True).order_by('-created_at')


class MarkNotificationAsReadView(APIView):
    """
    Mark a specific notification or all notifications for the current user as read.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        notification_id = request.data.get('id')
        mark_all = request.data.get('all', False)

        if mark_all:
            # Mark all unread notifications for the current user as read
            request.user.received_notifications.filter(
                unread=True).update(unread=False)
            return Response(status=status.HTTP_204_NO_CONTENT)

        if notification_id:
            # Mark a specific notification as read
            notification = get_object_or_404(
                Notification, id=notification_id, recipient=request.user)
            notification.unread = False
            notification.save()
            return Response(status=status.HTTP_204_NO_CONTENT)

        return Response({"detail": "Provide 'id' or 'all: true' in the request body."}, status=status.HTTP_400_BAD_REQUEST)


class UnreadNotificationCountView(APIView):
    """
    Returns the count of unread notifications for the current user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        count = request.user.received_notifications.filter(unread=True).count()
        return Response({'unread_count': count}, status=status.HTTP_200_OK)
