import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { quizAPI } from '../services/api';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function WeakTopics() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    quizAPI
      .getWeakTopics()
      .then((res) => setTopics(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading analysis...</p>
      </div>
    );
  }

  const chartData = {
    labels: topics.map((t) => t.topic),
    datasets: [
      {
        label: 'Accuracy %',
        data: topics.map((t) => t.accuracy),
        backgroundColor: topics.map((t) =>
          t.accuracy >= 70
            ? '#10b981'
            : t.accuracy >= 40
            ? '#f59e0b'
            : '#ef4444'
        ),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            📊 Weak Topic Analysis
          </h1>
          <p className="text-gray-500">
            Topic-wise performance across all your tests
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
          <Bar
            data={chartData}
            options={{
              responsive: true,
              scales: { y: { beginAtZero: true, max: 100 } },
            }}
          />
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
          <h2 className="text-xl font-bold mb-4">Topic Details</h2>
          <div className="space-y-3">
            {topics.map((t, i) => (
              <div
                key={i}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-semibold text-gray-800">{t.topic}</p>
                  <p className="text-sm text-gray-500">{t.category}</p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-xl font-bold ${
                      t.accuracy >= 70
                        ? 'text-green-600'
                        : t.accuracy >= 40
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}
                  >
                    {t.accuracy}%
                  </p>
                  <p className="text-sm text-gray-500">
                    {t.correct}/{t.total}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Link
          to="/dashboard"
          className="block bg-blue-600 text-white py-3 rounded-lg text-center font-bold hover:bg-blue-700 transition"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}