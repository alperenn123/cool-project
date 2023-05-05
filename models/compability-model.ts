import mongoose from 'mongoose';
import { CompatibilityData } from '../controllers/compability';

interface CompatibilityDataDocument
  extends mongoose.Document,
    CompatibilityData {}

const compatibilityDataSchema = new mongoose.Schema<CompatibilityData>({
  languages: { type: Object, of: Number, required: true },
  repoCount: { type: Number, required: true },
  totalSize: { type: Number, required: true },
  user: { type: String, required: true },
  org: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const CompatibilityDataModel = mongoose.model<CompatibilityDataDocument>(
  'CompatibilityData',
  compatibilityDataSchema,
);
