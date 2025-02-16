/* eslint-disable no-unused-vars */
import fs from 'fs';
import path from 'path';
import multer, { FileFilterCallback } from 'multer';
import { StatusCodes } from 'http-status-codes';
import ServerError from '../../errors/ServerError';
import { ErrorRequestHandler, Request } from 'express';
import deleteFile from '../../shared/deleteFile';
import { catchAsyncWithCallback } from '../../shared/catchAsync';

/**
 * Middleware for handling image uploads using multer.
 *
 * @param {Function} callback - A callback function to be called after the images are uploaded.
 * The callback receives the request object and an array of image URLs.
 *
 * @returns Middleware function to handle image uploads.
 *
 * @example
 * // Usage in an Express route
 * app.post('/upload', imageUploader((req, images) => {
 *   console.log('Uploaded images:', images);
 * }), (req, res) => {
 *   res.send('Images uploaded successfully');
 * });
 *
 * @throws {ServerError} If the file upload fails or if the uploaded file is not an image.
 */
const imageUploader = (
  callback: (req: Request, images: string[]) => void,
  isOptional: boolean = false,
) => {
  const baseUploadDir = path.join(process.cwd(), 'uploads');

  if (!fs.existsSync(baseUploadDir)) {
    fs.mkdirSync(baseUploadDir);
  }

  const createDir = (dirPath: string) => {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
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
      if (err)
        throw new ServerError(
          StatusCodes.BAD_REQUEST,
          err.message || 'File upload failed',
        );

      const images: string[] =
        (req.files as { images?: any })?.images?.map(
          (file: { filename: string }) => `/images/${file.filename}`,
        ) || [];

      if (!images.length) {
        if (!isOptional)
          throw new ServerError(StatusCodes.BAD_REQUEST, 'No images uploaded');

        return next();
      }

      callback(req, images);
      next();
    });
  }, imagesUploadRollback);
};

/** Middleware to ensure image rollbacks if an error occurs during the request handling */
export const imagesUploadRollback: ErrorRequestHandler = (
  err,
  req,
  _res,
  next,
) => {
  if (req.files && 'images' in req.files && Array.isArray(req.files.images))
    req.files.images.forEach(
      async ({ filename }) => await deleteFile(`/images/${filename}`),
    );

  next(err);
};

export default imageUploader;
