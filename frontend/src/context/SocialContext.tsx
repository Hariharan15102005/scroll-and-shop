import React, { createContext, useContext, useState, useEffect } from 'react';
import { Friend, FriendRequest } from '../types';
import { socialApi } from '../services/api';
import { useAuth } from './AuthContext';

interface SocialContextType {
  friends: Friend[];
  pendingRequests: FriendRequest[];
  sentRequests: FriendRequest[];
  suggestedFriends: Friend[];
  isLoading: boolean;
  refreshSocial: () => Promise<void>;
  sendFriendRequest: (targetUserId: number) => Promise<void>;
  acceptFriendRequest: (requestId: number) => Promise<void>;
  rejectFriendRequest: (requestId: number) => Promise<void>;
  cancelFriendRequest: (requestId: number) => Promise<void>;
  removeFriend: (friendId: number) => Promise<void>;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export const SocialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [suggestedFriends, setSuggestedFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshSocial = async () => {
    if (!isAuthenticated) {
      setFriends([]);
      setPendingRequests([]);
      setSentRequests([]);
      setSuggestedFriends([]);
      return;
    }
    try {
      setIsLoading(true);
      const [friendsList, requestsList, sentList, suggestedList] = await Promise.all([
        socialApi.getFriends(),
        socialApi.getPendingRequests(),
        socialApi.getSentRequests(),
        socialApi.getSuggestedFriends(),
      ]);
      setFriends(friendsList);
      setPendingRequests(requestsList);
      setSentRequests(sentList);
      setSuggestedFriends(suggestedList);
    } catch (err) {
      console.warn('Failed to load social data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshSocial();
  }, [isAuthenticated]);

  const sendFriendRequest = async (targetUserId: number) => {
    await socialApi.sendRequest(targetUserId);
    await refreshSocial();
  };

  const acceptFriendRequest = async (requestId: number) => {
    await socialApi.acceptRequest(requestId);
    await refreshSocial();
  };

  const rejectFriendRequest = async (requestId: number) => {
    await socialApi.rejectRequest(requestId);
    await refreshSocial();
  };

  const cancelFriendRequest = async (requestId: number) => {
    await socialApi.cancelRequest(requestId);
    await refreshSocial();
  };

  const removeFriend = async (friendId: number) => {
    await socialApi.removeFriend(friendId);
    await refreshSocial();
  };

  return (
    <SocialContext.Provider
      value={{
        friends,
        pendingRequests,
        sentRequests,
        suggestedFriends,
        isLoading,
        refreshSocial,
        sendFriendRequest,
        acceptFriendRequest,
        rejectFriendRequest,
        cancelFriendRequest,
        removeFriend,
      }}
    >
      {children}
    </SocialContext.Provider>
  );
};

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (!context) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
};

