import React, { useState } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Palette as PaletteIcon,
} from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';
import { Person } from '../types';

// Predefined colors for avatars
const colorOptions = [
  '#2196F3', // Blue
  '#F44336', // Red
  '#4CAF50', // Green
  '#FF9800', // Orange
  '#9C27B0', // Purple
  '#00BCD4', // Cyan
  '#FF4081', // Pink
  '#795548', // Brown
];

interface GroupMembersProps {
  people: Person[];
  onAddPerson: (person: Person) => void;
  onUpdatePerson: (person: Person) => void;
  onDeletePerson: (personId: string) => void;
}

const GroupMembers: React.FC<GroupMembersProps> = ({
  people,
  onAddPerson,
  onUpdatePerson,
  onDeletePerson,
}) => {
  const [newName, setNewName] = useState('');
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [isEditingSelectedColor, setIsEditingSelectedColor] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleColorSelect = (color: string) => {
    if (isEditingSelectedColor) {
      setSelectedColor(color);
    } else {
      setEditColor(color);
    }
    setColorPickerOpen(false);
  };

  const handleAddPerson = () => {
    if (newName.trim()) {
      const newPerson: Person = {
        id: uuidv4(),
        name: newName.trim(),
        color: selectedColor
      };
      onAddPerson(newPerson);
      setNewName('');
      setSelectedColor(colorOptions[0]);
    }
  };

  const handleEditPerson = () => {
    if (selectedPerson && editName.trim() && onUpdatePerson) {
      const updatedPerson: Person = {
        ...selectedPerson,
        name: editName.trim(),
        color: editColor,
      };
      onUpdatePerson(updatedPerson);
      setEditDialogOpen(false);
      setSelectedPerson(null);
    }
  };

  const handleEditClick = (person: Person) => {
    setSelectedPerson(person);
    setEditName(person.name);
    setEditColor(person.color || '#000000');
    setEditDialogOpen(true);
  };

  const openColorPicker = (forNewMember: boolean) => {
    setIsEditingSelectedColor(forNewMember);
    setColorPickerOpen(true);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Group Members
      </Typography>

      <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          label="New Member Name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddPerson()}
        />
        <IconButton
          onClick={() => openColorPicker(true)}
          sx={{ bgcolor: selectedColor, '&:hover': { bgcolor: selectedColor } }}
        >
          <PaletteIcon sx={{ color: 'white' }} />
        </IconButton>
        <Button
          variant="contained"
          onClick={handleAddPerson}
          startIcon={<AddIcon />}
          disabled={!newName.trim()}
        >
          Add
        </Button>
      </Box>

      <List>
        {people.map((person) => (
          <ListItem key={person.id}>
            <ListItemAvatar>
              <Avatar
                sx={{
                  bgcolor: person.color,
                  width: 40,
                  height: 40,
                }}
              >
                {getInitials(person.name)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={person.name}
              secondary={`Member`}
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                aria-label="edit"
                onClick={() => handleEditClick(person)}
                sx={{ mr: 1 }}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => onDeletePerson(person.id)}
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      {/* Color Picker Dialog */}
      <Dialog
        open={colorPickerOpen}
        onClose={() => setColorPickerOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Choose Avatar Color</DialogTitle>
        <DialogContent>
          <Grid container spacing={1} sx={{ pt: 2 }}>
            {colorOptions.map((color) => (
              <Grid item key={color}>
                <IconButton
                  onClick={() => handleColorSelect(color)}
                  sx={{
                    bgcolor: color,
                    '&:hover': { bgcolor: color },
                    width: 56,
                    height: 56,
                    border: (theme) =>
                      color === (isEditingSelectedColor ? selectedColor : editColor)
                        ? `3px solid ${theme.palette.primary.main}`
                        : 'none',
                  }}
                >
                  {color === (isEditingSelectedColor ? selectedColor : editColor) && (
                    <PaletteIcon sx={{ color: 'white' }} />
                  )}
                </IconButton>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
      </Dialog>

      {/* Edit Person Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Edit Member</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography>Avatar Color:</Typography>
              <IconButton
                onClick={() => openColorPicker(false)}
                sx={{ bgcolor: editColor, '&:hover': { bgcolor: editColor } }}
              >
                <PaletteIcon sx={{ color: 'white' }} />
              </IconButton>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditPerson} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default GroupMembers;
