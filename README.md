# cool-project

## Installation

To run this project, you will need to have Docker and Docker Compose installed on your system.

This project uses env variable to configure, you should have `.env` file for certain values such as:

- **PORT= desired port**, default will be 3000 if not set
- **ACCESS_TOKEN= github access token**
- **MONGODB_URI=Mongo db uri**, default will be mongodb://mongo:27017/app-db if not set

#### Starting the Docker containers:

Run the command `docker compose up --build -d && docker compose logs -f` to start the application, if it is successfull express server will be available at `localhost:3000`, application has swagger for api documentation it is accessible through `localhost:3000/api-doc`.

If the application starts but endpoints are not responding, it might releated to line endings, try cloning again with `--config core.autocrlf=input` flag.

Run `docker compose down` for stopping the docker containers.

For local development you need to have node and npm installed, simple cd into the root of the project and do a `npm i` command.

## Tests

Application uses jest and ts-jest for unit testing, run `npm run test` for running the unit tests.

## License

This project is licensed under the MIT License.
