# 🎫 سیستم تیکتینگ پشتیبانی (Helpdesk Ticketing System)

یک سیستم پشتیبانی و تیکتینگ کامل (Full-stack) با معماری اصولی، طراحی شده برای مدیریت درخواست‌های کاربران با سه سطح دسترسی مجزا.

## 🛠 تکنولوژی‌های استفاده شده
* **Backend:** Django, Django REST Framework, SQLite
* **Frontend:** React, Tailwind CSS, Vite
* **Authentication:** JWT (JSON Web Tokens)

## 👥 سطوح دسترسی (Roles)
این سیستم دارای سه سطح کاربری ایزوله است:
1. **کاربر عادی (Customer):** ثبت تیکت جدید و مشاهده وضعیت/پاسخ‌های تیکت‌های خود.
2. **پشتیبان (Agent):** مشاهده تیکت‌های ارجاع داده شده یا بدون مسئول، تغییر وضعیت و ثبت پاسخ.
3. **ادمین (Admin):** دسترسی کامل به سیستم، مشاهده داشبورد آماری، و ارجاع (Assign) تیکت‌ها به پشتیبان‌های مختلف.

---

## 🚀 نصب و راه‌اندازی پروژه‌

### 1️⃣ راه‌اندازی Backend (Django)

ابتدا وارد پوشه بک‌اند شوید و محیط مجازی را بسازید:
```bash
cd backend
python -m venv venv
venv\Scripts\activate
```

سپس پکیج‌ها را نصب کرده و دیتابیس را آماده کنید:
```bash
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
```

یک کاربر ارشد (Superuser) بسازید و سرور را اجرا کنید:
```bash
python manage.py createsuperuser
python manage.py runserver
```

### 2️⃣ راه‌اندازی Frontend (React)

یک ترمینال جدید باز کنید، وارد پوشه فرانت‌اند شوید و سرور ریکت را اجرا کنید:
```bash
cd frontend
npm install
npm run dev
```

---

## ⚙️ مدیریت نقش‌های کاربران

پس از ساخت کاربر ارشد، از طریق پنل ادمین جنگو (`http://localhost:8000/admin`) وارد شوید. در بخش Users، می‌توانید کاربران جدید بسازید و فیلد **Role** آن‌ها را به یکی از مقادیر زیر تغییر دهید:
* `customer` (پیش‌فرض)
* `agent`
* `admin`

---

## 🔌 لیست API Endpoints

| Method | URL | توضیحات |
| :--- | :--- | :--- |
| **POST** | `/api/auth/register/` | ثبت‌نام کاربر جدید |
| **POST** | `/api/auth/login/` | ورود و دریافت توکن JWT |
| **GET** | `/api/auth/me/` | دریافت اطلاعات کاربری (پروفایل) |
| **GET/POST** | `/api/tickets/` | دریافت لیست تیکت‌ها / ایجاد تیکت جدید |
| **GET/PATCH**| `/api/tickets/:id/` | دریافت جزئیات یک تیکت / بروزرسانی وضعیت |
| **POST** | `/api/tickets/:id/reply/` | ثبت پاسخ جدید برای تیکت |
| **PATCH** | `/api/tickets/:id/assign/` | ارجاع تیکت به یک پشتیبان (فقط ادمین) |
| **GET** | `/api/dashboard/stats/` | دریافت آمار کلی برای داشبورد (فقط ادمین) |
| **GET/POST** | `/api/categories/` | مدیریت دسته‌بندی‌های تیکت |
