import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert
} from '@mui/material';
import { useGroups } from '../../contexts/GroupContext';

interface CreateGroupDialogProps {
  open: boolean;
  onClose: () => void;
}

export const CreateGroupDialog: React.FC<CreateGroupDialogProps> = ({ open, onClose }) => {
  const { createGroup, error } = useGroups();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await createGroup({ name });
      setName('');
      onClose();
    } catch (err) {
      // Error is handled by context
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Create New Group</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            autoFocus
            margin="dense"
            label="Group Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Creating...' : 'Create Group'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
