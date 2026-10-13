import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { quizAPI } from '../services/api';

export default function Dashboard() {
  const [tests, setTests] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [testsRes, resultsRes] = await Promise.all([
          quizAPI.getTests(),
          quizAPI.getResults(),
        ]);
        setTests(testsRes.data);
        setResults(resultsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Placement Quiz</h1>
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Dashboard
            </Link>
            <Link
              to="/leaderboard"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              🏆 Leaderboard
            </Link>
            <Link
              to="/history"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              📜 History
            </Link>
            <span className="text-gray-700 hidden md:inline">
              Hi, <strong>{user?.username}</strong> ({user?.role})
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        {/* Available Tests */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Available Tests
          </h2>
          {tests.length === 0 ? (
            <p className="text-gray-500">No tests available</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tests.map((test) => (
                <div
                  key={test.id}
                  className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {test.title}
                  </h3>
                  <p className="text-gray-600 mb-1">
                    ⏱ {test.duration_minutes} minutes
                  </p>
                  <p className="text-gray-600 mb-4">
                    📝 {test.total_questions} questions
                  </p>
                  <Link
                    to={`/quiz/${test.id}`}
                    className="block text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Start Test
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Results */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Recent Results
          </h2>
          {results.length === 0 ? (
            <p className="text-gray-500">No attempts yet</p>
          ) : (
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-700">Test</th>
                    <th className="px-4 py-3 text-left text-gray-700">Score</th>
                    <th className="px-4 py-3 text-left text-gray-700">%</th>
                    <th className="px-4 py-3 text-left text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="px-4 py-3">{r.test_title}</td>
                      <td className="px-4 py-3">
                        {r.score}/{r.total}
                      </td>
                      <td className="px-4 py-3 font-semibold text-blue-600">
                        {((r.score / r.total) * 100).toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(r.taken_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}