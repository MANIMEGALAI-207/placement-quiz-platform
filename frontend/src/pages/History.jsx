import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { quizAPI } from '../services/api';

export default function History() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    quizAPI.getResults()
      .then((res) => setResults(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = results.filter((r) => {
    if (filter === 'pass') return (r.score / r.total) * 100 >= 60;
    if (filter === 'fail') return (r.score / r.total) * 100 < 60;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading history...</p>
      </div>
    );
  }

  const stats = {
    total: results.length,
    avgScore: results.length ? (results.reduce((s, r) => s + (r.score / r.total) * 100, 0) / results.length).toFixed(1) : 0,
    best: results.length ? Math.max(...results.map((r) => (r.score / r.total) * 100)).toFixed(1) : 0,
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">📜 Test History</h1>
          <p className="text-gray-500">All your test attempts</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow text-center">
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-sm text-gray-500">Total Tests</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow text-center">
            <p className="text-3xl font-bold text-green-600">{stats.avgScore}%</p>
            <p className="text-sm text-gray-500">Average</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow text-center">
            <p className="text-3xl font-bold text-purple-600">{stats.best}%</p>
            <p className="text-sm text-gray-500">Best Score</p>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          {[
            { key: 'all', label: 'All' },
            { key: 'pass', label: '✅ Pass' },
            { key: 'fail', label: '❌ Fail' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === f.key ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl shadow text-center">
            <p className="text-gray-500">No results found</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-700">Test</th>
                  <th className="px-4 py-3 text-left text-gray-700">Score</th>
                  <th className="px-4 py-3 text-left text-gray-700">%</th>
                  <th className="px-4 py-3 text-left text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-gray-700">Date</th>
                  <th className="px-4 py-3 text-left text-gray-700"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const pct = (r.score / r.total) * 100;
                  const isPass = pct >= 60;
                  return (
                    <tr key={r.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{r.test_title}</td>
                      <td className="px-4 py-3">{r.score}/{r.total}</td>
                      <td className="px-4 py-3 font-semibold text-blue-600">{pct.toFixed(1)}%</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          isPass ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {isPass ? 'PASS' : 'FAIL'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-sm">
                        {new Date(r.taken_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`/result/${r.id}`} className="text-blue-600 hover:underline text-sm">
                          View →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Link to="/dashboard" className="block mt-6 bg-blue-600 text-white py-3 rounded-lg text-center font-bold hover:bg-blue-700 transition">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}