# 🎫 سیستم تیکتینگ پشتیبانی

## نصب و راه‌اندازی

### Backend (Django)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # ویندوز: venv\Scripts\activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend (React)

```bash
cd frontend
npm install
npm start
```

---

## ساخت کاربر با نقش‌های مختلف

از پنل ادمین Django (http://localhost:8000/admin) کاربر بساز و role را تغییر بده:
- customer → کاربر عادی
- agent → پشتیبان
- admin → ادمین

---

## API Endpoints

| Method | URL | توضیح |
|--------|-----|-------|
| POST | /api/auth/register/ | ثبت‌نام |
| POST | /api/auth/login/ | ورود |
| GET | /api/auth/me/ | اطلاعات کاربر |
| GET/POST | /api/tickets/ | لیست / ایجاد تیکت |
| GET/PATCH | /api/tickets/:id/ | جزئیات / بروزرسانی |
| POST | /api/tickets/:id/reply/ | پاسخ تیکت |
| PATCH | /api/tickets/:id/assign/ | assign به پشتیبان |
| GET | /api/dashboard/stats/ | آمار داشبورد |
| GET/POST | /api/categories/ | دسته‌بندی‌ها |
