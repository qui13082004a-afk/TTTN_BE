# TTTN_BE

## Cong nghe su dung

Du an Backend duoc phat trien dua tren cac cong nghe:

* **Runtime:** Node.js.
* **Framework:** Express 5.
* **Database:** MySQL.
* **ORM:** Sequelize.
* **Authentication:** JSON Web Token (JWT) va bcrypt.
* **Upload file:** Multer.
* **Xu ly file Excel:** xlsx.
* **Moi truong:** dotenv.
* **Development:** nodemon.

## Huong dan cai dat

1. **Cai dat cac goi phu thuoc:**

   ```bash
   npm install
   ```

2. **Tao file moi truong `.env`:**

   ```env
   PORT=10000
   DATABASE_NAME=ten_database
   DATABASE_USER=ten_tai_khoan
   DATABASE_PASSWORD=mat_khau
   DATABASE_HOST=localhost
   DATABASE_PORT=3306
   ADMIN_EMAILS=admin@example.com
   CORS_ORIGIN=*
   ```

3. **Chay server:**

   ```bash
   npm start
   ```

4. **Kiem tra server:**

   Mo trinh duyet hoac dung Postman truy cap:

   ```text
   http://localhost:10000
   ```

   Neu server hoat dong, he thong se tra ve:

   ```text
   Server is running
   ```

## Cau truc thu muc chinh

* `/src/server.js`: File khoi chay server Express, cau hinh middleware, CORS va route chinh.
* `/src/config`: Chua cau hinh ket noi database.
* `/src/api/routes`: Khai bao cac endpoint API.
* `/src/api/controllers`: Xu ly request va response cho tung chuc nang.
* `/src/api/services`: Chua logic nghiep vu cua he thong.
* `/src/api/models`: Dinh nghia cac model Sequelize.
* `/src/api/repositories`: Tang truy van va thao tac du lieu.
* `/src/api/middlewares`: Chua middleware xac thuc va upload file.
* `/uploads`: Luu tru cac file duoc upload len server.

## Cac nhom API chinh

* `/api/auth`: Dang nhap va xac thuc tai khoan.
* `/api/users`: Lay va quan ly thong tin nguoi dung.
* `/api/classes`: Quan ly lop hoc, sinh vien va nhom hoc.
* `/api/groups`: Quan ly nhom hoc.
* `/api/group-join`: Xu ly tham gia nhom.
* `/api/group-show`: Hien thi thong tin nhom.
* `/api/group-change-requests`: Quan ly yeu cau chuyen nhom.
* `/api/move`: Chuyen sinh vien giua cac nhom.
* `/api/kick`: Xoa sinh vien khoi nhom.
* `/api/dashboard`: Du lieu bang dieu khien cho giang vien.
* `/api/calendar`: Quan ly lich lam viec va su kien.
* `/api/student-home`: Du lieu trang chu sinh vien.
* `/api/student-dashboard`: Du lieu bang dieu khien sinh vien.
* `/api/student-profile`: Thong tin ca nhan sinh vien.
* `/api/student-schedule`: Lich hoc va lich lam viec cua sinh vien.
* `/api/student-courses`: Danh sach hoc phan cua sinh vien.
* `/api/workspace`: Quan ly workspace va cong viec.
* `/api/lecturer-tasks`: Quan ly cong viec cua giang vien.

