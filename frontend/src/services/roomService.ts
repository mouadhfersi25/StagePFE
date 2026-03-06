/**
 * Service statique (mock) pour les rooms en mode équipe.
 * Les joueurs rejoignent via un code ou un lien.
 * Données en localStorage pour simuler plusieurs onglets / appareils.
 * Plus tard : remplacer par WebSocket (Socket.io, etc.).
 */

const ROOM_KEY = 'edugame_room_';

export interface RoomPlayer {
  id: string;
  name: string;
  avatar: string;
  age?: number;
  ready: boolean;
  isHost: boolean;
}

export interface Room {
  gameId: string;
  players: RoomPlayer[];
  createdAt: number;
  startedAt?: number;
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export function createRoom(gameId: string, player: { id: string; name: string; avatar?: string; age?: number }): string {
  const code = generateCode();
  const room: Room = {
    gameId,
    players: [
      {
        id: player.id,
        name: player.name,
        avatar: player.avatar ?? '👤',
        age: player.age,
        ready: false,
        isHost: true,
      },
    ],
    createdAt: Date.now(),
  };
  try {
    localStorage.setItem(ROOM_KEY + code, JSON.stringify(room));
  } catch (_) {}
  return code;
}

export function getRoom(code: string): Room | null {
  if (!code) return null;
  try {
    const raw = localStorage.getItem(ROOM_KEY + code.toUpperCase());
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function joinRoom(code: string, player: { id: string; name: string; avatar?: string; age?: number }): Room | null {
  const room = getRoom(code);
  if (!room) return null;
  const exists = room.players.some((p) => p.id === player.id);
  if (!exists) {
    room.players.push({
      id: player.id,
      name: player.name,
      avatar: player.avatar ?? '👤',
      age: player.age,
      ready: false,
      isHost: false,
    });
    try {
      localStorage.setItem(ROOM_KEY + code.toUpperCase(), JSON.stringify(room));
    } catch (_) {}
  }
  return room;
}

export function setPlayerReady(code: string, playerId: string, ready: boolean): Room | null {
  const room = getRoom(code);
  if (!room) return null;
  const p = room.players.find((x) => x.id === playerId);
  if (p) p.ready = ready;
  try {
    localStorage.setItem(ROOM_KEY + code.toUpperCase(), JSON.stringify(room));
  } catch (_) {}
  return room;
}

export function setRoomStarted(code: string): void {
  const room = getRoom(code);
  if (!room) return;
  room.startedAt = Date.now();
  try {
    localStorage.setItem(ROOM_KEY + code.toUpperCase(), JSON.stringify(room));
  } catch (_) {}
}

/** Lien de partage pour rejoindre la room (à afficher / copier). */
export function getShareLink(gameId: string, roomCode: string): string {
  if (typeof window === 'undefined') return '';
  const path = `/player/waiting-room/${gameId}?room=${roomCode}`;
  return window.location.origin + path;
}
