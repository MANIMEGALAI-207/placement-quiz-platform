import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { quizAPI } from '../services/api';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Result() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await quizAPI.getResultDetail(id);
        setResult(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading result...</p>
      </div>
    );
  }

  if (!result) return null;

  const percentage = ((result.score / result.total) * 100).toFixed(1);
  const isPass = percentage >= 60;

  const chartData = {
    labels: ['Correct', 'Wrong'],
    datasets: [
      {
        data: [result.score, result.total - result.score],
        backgroundColor: ['#10b981', '#ef4444'],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Score Card */}
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Test Completed!
          </h1>
          <p className="text-gray-500 mb-6">{result.test_title}</p>

          <div className="flex justify-center mb-6">
            <div className="w-48 h-48">
              <Doughnut
                data={chartData}
                options={{
                  cutout: '70%',
                  plugins: { legend: { display: false } },
                }}
              />
            </div>
          </div>

          <p className="text-5xl font-bold text-blue-600 mb-2">{percentage}%</p>
          <p className="text-xl text-gray-600 mb-4">
            Score: {result.score}/{result.total}
          </p>

          <span
            className={`inline-block px-6 py-2 rounded-full font-bold ${
              isPass
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {isPass ? '✅ PASS' : '❌ FAIL'}
          </span>

          <p className="text-gray-500 mt-4">
            Time: {Math.floor(result.time_taken_seconds / 60)}m{' '}
            {result.time_taken_seconds % 60}s
          </p>
        </div>

        {/* Answer Review */}
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Answer Review
          </h2>
          <div className="space-y-3">
            {result.answers?.map((a, i) => (
              <div
                key={i}
                className={`p-4 rounded-lg border-l-4 ${
                  a.is_correct
                    ? 'border-green-500 bg-green-50'
                    : 'border-red-500 bg-red-50'
                }`}
              >
                <p className="font-medium text-gray-800 mb-2">
                  {i + 1}. {a.question}
                </p>
                <p className="text-sm">
                  <span className="text-gray-600">Topic: {a.topic}</span>
                  <br />
                  Your: <strong>{a.selected || 'Not answered'}</strong> | Correct:{' '}
                  <strong>{a.correct}</strong>
                </p>
                {a.explanation && (
                  <p className="text-sm text-gray-600 mt-2 italic">
                    💡 {a.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <Link
            to="/dashboard"
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg text-center font-bold hover:bg-blue-700 transition"
          >
            Back to Dashboard
          </Link>
          <Link
            to="/weak-topics"
            className="flex-1 bg-purple-600 text-white py-3 rounded-lg text-center font-bold hover:bg-purple-700 transition"
          >
            View Weak Topics
          </Link>
        </div>
      </div>
    </div>
  );
}