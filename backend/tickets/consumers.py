import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import LiveChatSession, LiveChatMessage
from django.contrib.auth import get_user_model

User = get_user_model()

class LiveChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.session_id = self.scope['url_route']['kwargs']['session_id']
        self.room_group_name = f'livechat_{self.session_id}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']
        user_id = data['user_id']

        msg = await self.save_message(user_id, self.session_id, message)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': msg.message,
                'sender': msg.sender.username,
                'created_at': msg.created_at.isoformat()
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'sender': event['sender'],
            'created_at': event['created_at']
        }))

    @database_sync_to_async
    def save_message(self, user_id, session_id, message):
        user = User.objects.get(id=user_id)
        session = LiveChatSession.objects.get(id=session_id)
        return LiveChatMessage.objects.create(session=session, sender=user, message=message)