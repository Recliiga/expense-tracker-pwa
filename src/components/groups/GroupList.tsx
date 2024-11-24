import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Button,
  Box,
  Paper,
  Skeleton,
  Chip
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useGroups } from '../../contexts/GroupContext';
import { CreateGroupDialog } from './CreateGroupDialog';
import { AddMemberDialog } from './AddMemberDialog';

export const GroupList: React.FC = () => {
  const { groups, loading, error, selectedGroup, selectGroup } = useGroups();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');

  const handleAddMember = (groupId: string) => {
    setSelectedGroupId(groupId);
    setAddMemberDialogOpen(true);
  };

  if (loading) {
    return (
      <Paper sx={{ p: 2 }}>
        <Skeleton variant="text" height={40} />
        <Skeleton variant="rectangular" height={200} />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography color="error">{error}</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Your Groups</Typography>
        <Button
          variant="contained"
          onClick={() => setCreateDialogOpen(true)}
          size="small"
        >
          Create Group
        </Button>
      </Box>

      {groups.length === 0 ? (
        <Typography color="textSecondary" align="center">
          You haven't joined any groups yet
        </Typography>
      ) : (
        <List>
          {groups.map((group) => (
            <ListItem
              key={group._id}
              button
              selected={selectedGroup?._id === group._id}
              onClick={() => selectGroup(group)}
            >
              <ListItemText
                primary={group.name}
                secondary={`${group.members.length} members`}
              />
              <ListItemSecondaryAction>
                {group.members.find(m => m.role === 'admin')?.user === group._id && (
                  <IconButton
                    edge="end"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddMember(group._id);
                    }}
                  >
                    <PersonAddIcon />
                  </IconButton>
                )}
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      <CreateGroupDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />

      <AddMemberDialog
        open={addMemberDialogOpen}
        onClose={() => setAddMemberDialogOpen(false)}
        groupId={selectedGroupId}
      />
    </Paper>
  );
};
