const { resolve } = require("path");
const { readdir } = require("fs").promises;

async function readDir(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map((dirent) => {
      const res = resolve(dir, dirent.name);
      return dirent.isDirectory() ? readDir(res) : res;
    })
  );
  return Array.prototype.concat(...files);
}

export default readDir;
