import type { Express } from 'express';
import { StatusCodes } from 'http-status-codes';
import { GridFsStorage } from 'multer-gridfs-storage';
import multer, { FileFilterCallback } from 'multer';
import ServerError from '../../errors/ServerError';
import catchAsync from './catchAsync';
import config from '../../config';
import { errorLogger, logger } from '../../util/logger/logger';
import colors from 'colors';
import { json } from '../../util/transform/json';
import { getBucket } from '../../util/server/connectDB';
import path from 'path';

export const fileValidators = {
  images: {
    validator: /^image\//,
  },
  videos: {
    validator: /^video\//,
  },
  audios: {
    validator: /^audio\//,
  },
  documents: {
    validator: /(pdf|word|excel|text)/,
  },
  any: {
    validator: /.*/,
  },
};

export const fileTypes = Object.keys(
  fileValidators,
) as (keyof typeof fileValidators)[];

interface UploadFields {
  [field: string]: {
    default?: string | string[] | null;
    maxCount?: number;
    size?: number;
    fileType: (typeof fileTypes)[number];
  };
}

/**
 * Universal file uploader middleware
 */
const capture = (fields: UploadFields) =>
  catchAsync(async (req, res, next) => {
    req.tempFiles ??= [];

    try {
      await new Promise<void>((resolve, reject) =>
        upload(fields)(req, res, err => (err ? reject(err) : resolve())),
      );

      const files = req.files as { [field: string]: Express.Multer.File[] };

      Object.keys(fields).forEach(field => {
        if (files?.[field]?.length) {
          const uploadedFiles = files[field].map(
            file => `/${fields[field].fileType}/${file.filename}`,
          );

          req.body[field] =
            (fields[field]?.maxCount || 1) > 1
              ? uploadedFiles
              : uploadedFiles[0];

          //! for cleanup
          req.tempFiles.push(...uploadedFiles);
        }
      });
    } catch (error) {
      errorLogger.error(error);

      Object.keys(fields).forEach(field => {
        req.body[field] = fields[field].default;
      });
    } finally {
      if (req.body?.data) {
        Object.assign(req.body, json(req.body.data));
        delete req.body.data;
      }

      next();
    }
  });

export default capture;

/**
 * Universal file retriever
 */
export const fileRetriever = catchAsync(async (req, res) => {
  if (!getBucket())
    throw new ServerError(
      StatusCodes.SERVICE_UNAVAILABLE,
      'Files not available',
    );

  const filename = req.params.filename.replace(/[^\w.-]/g, '');
  const fileExists = await getBucket()!.find({ filename }).hasNext();
  if (!fileExists)
    throw new ServerError(StatusCodes.NOT_FOUND, 'File not found');

  return new Promise((resolve, reject) => {
    const stream = getBucket()!
      .openDownloadStreamByName(filename)
      .on('error', () =>
        reject(new ServerError(StatusCodes.NOT_FOUND, 'Stream error')),
      )
      .pipe(res)
      .on('finish', resolve);

    res.on('close', () => stream.destroy());
  });
});

/**
 * Delete file from GridFS
 */
export const deleteFile = async (filename: string) => {
  filename = path.basename(filename);

  try {
    if (!getBucket()) return;

    logger.info(colors.yellow(`🗑️ Deleting file: '${filename}'`));

    const result = await Promise.all(
      (await getBucket()!.find({ filename }).toArray()).map(({ _id }) =>
        getBucket()!.delete(_id),
      ),
    );

    if (result.length)
      logger.info(colors.green(`✔ file '${filename}' deleted successfully!`));
    else logger.info(colors.red(`❌ file '${filename}' not deleted!`));

    return result;
  } catch (error: any) {
    errorLogger.error(
      colors.red(`❌ file '${filename}' not deleted!`),
      error?.stack ?? error,
    );
  }
};

const storage = new GridFsStorage({
  url: config.url.database,
  file: (req, { originalname }) => ({
    filename: `${originalname
      .replace(/\..+$/, '')
      .replace(/[^\w]+/g, '-')
      .toLowerCase()}-${Date.now()}${originalname.match(/\.[a-z0-9]+$/i) ?? ''}`,
    bucketName: 'files',
    metadata: {
      uploadedBy: req?.user?.id?.oid ?? null,
      originalName: originalname,
    },
  }),
});

const fileFilter =
  (fields: UploadFields) =>
  (_: any, file: Express.Multer.File, cb: FileFilterCallback) => {
    const fieldType = Object.keys(fields)
      .find(f => file.fieldname === f)
      ?.toLowerCase();
    const fileType = fields[fieldType!]?.fileType;

    const mime = file.mimetype.toLowerCase();

    if (fileValidators[fileType]?.validator.test(mime)) return cb(null, true);

    cb(
      new ServerError(
        StatusCodes.BAD_REQUEST,
        `${file.originalname} is not a valid ${fileType} file`,
      ),
    );
  };

const upload = (fields: UploadFields) =>
  multer({ storage, fileFilter: fileFilter(fields) }).fields(
    Object.keys(fields).map(field => ({
      name: field,
      maxCount: fields[field].maxCount || undefined,
      size: (fields[field].size || 5) * 1024 * 1024,
    })),
  );
