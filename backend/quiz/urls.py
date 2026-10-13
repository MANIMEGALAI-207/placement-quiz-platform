from django.urls import path
from .views import (
    TestListView, TestDetailView, SubmitTestView,
    ResultListView, ResultDetailView, WeakTopicsView
)

urlpatterns = [
    path('tests/', TestListView.as_view(), name='test-list'),
    path('tests/<int:test_id>/', TestDetailView.as_view(), name='test-detail'),
    path('tests/<int:test_id>/submit/', SubmitTestView.as_view(), name='test-submit'),
    path('results/', ResultListView.as_view(), name='result-list'),
    path('results/<int:result_id>/', ResultDetailView.as_view(), name='result-detail'),
    path('weak-topics/', WeakTopicsView.as_view(), name='weak-topics'),
]