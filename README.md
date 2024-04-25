# thirst-alert-be

This repo consists of a Express.js server, which handles authentication of users and storing sensor data in a MongoDB instance.

## Get started with local development

### Requirements

- Node - version `21.5`
- Docker

### Instructions

1. Clone the repo
2. Create a `.env` file in the root of the project, fill it with the environment variables listed in the `.env.template` file
3. `npm i` to install dependencies
4. `npm run pre-dev` to start a mongo instance in a docker container (be aware that on one out of two of our machines, this command sometimes fails with this error: `Error: ENOSYS: function not implemented, fstat`. Running the command again seems to work. I couldn't find any solution to this issue)

The following commands are to be ran in a new terminal window

5. Optionally, run `npm run db:seed` to insert some test data in the db
6. `npm run dev` to start the Express server in dev mode

## API Documentation

https://veil-mochi-901.notion.site/API-Documentation-511851ab652d43c3b78f546358ab4c0a?pvs=4