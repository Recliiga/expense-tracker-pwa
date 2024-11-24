import React, { createContext, useContext, useState, useEffect } from 'react';
import { Group, CreateGroupData, AddMemberData } from '../types';
import { groupService } from '../services/groupService';

interface GroupContextType {
  groups: Group[];
  selectedGroup: Group | null;
  loading: boolean;
  error: string | null;
  createGroup: (data: CreateGroupData) => Promise<void>;
  addMember: (groupId: string, data: AddMemberData) => Promise<void>;
  selectGroup: (group: Group | null) => void;
  refreshGroups: () => Promise<void>;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export const useGroups = () => {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error('useGroups must be used within a GroupProvider');
  }
  return context;
};

export const GroupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshGroups = async () => {
    try {
      setLoading(true);
      const fetchedGroups = await groupService.getUserGroups();
      setGroups(fetchedGroups);
      setError(null);
    } catch (err) {
      setError('Failed to fetch groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshGroups();
  }, []);

  const createGroup = async (data: CreateGroupData) => {
    try {
      setLoading(true);
      await groupService.createGroup(data);
      await refreshGroups();
      setError(null);
    } catch (err) {
      setError('Failed to create group');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addMember = async (groupId: string, data: AddMemberData) => {
    try {
      setLoading(true);
      await groupService.addMember(groupId, data);
      await refreshGroups();
      setError(null);
    } catch (err) {
      setError('Failed to add member');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const selectGroup = (group: Group | null) => {
    setSelectedGroup(group);
  };

  const value = {
    groups,
    selectedGroup,
    loading,
    error,
    createGroup,
    addMember,
    selectGroup,
    refreshGroups
  };

  return <GroupContext.Provider value={value}>{children}</GroupContext.Provider>;
};
