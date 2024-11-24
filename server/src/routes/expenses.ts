import express from 'express';
import { auth } from '../middleware/auth';
import { Expense } from '../models/Expense';
import { Group } from '../models/Group';

const router = express.Router();

// Create a new expense
router.post('/', auth, async (req: any, res) => {
  try {
    const group = await Group.findById(req.body.groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is a member of the group
    const isMember = group.members.some(member => 
      member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ error: 'Not a member of this group' });
    }

    const expense = new Expense({
      ...req.body,
      paidBy: req.user._id
    });
    await expense.save();

    // Emit socket event for real-time update
    req.app.get('io').to(req.body.groupId).emit('expense_added', expense);

    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ error: 'Could not create expense' });
  }
});

// Get group expenses
router.get('/group/:groupId', auth, async (req: any, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is a member of the group
    const isMember = group.members.some(member => 
      member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ error: 'Not a member of this group' });
    }

    const expenses = await Expense.find({ group: req.params.groupId })
      .populate('paidBy', 'name')
      .populate('splitBetween.user', 'name');

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch expenses' });
  }
});

// Update an expense
router.put('/:expenseId', auth, async (req: any, res) => {
  try {
    const expense = await Expense.findById(req.params.expenseId);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Check if user is the one who paid
    if (expense.paidBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the payer can edit the expense' });
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.expenseId,
      req.body,
      { new: true }
    );

    // Emit socket event for real-time update
    req.app.get('io').to(expense.group.toString()).emit('expense_updated', updatedExpense);

    res.json(updatedExpense);
  } catch (error) {
    res.status(400).json({ error: 'Could not update expense' });
  }
});

// Delete an expense
router.delete('/:expenseId', auth, async (req: any, res) => {
  try {
    const expense = await Expense.findById(req.params.expenseId);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Check if user is the one who paid
    if (expense.paidBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the payer can delete the expense' });
    }

    await expense.remove();

    // Emit socket event for real-time update
    req.app.get('io').to(expense.group.toString()).emit('expense_deleted', expense._id);

    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Could not delete expense' });
  }
});

export default router;
