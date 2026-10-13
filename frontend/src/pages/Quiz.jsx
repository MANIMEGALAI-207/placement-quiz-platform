import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizAPI } from '../services/api';

export default function Quiz() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch test details
  useEffect(() => {
    const fetchTest = async () => {
      try {
        const res = await quizAPI.getTestDetail(id);
        setTest(res.data);
        setTimeLeft(res.data.duration_minutes * 60);
      } catch (err) {
        console.error(err);
        alert('Test load aagala');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [id, navigate]);

  // Timer countdown
  useEffect(() => {
    if (!test || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [test, timeLeft]);

  const handleSelect = (questionId, option) => {
    setAnswers({ ...answers, [questionId]: option });
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (!autoSubmit) {
      if (!window.confirm('Submit panna ready-a?')) return;
    }
    setSubmitting(true);
    try {
      const payload = {
        answers: Object.entries(answers).map(([qid, opt]) => ({
          question_id: parseInt(qid),
          selected_option: opt,
        })),
        time_taken_seconds: test.duration_minutes * 60 - timeLeft,
      };
      const res = await quizAPI.submitTest(id, payload);
      navigate(`/result/${res.data.result_id}`);
    } catch (err) {
      console.error(err);
      alert('Submit aagala');
      setSubmitting(false);
    }
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading test...</p>
      </div>
    );
  }

  if (!test) return null;

  const totalQuestions = test.questions.length;
  const answeredCount = Object.keys(answers).length;
  const isLowTime = timeLeft < 60;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sticky Header with Timer */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto p-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">{test.title}</h1>
            <p className="text-sm text-gray-500">
              {answeredCount}/{totalQuestions} answered
            </p>
          </div>
          <div
            className={`px-4 py-2 rounded-lg font-bold text-lg ${
              isLowTime
                ? 'bg-red-100 text-red-600 animate-pulse'
                : 'bg-blue-100 text-blue-600'
            }`}
          >
            ⏱ {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {test.questions.map((q, idx) => (
          <div key={q.id} className="bg-white p-6 rounded-xl shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Q{idx + 1}. {q.text}
              </h3>
              <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                {q.difficulty}
              </span>
            </div>

            <div className="space-y-2">
              {['A', 'B', 'C', 'D'].map((opt) => {
                const optionText = q[`option_${opt.toLowerCase()}`];
                const isSelected = answers[q.id] === opt;
                return (
                  <label
                    key={opt}
                    className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      value={opt}
                      checked={isSelected}
                      onChange={() => handleSelect(q.id, opt)}
                      className="mr-3"
                    />
                    <span className="font-medium text-gray-700 mr-2">
                      {opt}.
                    </span>
                    <span className="text-gray-800">{optionText}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}

        {/* Submit Button */}
        <div className="bg-white p-6 rounded-xl shadow sticky bottom-4">
          <button
            onClick={() => handleSubmit(false)}
            disabled={submitting}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            {submitting
              ? 'Submitting...'
              : `Submit Test (${answeredCount}/${totalQuestions})`}
          </button>
        </div>
      </div>
    </div>
  );
}