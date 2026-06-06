from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'^ws/live-chat/(?P<session_id>\w+)/$', consumers.LiveChatConsumer.as_asgi()),
]