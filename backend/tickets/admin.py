from django.contrib import admin
from .models import Ticket, TicketReply, Category, LiveChatSession, LiveChatMessage

admin.site.register(Category)
admin.site.register(Ticket)
admin.site.register(TicketReply)

@admin.register(LiveChatSession)
class LiveChatSessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'agent', 'status', 'created_at')

@admin.register(LiveChatMessage)
class LiveChatMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'session', 'sender', 'created_at')