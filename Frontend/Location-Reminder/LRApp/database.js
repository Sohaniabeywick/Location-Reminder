import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabase("lrapp.db");

export const setupDatabase = () => {
  db.transaction((tx) => {
    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS location (id INTEGER PRIMARY KEY AUTOINCREMENT, category TEXT);"
    );
  });
};

export const addLocation = (name) => {
  db.transaction(
    (tx) => {
        tx.executeSql("INSERT INTO location (category) VALUES (?);", [name]);
    },
    null,
    () => console.log("Location added successfully")
  );
};



export const getAllLocation = (callback) => {
  db.transaction((tx) => {
    tx.executeSql('SELECT * FROM location;', [], (_, { rows }) => {
      const locationsData = rows._array;
      callback(locationsData);
    });
  });
};


export const searchLocationByName = (searchName, callback) => {
  console.log(searchName);
  db.transaction((tx) => {
    tx.executeSql(
      'SELECT * FROM location WHERE category LIKE ?;',
      [`%${searchName}%`],
      (_, { rows }) => {
        const result = rows._array;
        console.log("Results",result);
        callback(result);
      }
    );
  });
};
