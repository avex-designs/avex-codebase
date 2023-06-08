# Avex Codebase

## **Shopify Starter Theme**

### Getting started

1. Clone repo: `git clone <https://github.com/avex-designs/avex-codebase>`
2. Install dependencies: `npm install`
3. Change git origin URL:
    
    ```bash
    git remote set-url origin new.git.url/here
    git branch -M main
    git push -u origin main
    ```
    
4. Connect theme in Shopify admin via Github - `Themes -> Add theme -> Connect from Github`
5. Checkout to the new branch (not `main` branch) - `git checkout -b ‘dev’`
6. Run `npm start` to start the dev theme and start development.
7. Once done with changes, push to `dev` branch, open and merge PR

## Quick start and practical usage

1. Checkout to the new branch (not `main` branch)
2. Run `npm start` and start development
3. Configure [Github actions](https://www.notion.so/Avex-Codebase-ef76e83311a14704935f33e03d1f21b4?pvs=21) in order to ensure that the latest code from `src` folder is compiled and exported to `assets` folder. 
4. Make changes to your branch (`dev`) and push them. Then, go to GitHub and create a pull request. GitHub actions will ensure that webpack recompiles all source files after the merge is complete.

**For more detailed explanations and full list of features please refer to [docs](https://avex.notion.site/Avex-Codebase-ef76e83311a14704935f33e03d1f21b4?pvs=4 "docs").**