"""迷你版 Chinook 音乐商店数据库（教程第 1 章用的就是完整版 Chinook）。

完整版要单独下载；练习只需要几张小表，所以直接在内存里建一个。
用法和教程里的 SQLDatabase 一样：``db.run("SELECT ...")`` 返回字符串结果。
"""

from __future__ import annotations

import sqlite3

_SCHEMA = """
CREATE TABLE Artist (ArtistId INTEGER PRIMARY KEY, Name TEXT);
CREATE TABLE Album  (AlbumId INTEGER PRIMARY KEY, Title TEXT, ArtistId INTEGER);
CREATE TABLE Genre  (GenreId INTEGER PRIMARY KEY, Name TEXT);
CREATE TABLE Track  (TrackId INTEGER PRIMARY KEY, Name TEXT, AlbumId INTEGER,
                     GenreId INTEGER, Milliseconds INTEGER, UnitPrice REAL);
CREATE TABLE Customer (CustomerId INTEGER PRIMARY KEY, FirstName TEXT, LastName TEXT, Email TEXT);
CREATE TABLE Employee (EmployeeId INTEGER PRIMARY KEY, FirstName TEXT, LastName TEXT, Title TEXT);
CREATE TABLE Invoice  (InvoiceId INTEGER PRIMARY KEY, CustomerId INTEGER, InvoiceDate TEXT, Total REAL);

INSERT INTO Artist VALUES (1,'AC/DC'),(2,'Accept'),(3,'Aerosmith');
INSERT INTO Album  VALUES (1,'For Those About To Rock',1),(2,'Balls to the Wall',2),(3,'Big Ones',3);
INSERT INTO Genre  VALUES (1,'Rock'),(2,'Jazz'),(3,'Metal');
INSERT INTO Track VALUES
  (1,'For Those About To Rock',1,1,343719,0.99),
  (2,'Put The Finger On You',1,1,205662,0.99),
  (3,'Balls to the Wall',2,3,342562,0.99),
  (4,'Fast As a Shark',2,3,230619,0.99),
  (5,'Walk On Water',3,1,295680,0.99),
  (6,'Blue in Green',3,2,337000,0.99);
INSERT INTO Customer VALUES (1,'Frank','Harris','fharris@google.com'),(2,'Helena','Holy','hholy@gmail.com');
INSERT INTO Employee VALUES (1,'Andrew','Adams','General Manager'),(2,'Nancy','Edwards','Sales Manager');
INSERT INTO Invoice VALUES (1,1,'2025-01-03',3.96),(2,1,'2025-02-11',5.94),(3,2,'2025-02-20',1.98);
"""


class MiniDB:
    """一个线程安全的内存 SQLite 小封装。"""

    def __init__(self) -> None:
        self.conn = sqlite3.connect(":memory:", check_same_thread=False)
        self.conn.executescript(_SCHEMA)

    def run(self, query: str) -> str:
        cur = self.conn.execute(query)
        rows = cur.fetchall()
        self.conn.commit()
        return str(rows)

    def count(self, table: str) -> int:
        return self.conn.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]


def make_db() -> MiniDB:
    return MiniDB()
