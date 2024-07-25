CREATE TABLE users (
   id SERIAL PRIMARY KEY,
   firstname varchar(50) not null,
   lastname varchar(50) not null,
   password varchar(200) not null,
   email  varchar(50) UNIQUE not null,
   is_admin boolean DEFAULT false,
   is_delete boolean DEFAULT false,
   refreshToken varchar(200) DEFAULT null

);

CREATE TABLE categories (
   id SERIAL PRIMARY KEY,
   name varchar(50) not null,
   is_delete BOOLEAN DEFAULT false
);

CREATE TABLE products (
   id SERIAL PRIMARY KEY,
   name varchar(50) not null,
   price INTEGER not null,
   quantity INTEGER not null,
   image_src  varchar(100) DEFAULT null,
   category_id INTEGER ,
   is_delete boolean DEFAULT false,
   FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE comment (
   id SERIAL PRIMARY KEY,
   text varchar(200) not null,
   user_id INTEGER not null,
   product_id INTEGER NOT NULL,
   date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   is_delete BOOLEAN DEFAULT false,
   FOREIGN KEY (user_id) REFERENCES users(id),
   FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE review (
   id SERIAL PRIMARY KEY,
   user_id INTEGER not null,
   product_id INTEGER NOT NULL,
   rating INTEGER NOT NULL,
   FOREIGN KEY (user_id) REFERENCES users(id),
   FOREIGN KEY (product_id) REFERENCES products(id)
);


CREATE TABLE orders (
   id SERIAL PRIMARY KEY,
   total_amount INTEGER NOT NULL,
   user_id INTEGER NOT NULL,
   order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   order_status varchar(55) ,
   FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE order_items (
   id SERIAL PRIMARY KEY,
   number INTEGER NOT NULL,
   price INTEGER NOT NULL,
   total_price INTEGER NOT NULL,
   user_id INTEGER NOT NULL,
   product_id INTEGER NOT NULL,
   order_id INTEGER DEFAULT NULL,
   is_delete boolean DEFAULT False,
   FOREIGN KEY (user_id) REFERENCES users(id),
   FOREIGN KEY (product_id) REFERENCES products(id),
   FOREIGN KEY (order_id) REFERENCES orders(id)
);

create Table refreshToken(
    id  SERIAL PRIMARY KEY,
    value varchar(200) DEFAULT NULL
);

create Table otp(
    id  SERIAL PRIMARY KEY,
    value INTEGER DEFAULT NULL,
    expiresIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Wallet (
   id SERIAL PRIMARY KEY,
   user_id INTEGER not null,
   created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   budget INTEGER not null,
   FOREIGN KEY (user_id) REFERENCES users(id)
);


CREATE TABLE verifyToken (
    id  SERIAL PRIMARY KEY,
    value varchar(200) DEFAULT NULL
);



