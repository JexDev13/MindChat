import apiClient from './client';

export interface UserInfo {
  userId: string;
  fullName: string;
  email: string;
  profilePictureUrl: string | null;
}

// Cache for user info to avoid repeated API calls
const userInfoCache = new Map<string, UserInfo>();

export const usersService = {
  // Get user info by ID
  getById: async (userId: string): Promise<UserInfo> => {
    // Check cache first
    const cached = userInfoCache.get(userId);
    if (cached) return cached;

    const response = await apiClient.get(`/api/auth/users/${userId}`);
    const userInfo = response.data as UserInfo;
    
    // Cache the result
    userInfoCache.set(userId, userInfo);
    return userInfo;
  },

  // Get multiple users by IDs (batch request)
  getByIds: async (userIds: string[]): Promise<UserInfo[]> => {
    if (userIds.length === 0) return [];

    // Filter out already cached IDs
    const uncachedIds = userIds.filter(id => !userInfoCache.has(id));
    
    // If all are cached, return from cache
    if (uncachedIds.length === 0) {
      return userIds.map(id => userInfoCache.get(id)!);
    }

    // Fetch uncached users
    const response = await apiClient.get(`/api/auth/users/batch?userIds=${uncachedIds.join(',')}`);
    const users = response.data as UserInfo[];
    
    // Cache the results
    users.forEach(user => userInfoCache.set(user.userId, user));
    
    // Return all requested users from cache (now complete)
    return userIds.map(id => userInfoCache.get(id)).filter((u): u is UserInfo => u !== undefined);
  },

  // Clear cache (useful when user updates their profile)
  clearCache: () => {
    userInfoCache.clear();
  }
};
