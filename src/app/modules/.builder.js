const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');

const fileTemplates = {
  route: mName => /*javascript*/ `import { Router } from 'express';
import { ${mName}Controllers } from './${mName}.controller';
import { ${mName}Validations } from './${mName}.validation';
import purifyRequest from '../../middlewares/purifyRequest';

const router = Router();

router.post(
  '/create',
  purifyRequest(${mName}Validations.create),
  ${mName}Controllers.create,
);

export const ${mName}Routes = router;`,

  interface: mName => /*javascript*/ `export type T${mName} = {};`,

  model: mName => `model ${mName} {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("${mName[0].toLowerCase()}${mName.slice(1)}s")
}
`,

  controller:
    mName => /*javascript*/ `import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../middlewares/catchAsync';
import serveResponse from '../../../util/server/serveResponse';
import { ${mName}Services } from './${mName}.service';

export const ${mName}Controllers = {
  create: catchAsync(async (req, res) => {
    const data = await ${mName}Services.create(req.body);

    serveResponse(res, {
      statusCode: StatusCodes.CREATED,
      message: '${mName} created successfully!',
      data,
    });
  }),
};`,

  service: mName => /*javascript*/ `
export const ${mName}Services = {
  async create(${mName[0].toLowerCase()}${mName.slice(1)}Data: T${mName}) {
    return ${mName}.create(${mName[0].toLowerCase()}${mName.slice(1)}Data);
  },
};`,

  validation: mName => /*javascript*/ `import { z } from 'zod';

export const ${mName}Validations = {
  create: z.object({
    body: z.object({}),
  }),
};`,

  middleware: mName => /*javascript*/ `export const ${mName}Middlewares = {};`,

  utils: () => '',

  lib: () => '',

  template: mName => /*javascript*/ `export const ${mName}Templates = {};`,

  enum: mName => /*javascript*/ `export enum E${mName} {}`,
};

inquirer
  .prompt([
    {
      type: 'input',
      name: 'moduleName',
      message: 'What is the module name?',
    },
    {
      type: 'checkbox',
      name: 'filesToCreate',
      message: 'Select files to create (default is all selected):',
      choices: [
        { name: 'Route', value: 'route', checked: true },
        { name: 'Interface', value: 'interface', checked: false },
        { name: 'Model', value: 'model', checked: true },
        { name: 'Middleware', value: 'middleware', checked: false },
        { name: 'Controller', value: 'controller', checked: true },
        { name: 'Service', value: 'service', checked: true },
        { name: 'Validation', value: 'validation', checked: true },
        { name: 'Enum', value: 'enum', checked: false },
        { name: 'Utils', value: 'utils', checked: false },
        { name: 'Lib', value: 'lib', checked: false },
        { name: 'Template', value: 'template', checked: false },
      ],
    },
  ])
  .then(answers => {
    if (!answers?.moduleName?.trim()) {
      console.log('❌ Module name is required');
      process.exit(0);
    }

    const { moduleName, filesToCreate } = answers;
    const capitalizedMName =
      moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
    const folderPath = path.resolve(__dirname, moduleName);

    try {
      if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath);

      filesToCreate.forEach(fileType => {
        const filePath = path.join(
          folderPath,
          `${capitalizedMName}.${fileType}.${fileType === 'model' ? 'prisma' : 'ts'}`,
        );

        const fileContent = fileTemplates[fileType](capitalizedMName) + '\n';

        fs.writeFileSync(filePath, fileContent);
        console.log(`Created file: ${filePath}`);
      });
    } catch (error) {
      console.error('Error creating files:', error);
    }
  });
