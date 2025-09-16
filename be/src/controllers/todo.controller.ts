import { Response } from 'express';
import { z } from 'zod';
import Todo from '../models/Todo';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthedRequest } from '../middleware/auth';

const createSchema = z.object({ title: z.string().min(1) });
const updateSchema = z.object({ title: z.string().min(1).optional(), done: z.boolean().optional() });

export const list = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const todos = await Todo.find({ user: req.userId }).sort({ createdAt: -1 });
  res.json(todos);
});

export const create = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const data = createSchema.parse(req.body);
  const todo = await Todo.create({ user: req.userId, title: data.title });
  res.status(201).json(todo);
});

export const update = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const data = updateSchema.parse(req.body);
  const todo = await Todo.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    { $set: data },
    { new: true }
  );
  if (!todo) return res.status(404).json({ message: 'Not found' });
  res.json(todo);
});

export const remove = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const ok = await Todo.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!ok) return res.status(404).json({ message: 'Not found' });
  res.status(204).send();
});
