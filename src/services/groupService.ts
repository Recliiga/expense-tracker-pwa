import axios from 'axios';
import { Group, CreateGroupData, AddMemberData, UpdateGroupData } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export const groupService = {
  // Create a new group
  createGroup: async (data: CreateGroupData): Promise<Group> => {
    const response = await axios.post(`${API_URL}/api/groups`, data);
    return response.data;
  },

  // Get user's groups
  getUserGroups: async (): Promise<Group[]> => {
    const response = await axios.get(`${API_URL}/api/groups`);
    return response.data;
  },

  // Get group details
  getGroupDetails: async (groupId: string): Promise<Group> => {
    const response = await axios.get(`${API_URL}/api/groups/${groupId}`);
    return response.data;
  },

  // Update group settings
  updateGroup: async (groupId: string, data: UpdateGroupData): Promise<Group> => {
    const response = await axios.patch(`${API_URL}/api/groups/${groupId}`, data);
    return response.data;
  },

  // Add member to group
  addMember: async (groupId: string, data: AddMemberData): Promise<Group> => {
    const response = await axios.post(`${API_URL}/api/groups/${groupId}/members`, data);
    return response.data;
  },

  // Remove member from group
  removeMember: async (groupId: string, userId: string): Promise<Group> => {
    const response = await axios.delete(`${API_URL}/api/groups/${groupId}/members/${userId}`);
    return response.data;
  },

  // Update member role
  updateMemberRole: async (groupId: string, userId: string, role: 'admin' | 'member'): Promise<Group> => {
    const response = await axios.patch(`${API_URL}/api/groups/${groupId}/members/${userId}`, { role });
    return response.data;
  }
};
