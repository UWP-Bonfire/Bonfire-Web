// Lightweight mock API used to satisfy imports during development
// Returns promises with `{ data: ... }` to match expected shapes.

const sampleFriends = [
  { id: 1, username: "friend1", profileImage: "/Profile Images/IMG_1843.png" },
  { id: 2, username: "friend2", profileImage: "/Profile Images/IMG_1844.png" },
  { id: 3, username: "friend3", profileImage: "/Profile Images/IMG_1845.png" },
];

export function getFriends() {
  return Promise.resolve({ data: sampleFriends });
}

export function getMessages(friendId) {
  // Return empty messages by default; components can update state as needed
  return Promise.resolve({ data: [] });
}

export function sendMessage(friendId, payload) {
  // Pretend the message was sent successfully
  return Promise.resolve({ status: "ok" });
}

export function getGroups() {
  return Promise.resolve({ data: [] });
}

export function getGroupMessages(groupId) {
  return Promise.resolve({ data: [] });
}

export function sendGroupMessage(groupId, payload) {
  return Promise.resolve({ status: "ok" });
}

export function createGroup(payload) {
  return Promise.resolve({ status: "ok", data: { id: Date.now(), ...payload } });
}

export default {
  getFriends,
  getMessages,
  sendMessage,
  getGroups,
  getGroupMessages,
  sendGroupMessage,
  createGroup,
};
