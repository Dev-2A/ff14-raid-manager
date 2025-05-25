from multiprocessing import context
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import login, logout, get_user_model
from .serializers import (
    UserSerializer, UserCreateSerializer, LoginSerializer,
    PasswordChangeSerializer
)

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    """회원가입 뷰"""
    queryset = User.objects.all()
    serializer_class = UserCreateSerializer
    permission_classes = [AllowAny]

class LoginView(APIView):
    """로그인 뷰"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user =serializer.validated_data['user']
            login(request, user)
            user_serializer = UserSerializer(user)
            return Response({
                'user': user_serializer.data,
                'message': '로그인 성공'
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    """로그아웃 뷰"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        logout(request)
        return Response({'message': '로그아웃 성공'})

class ProfileView(generics.RetrieveUpdateAPIView):
    """프로필 조회/수정 뷰"""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user

class PasswordChangeView(APIView):
    """비밀번호 변경 뷰"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            # 비밀번호 변경 후 다시 로그인 필요
            logout(request)
            return Response({'message': '비밀번호가 변경되었습니다. 다시 로그인해주세요.'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    """현재 로그인한 사용자 정보"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def check_username(request):
    """사용자명 중복 확인"""
    username = request.GET.get('username', '')
    if username:
        exists = User.objects.filter(username=username).exists()
        return Response({'exists': exists})
    return Response({'error': '사용자명을 입력해주세요.'}, status=status.HTTP_400_BAD_REQUEST)