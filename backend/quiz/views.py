from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Count, Q
from django.db.models import Max

from .models import Test, Question, Result, ResultAnswer, Topic
from .serializers import (
    TestListSerializer, TestDetailSerializer,
    SubmitTestSerializer, ResultSerializer
)


class TestListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tests = Test.objects.all().order_by('-created_at')
        serializer = TestListSerializer(tests, many=True)
        return Response(serializer.data)


class TestDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, test_id):
        test = get_object_or_404(Test, id=test_id)
        serializer = TestDetailSerializer(test)
        return Response(serializer.data)


class SubmitTestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, test_id):
        test = get_object_or_404(Test, id=test_id)
        serializer = SubmitTestSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        answers = serializer.validated_data['answers']
        time_taken = serializer.validated_data.get('time_taken_seconds', 0)

        score = 0
        total = len(answers)

        result = Result.objects.create(
            user=request.user,
            test=test,
            total=total,
            time_taken_seconds=time_taken
        )

        for ans in answers:
            question = get_object_or_404(Question, id=ans['question_id'])
            is_correct = (question.correct_option == ans['selected_option'].upper())
            if is_correct:
                score += 1

            ResultAnswer.objects.create(
                result=result,
                question=question,
                selected_option=ans['selected_option'].upper(),
                is_correct=is_correct
            )

        result.score = score
        result.save()

        return Response({
            'message': 'Test submitted successfully',
            'result_id': result.id,
            'score': score,
            'total': total,
            'percentage': round((score / total) * 100, 2) if total else 0
        }, status=status.HTTP_201_CREATED)


class ResultListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        results = Result.objects.filter(user=request.user).order_by('-taken_at')
        serializer = ResultSerializer(results, many=True)
        return Response(serializer.data)


class ResultDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, result_id):
        result = get_object_or_404(Result, id=result_id, user=request.user)
        data = ResultSerializer(result).data

        answers = result.answers.select_related('question__topic').all()
        data['answers'] = [
            {
                'question': a.question.text,
                'topic': a.question.topic.name,
                'selected': a.selected_option,
                'correct': a.question.correct_option,
                'is_correct': a.is_correct,
                'explanation': a.question.explanation
            }
            for a in answers
        ]
        return Response(data)


class WeakTopicsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        answers = ResultAnswer.objects.filter(
            result__user=request.user
        ).select_related('question__topic', 'question__topic__category')

        topic_stats = {}
        for a in answers:
            topic = a.question.topic
            key = topic.id
            if key not in topic_stats:
                topic_stats[key] = {
                    'topic': topic.name,
                    'category': topic.category.name,
                    'total': 0,
                    'correct': 0
                }
            topic_stats[key]['total'] += 1
            if a.is_correct:
                topic_stats[key]['correct'] += 1

        weak_topics = []
        for t in topic_stats.values():
            t['accuracy'] = round((t['correct'] / t['total']) * 100, 2) if t['total'] else 0
            weak_topics.append(t)

        weak_topics.sort(key=lambda x: x['accuracy'])
        return Response(weak_topics)

class LeaderboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Top 10 users by their best score percentage
        results = Result.objects.select_related('user', 'test').all()
        
        user_best = {}
        for r in results:
            percentage = round((r.score / r.total) * 100, 2) if r.total else 0
            key = r.user.id
            if key not in user_best or percentage > user_best[key]['percentage']:
                user_best[key] = {
                    'user_id': r.user.id,
                    'username': r.user.username,
                    'test_title': r.test.title,
                    'score': r.score,
                    'total': r.total,
                    'percentage': percentage,
                    'taken_at': r.taken_at
                }
        
        leaderboard = sorted(user_best.values(), key=lambda x: x['percentage'], reverse=True)[:10]
        
        # Add rank
        for i, entry in enumerate(leaderboard, 1):
            entry['rank'] = i
        
        return Response(leaderboard)