import api from "./api";

export const searchUsers = (query, token) => {
  return api.get(`/users/search?q=${query}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};