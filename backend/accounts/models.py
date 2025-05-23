from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """커스텀 사용자 모델"""
    # FF14 관련 정보
    character_name = models.CharField(max_length=50, blank=True, null=True, verbose_name='캐릭터명')
    server = models.CharField(max_length=30, blank=True, null=True, verbose_name='서버')
    
    # 프로필 정보
    profile_image = models.ImageField(upload_to='profiles/', blank=True, null=True, verbose_name='프로필 이미지')
    bio = models.TextField(blank=True, verbose_name='자기소개')
    
    # 추가 필드
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='가입일')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='수정일')
    
    class Meta:
        verbose_name = '사용자'
        verbose_name_plural = '사용자들'
        db_table = 'users'
    
    def __str__(self):
        if self.character_name:
            return f"{self.character_name}@{self.server}"
        return self.username