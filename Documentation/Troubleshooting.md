# Module not found error

If a module not found error occurs when you are trying to run meteor, even after you have
- Validated that the import path is correct
- Validated that the data you are importing is being exported from the file

If you delete the `package-lock.json` file and then run `meteor npm install` from the `HansRoslinger` directory that should fix the issue