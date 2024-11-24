import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  splitBetween: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    share: Number
  }]
}, {
  timestamps: true
});

export const Expense = mongoose.model('Expense', expenseSchema);
