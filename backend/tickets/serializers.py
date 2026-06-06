from rest_framework import serializers
from .models import Ticket, TicketReply, Category
from accounts.serializers import UserSerializer
from .models import LiveChatSession, LiveChatMessage

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

class TicketReplySerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = TicketReply
        fields = ['id', 'author', 'message', 'created_at']

class TicketSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    assigned_to = UserSerializer(read_only=True)
    replies = TicketReplySerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Ticket
        fields = ['id', 'title', 'description', 'priority', 'status', 'category', 'category_name', 'created_by', 'assigned_to', 'replies', 'created_at', 'updated_at']

class TicketCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ['title', 'description', 'priority', 'category']



class LiveChatMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True)
    
    class Meta:
        model = LiveChatMessage
        fields = ['id', 'sender_name', 'message', 'created_at']

class LiveChatSessionSerializer(serializers.ModelSerializer):
    messages = LiveChatMessageSerializer(many=True, read_only=True)
    agent_name = serializers.CharField(source='agent.username', read_only=True, default="نامشخص")
    customer_name = serializers.CharField(source='customer.username', read_only=True)

    class Meta:
        model = LiveChatSession
        fields = ['id', 'customer', 'customer_name', 'agent', 'agent_name', 'status', 'messages', 'created_at']