import { Request, Response, NextFunction } from 'express'

// Logs every incoming request
export const logger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const timestamp = new Date().toLocaleTimeString()
  console.log(`[${timestamp}] ${req.method} ${req.path}`)
  next()
}