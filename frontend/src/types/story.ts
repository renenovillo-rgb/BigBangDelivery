export const StoryStatus = {
  IN_REVIEW: 'EN_REVISION',
  PUBLISHED: 'PUBLICADA',
  REJECTED: 'RECHAZADA',
} as const;

export type StoryStatus = (typeof StoryStatus)[keyof typeof StoryStatus];

export interface ProductStoryRequest {
  id: string;
  storyCode: string; // Ejemplo: 'HIS-001', 'HIS-002' (Código visible en UI)
  productId: string;
  productName: string;
  sellerId: string;
  proposedStory: string; // Narrativa redactada por el vendedor
  mediaUrl?: string; // Enlace a foto o video promocional
  status: StoryStatus;
  adminFeedback?: string; // Observaciones/motivo de rechazo emitidos por el Admin
  createdAt: string;
  updatedAt?: string;
}