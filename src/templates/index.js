import { cp, readdir, readFile, writeFile, rm } from "fs/promises";
import { existsSync } from "fs";
import { confirm } from "@inquirer/prompts";

async function isDirEmptyOrNotExisting(dirname) {
  console.log("🚀 ~ isDirEmptyOrNotExisting ~ dirname:", dirname);
  return readdir(dirname)
    .then((files) => {
      console.log({ files, dirname });
    })
    .catch((error) => {
      console.log("🚀 ~ isDirEmptyOrNotExisting ~ error:", error);
      if (error.message.includes("no such file or directory")) {
        return true;
      }
      throw error;
    });
}

export default async function createFromTemplate(projectName, template) {
  const templatePath = new URL(template, import.meta.url);
  const templateExists = existsSync(templatePath);
  if (!templateExists) {
    throw new Error("Something went wrong. Selected template does not exist");
  }

  const targetPath = `${process.cwd()}/${projectName}`;
  const isTargetDirValid = await isDirEmptyOrNotExisting(targetPath);
  if (!isTargetDirValid) {
    const answer = await confirm({
      message: `Target directory ${targetPath} exists and is not empty \n Are you sure you want to override the contents?}`,
    });
    if (!answer) {
      console.log("Exiting the script...");
      process.exit(process.exitCode);
    }
    await rm(targetPath, {
      force: true,
      recursive: true,
    });
  }

  await cp(templatePath, targetPath, { recursive: true, force: true });

  const packageJsonPath = `${targetPath}/package.json`;

  const packageRawJSON = await readFile(packageJsonPath, "utf-8");
  const packageObj = JSON.parse(packageRawJSON);
  packageObj.name = projectName;

  await writeFile(packageJsonPath, JSON.stringify(packageObj, null, 2));
  return true;
  //   console.log("🚀 ~ copyFromTemplate ~ templateExists:", templateExists);
  //   await cp("");
}
