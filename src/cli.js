import meow from "meow";
import { input, select, confirm } from "@inquirer/prompts";
import createFromTemplate from "./templates/index.js";
import { execa } from "execa";
import Listr from "listr";

const cliOptions = meow(
  `
  Usage
    @boryssey/create-starter [--init]
    @boryssey/create-starter [--template] <project-name>

  Options
    --init                      Interactive project setup
    --template, -t              Select a project template

  Templates
    --template
    --template node             Project with a node script inside (Default)
    --template ts-node          Typescript project with a node script
  `,
  {
    importMeta: import.meta,
    flags: {
      init: {
        type: "boolean",
        default: false,
        shortFlag: "i",
      },
      template: {
        type: "string",
        choices: ["node", "ts-node"],
        default: "node",
        shortFlag: "t",
      },
    },
  }
);

const isValidProjectName = (projectName) => {
  return !/[\s\/]/.test(projectName);
};

const getOptionsInteractive = async () => {
  const projectName = await input({
    message: "Enter your project name",
    required: true,
    validate: (inputText) => {
      const containsWhitespaces = !isValidProjectName(inputText);
      if (containsWhitespaces) {
        return "Project name must not contain spaces";
      }
      return true;
    },
  });

  const template = await select({
    message: "Select template",
    choices: [
      {
        name: "javascript node",
        value: "node",
      },
      {
        name: "typescript Node",
        value: "ts-node",
      },
    ],
  });

  return {
    projectName,
    template,
  };
};

const getOptions = async () => {
  let {
    input: [projectName],
    flags: { init: initFlag, template },
  } = cliOptions;

  if (initFlag) {
    const options = await getOptionsInteractive();
    projectName = options.projectName;
    template = options.template;
  }

  return {
    projectName,
    template,
  };
};

const installPackages = async (targetPath) => {
  return execa({
    cwd: targetPath,
  })`pnpm i`;
};

export default async function cli() {
  try {
    const options = await getOptions();
    if (options.projectName && !isValidProjectName(options.projectName)) {
      console.error("Project name must not contain spaces or slashes");
      process.exit(process.exitCode);
    }

    const targetPath = `${process.cwd()}/${options.projectName}`;

    const tasks = new Listr([
      {
        title: "Copying template files",
        task: () => createFromTemplate(options.projectName, options.template),
      },
      {
        title: "Installing packages",
        task: () => installPackages(targetPath),
      },
    ]);
    await tasks.run();
    const shouldOpenVsCode = await confirm({
      message: "Do you want to open a new project in VS Code?",
    });
    if (shouldOpenVsCode) {
      await execa`code ${targetPath}`;
    }
  } catch (error) {
    if (error.name === "ExitPromptError") {
      console.log("Exiting script");
      process.exit(process.exitCode);
    }
    console.error(error);
    process.exitCode = 1;
  }
}
