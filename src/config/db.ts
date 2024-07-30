import { DataSource } from "typeorm";
import dotenv from "dotenv";

dotenv.config();

const entitiesPathBuild = ["dist/entities/*.js"];
const EntitiesPathDev = ["src/entities/*.ts"];

const entitiesPath =
  process.env.NODE_ENV === "development" ? EntitiesPathDev : entitiesPathBuild;

const migrationsPath =
  process.env.NODE_ENV === "development"
    ? ["src/migrations/*{.js,.ts}"]
    : ["dist/migrations/*{.js,.ts}"];

const dbSyncStatus = process.env.NODE_ENV === "development" ? true : false;

export const appDataSource = new DataSource({
  type: "mysql",
  host: 'localhost', // or your MySQL server host
  port: 3306, // MySQL port, default is 3306
  username: 'grazleuser', // your MySQL username
  password: 'AnotherStr0ngP@ssw0rd!', // your MySQL password
  
  database: 'grazle', // your MySQL database name
  entities : entitiesPathBuild,
  synchronize: false, // set to false in production
  logging: true,
});


console.log("Database Connection Details:", appDataSource);


appDataSource
  .initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });
