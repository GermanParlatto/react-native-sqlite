import * as SQLite from "expo-sqlite";
import { SECTION_LIST_MOCK_DATA } from "./utils";

const db = SQLite.openDatabase("little_lemon");

export async function createTable() {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          "create table if not exists menuitems (id integer primary key not null, uuid text, title text, price text, category text);",
          null,
          () => console.log("Table created OK"),
          () => console.log("Table created ERROR")
        );
      },
      reject,
      resolve
    );
  });
}

export async function getMenuItems() {
  return new Promise((resolve) => {
    db.transaction((tx) => {
      tx.executeSql("select * from menuitems", [], (_, { rows }) => {
        resolve(rows._array);
      });
    });
  });
}

export function saveMenuItems(menuItems) {
  const values = Array.from(
    { length: menuItems.length },
    () => "(?, ?, ?, ?)"
  ).join();
  // console.log("Value: ", values);
  const valuesToInsert = menuItems.map((item) => Object.values(item)).flat();
  // console.log(valuesToInsert);
  db.transaction((tx) => {
    tx.executeSql(
      `insert into menuitems (uuid, title, price, category) values ${values}`,
      valuesToInsert,
      () => console.log("Insert OK"),
      (e) => console.log("Insert ERROR: ", e)
    );
  });
}

export async function filterByQueryAndCategories(query, activeCategories) {
  const categoryPlaceHolder = activeCategories.map(() => "?").join(", ");

  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM menuitems WHERE title LIKE ? AND category IN (${categoryPlaceHolder})`,
        [`%${query}%`, ...activeCategories],
        (_, { rows }) => {
          console.log("OK Filter DB");
          resolve(rows._array);
        },
        (_, error) => {
          console.log("ERROR Filter DB");
          reject(error);
        }
      );
    });
  });
}
