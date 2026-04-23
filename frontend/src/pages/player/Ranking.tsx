import { motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { ArrowLeft, Trophy, Medal, Award, Users } from 'lucide-react';
import { useAuth } from '@/context';
import PlayerHeaderActions from '@/components/player/PlayerHeaderActions';
import userApi from '@/api/user/user.api';
import type { SoloLeaderboardEntryDTO, TeamLeaderboardEntryDTO } from '@/api/types/api.types';

export default function Ranking() {
  const navigate = useNavigate();
  const location = useLocation();
  const { playerProfile } = useAuth();
  const currentPlayerName = playerProfile?.name ?? '';
  const navState = (location.state || {}) as {
    initialTab?: 'SOLO' | 'TEAM';
    focusRoomCode?: string;
    focusTeamName?: string;
  };
  const [selectedTab, setSelectedTab] = useState<'SOLO' | 'TEAM'>('SOLO');
  const [soloRows, setSoloRows] = useState<SoloLeaderboardEntryDTO[]>([]);
  const [teamRows, setTeamRows] = useState<TeamLeaderboardEntryDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const normalizedFocusRoomCode = String(navState.focusRoomCode || '').trim().toUpperCase();
  const normalizedFocusTeamName = String(navState.focusTeamName || '').trim().toLowerCase();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([userApi.getSoloLeaderboard(), userApi.getTeamLeaderboard()])
      .then(([soloRes, teamRes]) => {
        if (cancelled) return;
        setSoloRows(Array.isArray(soloRes.data) ? soloRes.data : []);
        setTeamRows(Array.isArray(teamRes.data) ? teamRes.data : []);
      })
      .catch(() => {
        if (cancelled) return;
        setSoloRows([]);
        setTeamRows([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const normalizedSolo = useMemo(
    () => soloRows.map((row, index) => ({ ...row, rank: index + 1 })),
    [soloRows]
  );
  const normalizedTeam = useMemo(
    () => teamRows.map((row, index) => ({ ...row, rank: index + 1 })),
    [teamRows]
  );

  useEffect(() => {
    if (navState.initialTab === 'TEAM') {
      setSelectedTab('TEAM');
    }
  }, [navState.initialTab]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <span className="text-2xl">🥇</span>;
    if (rank === 2) return <span className="text-2xl">🥈</span>;
    if (rank === 3) return <span className="text-2xl">🥉</span>;
    return <span className="text-lg font-bold text-slate-300 w-8 text-center">#{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-x-hidden">
      <div className="pointer-events-none absolute -top-20 -left-20 w-72 h-72 rounded-full bg-fuchsia-600/30 blur-3xl" />
      <div className="pointer-events-none absolute top-24 -right-20 w-72 h-72 rounded-full bg-cyan-500/30 blur-3xl" />
      <header className="sticky top-0 z-30 bg-slate-950/75 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/player/dashboard')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </motion.button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Classement</h1>
                <p className="text-sm text-slate-300">Top Solo et Équipe</p>
              </div>
            </div>
          </div>
          <PlayerHeaderActions />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-6 mb-8 border border-indigo-200/70 text-white bg-gradient-to-r from-indigo-700 via-violet-700 to-cyan-600"
        >
          <h2 className="text-2xl font-extrabold mb-1">Classement Premium</h2>
          <p className="text-white/85 text-sm">Positionnement compétitif en solo et en équipe.</p>
        </motion.div>
        <div className="mb-5 inline-flex rounded-xl border border-white/20 bg-white/5 p-1">
          <button
            type="button"
            onClick={() => setSelectedTab('SOLO')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${
              selectedTab === 'SOLO' ? 'bg-fuchsia-600 text-white' : 'text-slate-200 hover:bg-white/10'
            }`}
          >
            Solo
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab('TEAM')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${
              selectedTab === 'TEAM' ? 'bg-fuchsia-600 text-white' : 'text-slate-200 hover:bg-white/10'
            }`}
          >
            Équipe
          </button>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 rounded-2xl border border-white/15 overflow-hidden backdrop-blur-xl"
        >
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 text-white">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Medal className="w-5 h-5" />
              {selectedTab === 'SOLO' ? 'Top Solo' : 'Top Équipes'}
            </h2>
            <p className="text-white/90 text-sm">
              {selectedTab === 'SOLO'
                ? 'Classement par score total joueur'
                : "Classement global des équipes (sessions collectives)"}
            </p>
          </div>

          {loading ? (
            <div className="px-6 py-6 text-slate-300">Chargement du classement...</div>
          ) : selectedTab === 'SOLO' ? (
            <ul className="divide-y divide-white/10">
              {normalizedSolo.map((player, index) => {
                const name = player.displayName?.trim() || `Joueur ${player.userId}`;
                const isCurrentUser = name === currentPlayerName;
                return (
                  <motion.li
                    key={`${player.userId}-${player.rank}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center gap-4 px-6 py-4 transition-colors ${
                      isCurrentUser ? 'bg-emerald-500/20 border-l-4 border-emerald-400' : 'hover:bg-white/10'
                    }`}
                  >
                    <div className="w-12 flex justify-center">{getRankIcon(player.rank)}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-white truncate ${isCurrentUser ? 'text-emerald-200' : ''}`}>
                        {name}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs font-normal text-emerald-100 bg-emerald-500/40 px-2 py-0.5 rounded-full">
                            Toi
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-slate-300">Niveau {player.level ?? 1}</p>
                    </div>
                    <div className="flex items-center gap-2 text-right">
                      <Award className="w-5 h-5 text-amber-500" />
                      <span className="font-bold text-white">{(player.totalScore ?? 0).toLocaleString()}</span>
                      <span className="text-sm text-slate-300">pts</span>
                    </div>
                  </motion.li>
                );
              })}
              {normalizedSolo.length === 0 && (
                <li className="px-6 py-6 text-slate-300">Aucun score solo disponible.</li>
              )}
            </ul>
          ) : (
            <ul className="divide-y divide-white/10">
              {normalizedTeam.map((team, index) => (
                (() => {
                  const isFocusedTeam =
                    (normalizedFocusRoomCode && String(team.roomCode || '').trim().toUpperCase() === normalizedFocusRoomCode) ||
                    (normalizedFocusTeamName && String(team.teamName || '').trim().toLowerCase() === normalizedFocusTeamName);
                  return (
                <motion.li
                  key={`${team.roomCode}-${team.rank}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-4 px-6 py-4 transition-colors ${
                    isFocusedTeam ? 'bg-emerald-500/20 border-l-4 border-emerald-300' : 'hover:bg-white/10'
                  }`}
                >
                  <div className="w-12 flex justify-center">{getRankIcon(team.rank)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">
                      {team.teamName || `Equipe ${team.roomCode}`}
                      {isFocusedTeam && (
                        <span className="ml-2 text-xs font-normal text-emerald-100 bg-emerald-500/40 px-2 py-0.5 rounded-full">
                          Ton équipe
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-slate-300 inline-flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {team.playersCount} joueur(s) • {team.sessionsCount} session(s)
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <Award className="w-5 h-5 text-amber-500" />
                      <span className="font-bold text-white">{(team.totalScore ?? 0).toLocaleString()} pts</span>
                    </div>
                    <p className="text-xs text-slate-300">Moyenne {Math.round(team.averageScore ?? 0)} pts</p>
                  </div>
                </motion.li>
                  );
                })()
              ))}
              {normalizedTeam.length === 0 && (
                <li className="px-6 py-6 text-slate-300">Aucun score équipe disponible.</li>
              )}
            </ul>
          )}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center text-sm text-slate-300"
        >
          Le classement se met à jour automatiquement après chaque session terminée.
        </motion.p>
      </div>
    </div>
  );
}
