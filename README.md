
## Project setup
To start the project, the easiest way is to run it through Docker
```bash
$ docker compose up -d
```
If you would like to run the project natively on your machine, follow the next steps:

Get a postgres db instance ready and configure its credentials in the .env file (you can copy .env.example as a starter)

## Install the required packages
```bash
$ yarn install
```

## Then compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```
