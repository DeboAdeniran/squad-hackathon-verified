import { z } from 'zod';
import { ClaimType } from '../types';

export const claimSubmitSchema = z.object({
  claimantName: z.string().min(1, 'Claimant name is required'),

  policyNumber: z.string().min(1, 'Policy number is required'),

  claimType: z.enum([ClaimType.AUTO, ClaimType.HEALTH, ClaimType.PROPERTY]),

  claimedAmount: z.number().positive('Amount must be greater than ₦0'),

  incidentDate: z
    .string()
    .min(1, 'Incident date is required')
    .refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime()) && date <= new Date();
    }, 'Incident date cannot be in the future'),

  description: z.string().min(20, 'Description must be at least 20 characters'),

  photoUrls: z.array(z.string().url()).optional(),
  documentUrls: z.array(z.string().url()).optional(),
});

export type ClaimSubmitFormValues = z.infer<typeof claimSubmitSchema>;
