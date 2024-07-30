import { DataSource } from "typeorm";
import dotenv from "dotenv";

dotenv.config();

const entitiesPathBuild = ["dist/entities/*.js"];
const migrationsPath = ["dist/migrations/*{.js,.ts}"];

const dbSyncStatus = process.env.NODE_ENV === "development" ? true : false;

export const appDataSource = new DataSource({
  type: "mysql",
  host: 'localhost',
  port: 3306,
  username: 'grazleuser', 
  password: 'AnotherStr0ngP@ssw0rd!', 
  database: 'grazle', 
  entities: entitiesPathBuild, 
  synchronize: false, 
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
