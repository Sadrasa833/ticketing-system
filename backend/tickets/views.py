from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Ticket, TicketReply, Category
from .serializers import TicketSerializer, TicketCreateSerializer, TicketReplySerializer, CategorySerializer
from django.db.models import Q,Count
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from .models import LiveChatSession
from .serializers import LiveChatSessionSerializer


User = get_user_model()



class IsAdminOrAgent(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role in ['admin', 'agent']

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'admin'

class TicketListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TicketCreateSerializer
        return TicketSerializer

    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'admin':
            return Ticket.objects.all().order_by('-created_at')
            
        elif user.role == 'agent':
            return Ticket.objects.filter(
                Q(assigned_to=user) | Q(assigned_to__isnull=True)
            ).order_by('-created_at')
            
        return Ticket.objects.filter(created_by=user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class TicketDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TicketSerializer

    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'admin':
            return Ticket.objects.all()
            
        elif user.role == 'agent':
            return Ticket.objects.filter(
                Q(assigned_to=user) | Q(assigned_to__isnull=True)
            )
            
        return Ticket.objects.filter(created_by=user)
class TicketReplyView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        ticket = get_object_or_404(Ticket, pk=pk)
        user = request.user
        
        if user.role == 'agent':
            if ticket.assigned_to and ticket.assigned_to != user:
                return Response(
                    {'detail': 'این تیکت به پشتیبان دیگری ارجاع داده شده است و شما حق پاسخگویی ندارید.'}, 
                    status=status.HTTP_403_FORBIDDEN
                )

        serializer = TicketReplySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(author=user, ticket=ticket)
            
            if user.role in ['admin', 'agent'] and ticket.status == 'open':
                ticket.status = 'in_progress'
                ticket.save()
                
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AssignTicketView(APIView):
    permission_classes = [IsAdmin]

    def patch(self, request, pk):
        ticket = get_object_or_404(Ticket, pk=pk)
        agent_id = request.data.get('agent_id')
        from django.contrib.auth import get_user_model
        User = get_user_model()
        agent = get_object_or_404(User, pk=agent_id, role='agent')
        ticket.assigned_to = agent
        ticket.status = 'in_progress'
        ticket.save()
        return Response({'message': 'تیکت assign شد'})

class DashboardStatsView(APIView):
    permission_classes = [IsAdminOrAgent]

    def get(self, request):
        tickets = Ticket.objects.all()
        return Response({
            'total': tickets.count(),
            'open': tickets.filter(status='open').count(),
            'in_progress': tickets.filter(status='in_progress').count(),
            'resolved': tickets.filter(status='resolved').count(),
            'closed': tickets.filter(status='closed').count(),
            'high_priority': tickets.filter(priority='high').count(),
        })

class CategoryListView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]






class StartLiveChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        existing_chat = LiveChatSession.objects.filter(
            customer=request.user, status__in=['waiting', 'active']
        ).first()

        if existing_chat:
            return Response(LiveChatSessionSerializer(existing_chat).data, status=status.HTTP_200_OK)

       
        available_agents = User.objects.filter(role='agent', is_available=True).annotate(
            active_chat_count=Count('assigned_chats', filter=Q(assigned_chats__status='active'))
        ).order_by('active_chat_count')

        best_agent = available_agents.first()

        if not best_agent:
            return Response(
                {"error": "در حال حاضر هیچ پشتیبانی آنلاین نیست. لطفاً یک تیکت جدید ثبت کنید."},
                status=status.HTTP_404_NOT_FOUND
            )

        new_chat = LiveChatSession.objects.create(
            customer=request.user,
            agent=best_agent,
            status='active'
        )

        return Response(LiveChatSessionSerializer(new_chat).data, status=status.HTTP_201_CREATED)


class AgentActiveChatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role == 'customer':
            return Response({"error": "شما اجازه دسترسی ندارید."}, status=status.HTTP_403_FORBIDDEN)
        
        from django.db.models import Q
        chats = LiveChatSession.objects.filter(
            Q(agent__isnull=True) | Q(agent=request.user),
            status='active'
        ).order_by('-created_at')
        
        serializer = LiveChatSessionSerializer(chats, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)