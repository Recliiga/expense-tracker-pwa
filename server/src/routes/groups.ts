import express from 'express';
import { auth } from '../middleware/auth';
import { Group } from '../models/Group';
import { User } from '../models/User';

const router = express.Router();

// Create a new group
router.post('/', auth, async (req: any, res) => {
  try {
    const group = new Group({
      name: req.body.name,
      members: [{
        user: req.user._id,
        role: 'admin'
      }]
    });
    await group.save();

    // Add group to user's groups
    await User.findByIdAndUpdate(req.user._id, {
      $push: { groups: group._id }
    });

    res.status(201).json(group);
  } catch (error) {
    res.status(400).json({ error: 'Could not create group' });
  }
});

// Get user's groups
router.get('/', auth, async (req: any, res) => {
  try {
    await req.user.populate('groups');
    res.json(req.user.groups);
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch groups' });
  }
});

// Get group details
router.get('/:groupId', auth, async (req: any, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate('members.user', 'name email'); // Populate user details for members

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is a member
    const isMember = group.members.some(member => 
      member.user._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ error: 'Not authorized to view this group' });
    }

    res.json(group);
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch group details' });
  }
});

// Update group settings
router.patch('/:groupId', auth, async (req: any, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is admin
    const isAdmin = group.members.some(member => 
      member.user.toString() === req.user._id.toString() && 
      member.role === 'admin'
    );

    if (!isAdmin) {
      return res.status(403).json({ error: 'Only admins can update group settings' });
    }

    const allowedUpdates = ['name', 'customCategories'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid updates' });
    }

    updates.forEach(update => {
      group[update] = req.body[update];
    });

    await group.save();
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: 'Could not update group settings' });
  }
});

// Add member to group
router.post('/:groupId/members', auth, async (req: any, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is admin
    const isAdmin = group.members.some(member => 
      member.user.toString() === req.user._id.toString() && 
      member.role === 'admin'
    );

    if (!isAdmin) {
      return res.status(403).json({ error: 'Only admins can add members' });
    }

    const newMember = await User.findOne({ email: req.body.email });
    if (!newMember) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is already a member
    const isMember = group.members.some(member => 
      member.user.toString() === newMember._id.toString()
    );

    if (isMember) {
      return res.status(400).json({ error: 'User is already a member' });
    }

    group.members.push({
      user: newMember._id,
      role: req.body.role || 'member'
    });
    await group.save();

    // Add group to new member's groups
    await User.findByIdAndUpdate(newMember._id, {
      $push: { groups: group._id }
    });

    res.json(group);
  } catch (error) {
    res.status(500).json({ error: 'Could not add member' });
  }
});

// Remove member from group
router.delete('/:groupId/members/:userId', auth, async (req: any, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is admin or removing themselves
    const isAdmin = group.members.some(member => 
      member.user.toString() === req.user._id.toString() && 
      member.role === 'admin'
    );

    const isSelfRemoval = req.user._id.toString() === req.params.userId;

    if (!isAdmin && !isSelfRemoval) {
      return res.status(403).json({ error: 'Not authorized to remove members' });
    }

    // Prevent removing the last admin
    if (isAdmin && req.params.userId === req.user._id.toString()) {
      const adminCount = group.members.filter(member => member.role === 'admin').length;
      if (adminCount <= 1) {
        return res.status(400).json({ error: 'Cannot remove the last admin' });
      }
    }

    // Remove member from group
    group.members = group.members.filter(member => 
      member.user.toString() !== req.params.userId
    );
    await group.save();

    // Remove group from user's groups
    await User.findByIdAndUpdate(req.params.userId, {
      $pull: { groups: group._id }
    });

    res.json(group);
  } catch (error) {
    res.status(500).json({ error: 'Could not remove member' });
  }
});

// Update member role
router.patch('/:groupId/members/:userId', auth, async (req: any, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is admin
    const isAdmin = group.members.some(member => 
      member.user.toString() === req.user._id.toString() && 
      member.role === 'admin'
    );

    if (!isAdmin) {
      return res.status(403).json({ error: 'Only admins can update member roles' });
    }

    // Prevent removing the last admin
    if (req.body.role !== 'admin') {
      const adminCount = group.members.filter(member => member.role === 'admin').length;
      const isTargetAdmin = group.members.some(member => 
        member.user.toString() === req.params.userId && 
        member.role === 'admin'
      );
      if (adminCount <= 1 && isTargetAdmin) {
        return res.status(400).json({ error: 'Cannot remove the last admin' });
      }
    }

    // Update member role
    const memberIndex = group.members.findIndex(member => 
      member.user.toString() === req.params.userId
    );

    if (memberIndex === -1) {
      return res.status(404).json({ error: 'Member not found' });
    }

    group.members[memberIndex].role = req.body.role;
    await group.save();

    res.json(group);
  } catch (error) {
    res.status(500).json({ error: 'Could not update member role' });
  }
});

export default router;
