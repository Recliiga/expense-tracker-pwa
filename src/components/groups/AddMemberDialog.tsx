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

interface AddMemberDialogProps {
  open: boolean;
  onClose: () => void;
  groupId: string;
}

export const AddMemberDialog: React.FC<AddMemberDialogProps> = ({ open, onClose, groupId }) => {
  const { addMember, error } = useGroups();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      await addMember(groupId, { email });
      setEmail('');
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
        <DialogTitle>Add Member to Group</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            autoFocus
            margin="dense"
            label="Member Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Adding...' : 'Add Member'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
