# Common Issues

## Incorrect Node Version

Make sure you've downloaded the latest version of node as react-router requires at least `>=20.0.0`. Run `node -v` to check your version, if it is too low, uninstall node and then install from this website [https://nodejs.org/en/download](vscode-file://vscode-app/c:/Users/maxcr/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html).

# Module not found error

If a module not found error occurs when you are trying to run meteor, even after you have

- Validated that the import path is correct
- Validated that the data you are importing is being exported from the file

If you delete the `package-lock.json` file and then run `meteor npm install` from the `HansRoslinger` directory that should fix the issue

# Meteor stuck on `Extracting meteor-tool@1.4.0-1`

This issue can cause meteor to spend sometimes multiple hours extracting tools, and sometimes even then it doesn't work.

[This Github Issue describes the fix](https://github.com/meteor/meteor/issues/7688#issuecomment-360987929)

1. Update git
2. run `npx meteor uninstall`, `npm uninstall -g meteor` or `choco uninstall meteor` depending on how you initially downloaded meteor
3. check that the `%appdata%/Local/.meteor` folder is removed (press Windows Key + R and type `%appdata%` to get to this directory)
4. remove the `HansRoslinger/.meteor/local` directory
5. remove the versions-file in `HansRoslinger/.meteor`
6. remove the `HansRoslinger/node_modules` directory
7. run `npx meteor install`, `npm install -g meteor --foreground-script` or `choco install meteor` depending on how you initially downloaded meteor
8. in the `HansRoslinger` folder, run meteor npm install
9. in the `HansRoslinger` folder, run meteor
10. This should hopefully have fixed the issue
