/* eslint-disable no-unused-vars */
import fs from 'fs';
import path from 'path';
import multer, { FileFilterCallback } from 'multer';
import { StatusCodes } from 'http-status-codes';
import ServerError from '../../errors/ServerError';
import { Request, Response, NextFunction } from 'express';
import deleteFile from '../../shared/deleteFile';
import { catchAsyncWithCallback } from '../../shared/catchAsync';

/**
 * Image upload middleware using multer.
 *
 * @param {Function} callback - A function to handle uploaded images.
 * @param {boolean} [isOptional=false] - Whether image upload is optional.
 * @returns {Function} Express middleware for handling image uploads.
 */
const imageUploader = (
  callback: (req: Request, images: string[]) => void,
  isOptional: boolean = false,
) => {
  const baseUploadDir = path.join(process.cwd(), 'uploads');

  if (!fs.existsSync(baseUploadDir)) {
    fs.mkdirSync(baseUploadDir, { recursive: true });
  }

  const createDir = (dirPath: string) => {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  };

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      const uploadDir = path.join(baseUploadDir, 'images');
      createDir(uploadDir);
      cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
      const fileExt = path.extname(file.originalname);
      const fileName =
        file.originalname
          .replace(fileExt, '')
          .toLowerCase()
          .split(' ')
          .join('-') +
        '-' +
        Date.now();
      cb(null, fileName + fileExt);
    },
  });

  const fileFilter = (_req: any, file: any, cb: FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(
        new ServerError(
          StatusCodes.BAD_REQUEST,
          'Only image files are allowed',
        ),
      );
    }
  };

  const upload = multer({
    storage,
    fileFilter,
  }).fields([{ name: 'images', maxCount: 20 }]); // Allow up to 20 images

  return catchAsyncWithCallback((req, res, next) => {
    upload(req, res, err => {
      if (err) {
        throw new ServerError(
          StatusCodes.BAD_REQUEST,
          err.message || 'File upload failed',
        );
      }

      // eslint-disable-next-line no-undef
      const uploadedImages = req.files as { images?: Express.Multer.File[] };

      if (
        !uploadedImages ||
        !uploadedImages.images ||
        uploadedImages.images.length === 0
      ) {
        if (!isOptional)
          throw new ServerError(StatusCodes.BAD_REQUEST, 'No images uploaded');

        return next();
      }

      // Extract file paths
      const images: string[] = uploadedImages.images.map(
        file => `/images/${file.filename}`,
      );

      callback(req, images);
      next();
    });
  }, imagesUploadRollback);
};

/** Middleware for rolling back image uploads if an error occurs */
export const imagesUploadRollback = (
  err: any,
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (req.files && 'images' in req.files && Array.isArray(req.files.images)) {
    req.files.images.forEach(
      async ({ filename }) => await deleteFile(`/images/${filename}`),
    );
  }
  next(err);
};

export default imageUploader;
