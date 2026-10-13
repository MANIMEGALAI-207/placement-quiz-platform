from rest_framework import serializers
from .models import Category, Topic, Question, Test, Result, ResultAnswer


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name')


class TopicSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Topic
        fields = ('id', 'name', 'category', 'category_name')


class QuestionSerializer(serializers.ModelSerializer):
    """Student-ku answer kaataama, options mattum"""
    class Meta:
        model = Question
        fields = ('id', 'text', 'option_a', 'option_b', 'option_c', 'option_d', 'difficulty')


class QuestionAdminSerializer(serializers.ModelSerializer):
    """Admin-ku full details (correct answer + explanation)"""
    class Meta:
        model = Question
        fields = '__all__'


class TestListSerializer(serializers.ModelSerializer):
    total_questions = serializers.SerializerMethodField()

    class Meta:
        model = Test
        fields = ('id', 'title', 'duration_minutes', 'total_questions', 'created_at')

    def get_total_questions(self, obj):
        return obj.questions.count()


class TestDetailSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Test
        fields = ('id', 'title', 'duration_minutes', 'questions')


class SubmitAnswerSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    selected_option = serializers.CharField(max_length=1)


class SubmitTestSerializer(serializers.Serializer):
    answers = SubmitAnswerSerializer(many=True)
    time_taken_seconds = serializers.IntegerField(default=0)


class ResultAnswerSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.text', read_only=True)
    topic_name = serializers.CharField(source='question.topic.name', read_only=True)

    class Meta:
        model = ResultAnswer
        fields = ('id', 'question', 'question_text', 'topic_name', 'selected_option', 'is_correct')


class ResultSerializer(serializers.ModelSerializer):
    test_title = serializers.CharField(source='test.title', read_only=True)

    class Meta:
        model = Result
        fields = ('id', 'test', 'test_title', 'score', 'total', 'time_taken_seconds', 'taken_at')