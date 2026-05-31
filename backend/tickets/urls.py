from django.urls import path
from .views import TicketListCreateView, TicketDetailView, TicketReplyView, AssignTicketView, DashboardStatsView, CategoryListView

urlpatterns = [
    path('tickets/', TicketListCreateView.as_view()),
    path('tickets/<int:pk>/', TicketDetailView.as_view()),
    path('tickets/<int:pk>/reply/', TicketReplyView.as_view()),
    path('tickets/<int:pk>/assign/', AssignTicketView.as_view()),
    path('dashboard/stats/', DashboardStatsView.as_view()),
    path('categories/', CategoryListView.as_view()),
]
