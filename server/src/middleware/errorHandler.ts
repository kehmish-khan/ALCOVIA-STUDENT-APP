import { Request, Response, NextFunction } from 'express'

// Catches any unhandled errors
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Unhandled error:', err.message)
  res.status(500).json({ error: 'Internal server error' })
} 
