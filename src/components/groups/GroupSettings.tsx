import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Box,
  Divider,
  MenuItem,
  Menu,
  Alert,
  Chip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useGroups } from '../../contexts/GroupContext';
import { Group, CustomCategory } from '../../types';

interface GroupSettingsProps {
  open: boolean;
  onClose: () => void;
  group: Group;
}

export const GroupSettings: React.FC<GroupSettingsProps> = ({ open, onClose, group }) => {
  const { updateGroup, removeMember, updateMemberRole, error } = useGroups();
  const [groupName, setGroupName] = useState(group.name);
  const [editingName, setEditingName] = useState(false);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');

  const handleSaveGroupName = async () => {
    if (!groupName.trim() || groupName === group.name) {
      setEditingName(false);
      return;
    }

    setLoading(true);
    try {
      await updateGroup(group._id, { name: groupName });
      setEditingName(false);
    } catch (err) {
      // Error handled by context
    } finally {
      setLoading(false);
    }
  };

  const handleMemberMenuOpen = (event: React.MouseEvent<HTMLElement>, memberId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedMemberId(memberId);
  };

  const handleMemberMenuClose = () => {
    setAnchorEl(null);
    setSelectedMemberId('');
  };

  const handleRemoveMember = async () => {
    if (!selectedMemberId) return;

    setLoading(true);
    try {
      await removeMember(group._id, selectedMemberId);
      handleMemberMenuClose();
    } catch (err) {
      // Error handled by context
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (role: 'admin' | 'member') => {
    if (!selectedMemberId) return;

    setLoading(true);
    try {
      await updateMemberRole(group._id, selectedMemberId, role);
      handleMemberMenuClose();
    } catch (err) {
      // Error handled by context
    } finally {
      setLoading(false);
    }
  };

  const isCurrentUserAdmin = group.members.some(
    member => member.user === selectedMemberId && member.role === 'admin'
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Group Settings</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>Group Name</Typography>
          {editingName ? (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                size="small"
              />
              <Button onClick={handleSaveGroupName} disabled={loading}>Save</Button>
              <Button onClick={() => setEditingName(false)}>Cancel</Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography>{group.name}</Typography>
              <IconButton size="small" onClick={() => setEditingName(true)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" gutterBottom>Members</Typography>
        <List>
          {group.members.map((member) => (
            <ListItem key={member.user}>
              <ListItemText
                primary={member.user}
                secondary={
                  <Chip
                    label={member.role}
                    size="small"
                    color={member.role === 'admin' ? 'primary' : 'default'}
                  />
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={(e) => handleMemberMenuOpen(e, member.user)}
                >
                  <MoreVertIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMemberMenuClose}
        >
          {!isCurrentUserAdmin && (
            <MenuItem onClick={() => handleUpdateRole('admin')}>
              Make Admin
            </MenuItem>
          )}
          {isCurrentUserAdmin && (
            <MenuItem onClick={() => handleUpdateRole('member')}>
              Remove Admin
            </MenuItem>
          )}
          <MenuItem
            onClick={handleRemoveMember}
            sx={{ color: 'error.main' }}
          >
            Remove from Group
          </MenuItem>
        </Menu>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
