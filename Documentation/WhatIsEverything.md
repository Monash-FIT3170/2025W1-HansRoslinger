

# Task files

task file is a runner tool that allows you to create easier and reusable commands, instead of having to type the same set of instructions over and over.

The aim of Task is that whenever you are typing the same command over and over, you should instead be using task.

## Install Steps
**1. install task**
```
npm install -g @go-task/cli
```

**2. add task to system variables**
Close and reopen your vscode and run `task` in the terminal. If it works, great! Otherwise try the step below

run the following command to get the location of your bin directory for NPM
- make sure this path is in your Environment Variables
```
PS C:\Git Repos\2025W1-HansRoslinger\HansRoslinger> npm prefix -g
C:\Users\maxcr\AppData\Roaming\npm
```