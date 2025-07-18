# Skyline CRM 🏢📋

מערכת CRM מתקדמת לניהול לידים, משתמשים, פעילויות ועסקאות בתחום הנדל"ן, מבוססת Node.js ו-PostgreSQL עם ממשק API מאובטח ומודולרי.

##  על הפרויקט
Skyline CRM פותחה ככלי ניהולי לעסקים בתחום הנדל"ן, עם דגש על עבודה מבוזרת לפי תפקידים, ניהול משתמשים, מערכת הרשאות, תיעוד פעולות, והיסטוריה של עסקאות ולידים.

##  טכנולוגיות עיקריות
- **Node.js + Express** – שרת Backend וראוטים RESTful
- **PostgreSQL** – בסיס נתונים רלציוני
- **JWT + bcrypt** – הרשאות ואבטחת מידע
- **מודולריות** – ראוט נפרד לכל ישות (`userRoutes.js`, `leadRoutes.js`, וכו’)
- **Git + GitHub** – ניהול גרסאות וניטור שינויים

## מבנה תיקיות

Skyline-CRM-RE/
├── routes/ # קבצי ראוטים לכל מודול (users, leads, activities, deals וכו’)
├── controllers/ # פונקציות הלוגיקה עבור כל ראוט
├── models/ # סכימות למסד הנתונים
├── db/ # קובץ התחברות ל-PostgreSQL
├── middleware/ # JWT, בקרת הרשאות וטיפול בשגיאות
├── .env.example # קובץ דוגמה להגדרות
├── README.md # אתה כאן
└── server.js # קובץ ראשי להרצת האפליקציה


## אבטחה והרשאות
- הרשאות לפי רמת משתמש (`admin`, `agent`, `viewer`)
- הצפנת סיסמאות באמצעות bcrypt
- שימוש ב-JWT לניהול session מאובטח
- אימות הרשאות בכל ראוט רגיש

##  הרצה מקומית
1. הרץ `npm install`
2. הגדר קובץ `.env` לפי `env.example`
3. הרץ `npm start` או `node server.js`
4. התחבר עם משתמש בעל הרשאות מתאימות

## דגשים
- המערכת כתובה לפי עקרונות Clean Code
- קלה להרחבה – ניתן להוסיף מודולים חדשים בקלות
- מבוססת על REST API נקי ומודולרי

