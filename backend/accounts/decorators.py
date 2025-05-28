from django.views.decorators.csrf import csrf_exempt

def method_decorator_csrf_exempt(view_class):
    """클래스 기반 뷰에 csrf_exempt 적용"""
    view_class.dispatch = csrf_exempt(view_class.dispatch)
    return view_class