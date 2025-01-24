/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
import { Request } from 'express';
import fs from 'fs';
import { StatusCodes } from 'http-status-codes';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import ApiError from '../../errors/ApiError';

// const fileUploadHandler = () => {
//   //create upload folder
//   const baseUploadDir = path.join(process.cwd(), 'uploads');
//   if (!fs.existsSync(baseUploadDir)) {
//     fs.mkdirSync(baseUploadDir);
//   }

//   //folder create for different file
//   const createDir = (dirPath: string) => {
//     if (!fs.existsSync(dirPath)) {
//       fs.mkdirSync(dirPath);
//     }
//   };

//   //create filename
//   const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       let uploadDir;
//       switch (file.fieldname) {
//         case 'image':
//           uploadDir = path.join(baseUploadDir, 'images');
//           break;
//         case 'media':
//           uploadDir = path.join(baseUploadDir, 'medias');
//           break;
//         case 'doc':
//           uploadDir = path.join(baseUploadDir, 'docs');
//           break;
//         default:
//           throw new ApiError(StatusCodes.BAD_REQUEST, 'File is not supported');
//       }
//       createDir(uploadDir);
//       cb(null, uploadDir);
//     },
//     filename: (req, file, cb) => {
//       const fileExt = path.extname(file.originalname);
//       const fileName =
//         file.originalname
//           .replace(fileExt, '')
//           .toLowerCase()
//           .split(' ')
//           .join('-') +
//         '-' +
//         Date.now();
//       cb(null, fileName + fileExt);
//     },
//   });

//   const filterFilter = (req: Request, file: any, cb: FileFilterCallback) => {
//     if (file.fieldname === 'image') {
//       // Allow all images without checking the type
//       cb(null, true);
//     } else if (file.fieldname === 'media') {
//       if (file.mimetype === 'video/mp4' || file.mimetype === 'audio/mpeg') {
//         cb(null, true);
//       } else {
//         cb(
//           new ApiError(
//             StatusCodes.BAD_REQUEST,
//             'Only .mp4, .mp3 file supported',
//           ),
//         );
//       }
//     } else if (file.fieldname === 'doc') {
//       if (file.mimetype === 'application/pdf') {
//         cb(null, true);
//       } else {
//         cb(new ApiError(StatusCodes.BAD_REQUEST, 'Only pdf supported'));
//       }
//     } else {
//       throw new ApiError(StatusCodes.BAD_REQUEST, 'This file is not supported');
//     }
//   };

//   const upload = multer({
//     storage: storage,
//     fileFilter: filterFilter,
//   }).fields([
//     { name: 'image', maxCount: 3 },
//     { name: 'media', maxCount: 3 },
//     { name: 'doc', maxCount: 3 },
//   ]);
//   return upload;
// };

// export default fileUploadHandler;

const fileUploadHandler = () => {
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
    destination: (req, file, cb) => {
      const uploadDir = path.join(
        baseUploadDir,
        file.mimetype === 'application/pdf' ? 'pdf' : 'images',
      );
      createDir(uploadDir);
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
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

  const filterFilter = (req: Request, file: any, cb: FileFilterCallback) => {
    if (
      file.mimetype.startsWith('image/') ||
      file.mimetype === 'application/pdf'
    ) {
      cb(null, true);
    } else {
      cb(
        new ApiError(
          StatusCodes.BAD_REQUEST,
          'Only images and PDFs are allowed',
        ),
      );
    }
  };

  const upload = multer({
    storage: storage,
    fileFilter: filterFilter,
  }).fields([
    { name: 'image', maxCount: 1 }, // General image field
    { name: 'nidPicture', maxCount: 3 },
    { name: 'driverLicense', maxCount: 3 },
    { name: 'routePermit', maxCount: 3 },
    { name: 'driverPicture', maxCount: 3 },
    { name: 'vehiclePicture', maxCount: 3 },
  ]);

  return upload;
};

export default fileUploadHandler;
