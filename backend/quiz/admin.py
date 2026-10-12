from django.contrib import admin
from .models import Category, Topic, Question, Test, Result, ResultAnswer


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)


@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'category')
    list_filter = ('category',)
    search_fields = ('name',)


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('id', 'short_text', 'topic', 'difficulty', 'correct_option')
    list_filter = ('difficulty', 'topic__category')
    search_fields = ('text',)

    def short_text(self, obj):
        return obj.text[:50]
    short_text.short_description = 'Question'


@admin.register(Test)
class TestAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'duration_minutes', 'created_at')
    filter_horizontal = ('questions',)   # Questions select panna easy-a irukkum


@admin.register(Result)
class ResultAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'test', 'score', 'total', 'taken_at')
    list_filter = ('test',)
    search_fields = ('user__username',)


@admin.register(ResultAnswer)
class ResultAnswerAdmin(admin.ModelAdmin):
    list_display = ('id', 'result', 'question', 'selected_option', 'is_correct')
    list_filter = ('is_correct',)