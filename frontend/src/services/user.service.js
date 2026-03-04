// User Service
import userApi from "../api/user.api";
import storage from "../utils/storage";

export const userService = {
  async getProfile() {
    const res = await userApi.getMe();
    return res.data;
  },

  async updateProfile(data) {
    const res = await userApi.updateProfile(data);
    // Mettre à jour le storage si nécessaire
    if (res.data.email) {
      storage.set("auth_email", res.data.email);
    }
    // Garder l'avatar en cache local pour mise à jour instantanée du header
    if (Object.prototype.hasOwnProperty.call(res.data, "avatarUrl")) {
      if (res.data.avatarUrl) {
        storage.set("auth_avatar", res.data.avatarUrl);
      } else {
        storage.remove("auth_avatar");
      }
    }
    return res.data;
  },

  async changePassword(data) {
    const res = await userApi.changePassword(data);
    return res.data;
  },
};
