from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .serializers import UserSerializer, ProfileSerializer, InterestSerializer
from django.contrib.auth.models import User
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets
from .models import Profile, Interest
from rest_framework.decorators import action
from django.db.models import Q

class CountryListView(APIView):
    def get(self, request):
        countries = Profile.objects.exclude(current_country__isnull=True).exclude(current_country__exact='').values_list('current_country', flat=True).distinct()
        return Response(countries)


class RegisterView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
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
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            'username': request.user.username,
            'email': request.user.email,
            'name': request.user.first_name
        })


class ProfileDetailView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = Profile.objects.get(user=request.user)
            serializer = ProfileSerializer(profile, context={'request': request})
            return Response(serializer.data)
        except Profile.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)


class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.action == 'list':
            return Profile.objects.exclude(user=self.request.user)
        return Profile.objects.all()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class InterestViewSet(viewsets.ModelViewSet):
    queryset = Interest.objects.all()
    serializer_class = InterestSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_profile = self.request.user.profile
        return Interest.objects.filter(
            Q(sender=user_profile) | Q(receiver=user_profile)
        )

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

        interest, created = Interest.objects.get_or_create(sender=sender, receiver=receiver)

        if not created and interest.status in ['sent', 'accepted']:
            return Response({"error": "An interest has already been sent to this user."}, status=status.HTTP_400_BAD_REQUEST)

        if not created and interest.status == 'rejected':
            interest.status = 'sent'
            interest.save()

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