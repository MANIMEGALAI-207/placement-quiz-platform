from django.conf import settings
from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)   # Python, SQL, Aptitude

    class Meta:
        verbose_name_plural = "categories"

    def __str__(self):
        return self.name


class Topic(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='topics')
    name = models.CharField(max_length=100)                # Loops, Joins, Percentages

    def __str__(self):
        return f"{self.category.name} - {self.name}"


class Question(models.Model):
    DIFFICULTY = [('easy', 'Easy'), ('medium', 'Medium'), ('hard', 'Hard')]
    OPTIONS = [('A', 'A'), ('B', 'B'), ('C', 'C'), ('D', 'D')]

    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()
    option_a = models.CharField(max_length=300)
    option_b = models.CharField(max_length=300)
    option_c = models.CharField(max_length=300)
    option_d = models.CharField(max_length=300)
    correct_option = models.CharField(max_length=1, choices=OPTIONS)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY, default='easy')
    explanation = models.TextField(blank=True)

    def __str__(self):
        return self.text[:60]


class Test(models.Model):
    title = models.CharField(max_length=200)
    duration_minutes = models.PositiveIntegerField(default=30)
    questions = models.ManyToManyField(Question, related_name='tests')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Result(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='results')
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name='results')
    score = models.PositiveIntegerField(default=0)
    total = models.PositiveIntegerField(default=0)
    time_taken_seconds = models.PositiveIntegerField(default=0)
    taken_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.test} ({self.score}/{self.total})"


class ResultAnswer(models.Model):
    """Weak topic analysis-ku idhu romba mukkiyam"""
    result = models.ForeignKey(Result, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_option = models.CharField(max_length=1, blank=True)
    is_correct = models.BooleanField(default=False)