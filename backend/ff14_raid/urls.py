"""
URL configuration for ff14_raid project.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse

def api_test_page(request):
    """API 테스트를 위한 간단한 HTML 페이지"""
    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>FF14 레이드 관리 API</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #333; }
            .endpoint { background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 5px; }
            .method { font-weight: bold; color: #4CAF50; }
            code { background: #e0e0e0; padding: 2px 5px; border-radius: 3px; }
        </style>
    </head>
    <body>
        <h1>FF14 레이드 관리 시스템 API</h1>
        <p>백엔드 서버가 정상적으로 실행중입니다!</p>
        
        <h2>사용 가능한 API 엔드포인트:</h2>
        
        <h3>인증 관련</h3>
        <div class="endpoint">
            <span class="method">POST</span> <code>/api/accounts/register/</code> - 회원가입
        </div>
        <div class="endpoint">
            <span class="method">POST</span> <code>/api/accounts/login/</code> - 로그인
        </div>
        <div class="endpoint">
            <span class="method">POST</span> <code>/api/accounts/logout/</code> - 로그아웃
        </div>
        <div class="endpoint">
            <span class="method">GET</span> <code>/api/accounts/profile/</code> - 프로필 조회
        </div>
        
        <h3>레이드 관련</h3>
        <div class="endpoint">
            <span class="method">GET</span> <code>/api/raids/raids/</code> - 레이드 목록
        </div>
        <div class="endpoint">
            <span class="method">GET</span> <code>/api/raids/groups/</code> - 공대 목록
        </div>
        <div class="endpoint">
            <span class="method">GET</span> <code>/api/raids/jobs/</code> - 직업 목록
        </div>
        <div class="endpoint">
            <span class="method">GET</span> <code>/api/raids/items/</code> - 아이템 목록
        </div>
        
        <h3>관리자 페이지</h3>
        <div class="endpoint">
            <a href="/admin/">Django Admin 페이지</a>
        </div>
        
        <hr>
        <p><strong>참고:</strong> 프론트엔드 개발 시 CORS 설정이 되어있어 <code>http://localhost:3000</code>에서 접근 가능합니다.</p>
    </body>
    </html>
    """
    return HttpResponse(html)

urlpatterns = [
    path('', api_test_page, name='api_test'),
    path("admin/", admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/raids/', include('raids.urls')),
    path('api-auth/', include('rest_framework.urls')),
]

# 개발 환경에서 미디어 파일 제공
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)