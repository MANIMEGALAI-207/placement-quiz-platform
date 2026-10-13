import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/quiz/leaderboard/')
      .then((res) => setLeaders(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getRankBadge = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading leaderboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-8 rounded-2xl shadow-lg mb-6 text-white">
          <h1 className="text-4xl font-bold mb-2">🏆 Leaderboard</h1>
          <p className="text-lg opacity-90">Top scorers across all tests</p>
        </div>

        {leaders.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl shadow text-center">
            <p className="text-gray-500">No scores yet. Be the first!</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {leaders.map((leader, idx) => (
              <div
                key={leader.user_id}
                className={`flex items-center p-4 border-b last:border-b-0 ${
                  idx === 0 ? 'bg-yellow-50' : idx === 1 ? 'bg-gray-50' : idx === 2 ? 'bg-orange-50' : ''
                }`}
              >
                <div className="text-3xl w-16 text-center font-bold">
                  {getRankBadge(leader.rank)}
                </div>
                <div className="flex-1 ml-4">
                  <p className="font-bold text-gray-800 text-lg">{leader.username}</p>
                  <p className="text-sm text-gray-500">{leader.test_title}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">{leader.percentage}%</p>
                  <p className="text-sm text-gray-500">{leader.score}/{leader.total}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <Link to="/dashboard" className="block mt-6 bg-blue-600 text-white py-3 rounded-lg text-center font-bold hover:bg-blue-700 transition">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}