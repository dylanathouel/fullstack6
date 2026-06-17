CREATE DATABASE IF NOT EXISTS fullstack6;
USE fullstack6;

-- ============================================================
-- Clean re-seed: drop existing tables so the schema can be recreated.
-- (Primary/foreign keys are now CHAR(36) UUIDs, not AUTO_INCREMENT ints.)
-- ============================================================
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS activity_logs, photos, albums, comments, posts, todos, user_passwords, users;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- USERS (public profile)
-- ============================================================
CREATE TABLE users (
  id       CHAR(36)     PRIMARY KEY,
  username VARCHAR(50)  UNIQUE NOT NULL,
  name     VARCHAR(100) NOT NULL,
  email    VARCHAR(100) UNIQUE NOT NULL,
  phone    VARCHAR(30),
  website  VARCHAR(100),
  role     ENUM('user','admin') NOT NULL DEFAULT 'user',
  blocked  BOOLEAN NOT NULL DEFAULT FALSE
);

-- ============================================================
-- USER_PASSWORDS (separate table, access restricted to auth code)
-- ============================================================
CREATE TABLE user_passwords (
  user_id       CHAR(36)     PRIMARY KEY,
  password_hash VARCHAR(255) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- TODOS
-- ============================================================
CREATE TABLE todos (
  id        CHAR(36)     PRIMARY KEY,
  user_id   CHAR(36)     NOT NULL,
  title     VARCHAR(200) NOT NULL,
  completed BOOLEAN      NOT NULL DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- POSTS
-- ============================================================
CREATE TABLE posts (
  id      CHAR(36)     PRIMARY KEY,
  user_id CHAR(36)     NOT NULL,
  title   VARCHAR(200) NOT NULL,
  body    TEXT         NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- COMMENTS
-- ============================================================
CREATE TABLE comments (
  id      CHAR(36) PRIMARY KEY,
  post_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  body    TEXT NOT NULL,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- ALBUMS
-- ============================================================
CREATE TABLE albums (
  id      CHAR(36)     PRIMARY KEY,
  user_id CHAR(36)     NOT NULL,
  title   VARCHAR(200) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- PHOTOS
-- ============================================================
CREATE TABLE photos (
  id            CHAR(36)     PRIMARY KEY,
  album_id      CHAR(36)     NOT NULL,
  title         VARCHAR(200) NOT NULL,
  url           VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500) NOT NULL,
  FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE
);

-- ============================================================
-- ACTIVITY LOGS (admin)
-- ============================================================
CREATE TABLE activity_logs (
  id         CHAR(36)     PRIMARY KEY,
  user_id    CHAR(36),
  action     VARCHAR(200) NOT NULL,
  created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- SEED DATA  (UUID primary keys; new records use server/db/id.js)
-- Admin (id below): password = "qv-6J$i4bF6yv@BnTd"
-- Other users (bret, antonette, samantha, karianne): password = "password"
-- ============================================================

INSERT INTO users (id, username, name, email, phone, website, role) VALUES
  ('0c663ada-c75e-445c-831d-871f82cb9e14', 'admin', 'Admin System', 'admin@example.com', '555-0000', 'admin.local', 'admin'),
  ('07052c8b-66a6-47c1-9dd1-5d25101be3fb', 'bret', 'Leanne Graham', 'sincere@april.biz', '1-770-736-8031', 'hildegard.org', 'user'),
  ('c9d01fef-ee5a-4cf8-aae2-bec21529df20', 'antonette', 'Ervin Howell', 'shanna@melissa.tv', '010-692-6593', 'anastasia.net', 'user'),
  ('95f1b803-0510-46a1-9d04-9ac2ee05efa1', 'samantha', 'Clementine Bauch', 'nathan@yesenia.net', '1-463-123-4447', 'ramiro.info', 'user'),
  ('394d0f15-3b3e-4f14-96cc-63c2befb35c6', 'karianne', 'Patricia Lebsack', 'julianne@kory.org', '493-170-9623', 'kory.biz', 'user');

INSERT INTO user_passwords (user_id, password_hash) VALUES
  ('0c663ada-c75e-445c-831d-871f82cb9e14', '$2a$10$/baocBN4YCs76Y36euFA3eTpz0S9ekfuw/kLT4OV39r0YRNVd3Dhq'),
  ('07052c8b-66a6-47c1-9dd1-5d25101be3fb', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
  ('c9d01fef-ee5a-4cf8-aae2-bec21529df20', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
  ('95f1b803-0510-46a1-9d04-9ac2ee05efa1', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
  ('394d0f15-3b3e-4f14-96cc-63c2befb35c6', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

INSERT INTO todos (id, user_id, title, completed) VALUES
  ('7a3a5176-cf5f-45b9-9782-e41406e7b6dd', '07052c8b-66a6-47c1-9dd1-5d25101be3fb', 'delectus aut autem', FALSE),
  ('97d89a1e-4e9e-471c-a660-d0866dc2f461', '07052c8b-66a6-47c1-9dd1-5d25101be3fb', 'quis ut nam facilis et officia qui', FALSE),
  ('53379343-00c4-4e50-a188-874650259c23', '07052c8b-66a6-47c1-9dd1-5d25101be3fb', 'fugiat veniam minus', FALSE),
  ('9ef39e70-df87-47d8-863b-b1727154b9f9', '07052c8b-66a6-47c1-9dd1-5d25101be3fb', 'et porro tempora', TRUE),
  ('b83137a0-2308-47e9-9ed6-756f5f4dfd06', '07052c8b-66a6-47c1-9dd1-5d25101be3fb', 'laboriosam mollitia et enim quasi adipisci quia provident illum', FALSE),
  ('c851446d-22d9-4546-aa85-9b7dfc7da1d2', 'c9d01fef-ee5a-4cf8-aae2-bec21529df20', 'qui ullam ratione quibusdam voluptatem quia omnis', FALSE),
  ('4c6af731-a41e-4925-87bc-22bf92180d21', 'c9d01fef-ee5a-4cf8-aae2-bec21529df20', 'illo expedita consequatur quia in', TRUE),
  ('edfe8495-b7b2-4298-86bf-88603176869c', 'c9d01fef-ee5a-4cf8-aae2-bec21529df20', 'quo adipisci enim quam ut ab', TRUE),
  ('057e191a-73b6-4186-9b10-b8fbceba6b7f', '95f1b803-0510-46a1-9d04-9ac2ee05efa1', 'molestiae perspiciatis ipsa', FALSE),
  ('e5bf1d07-ccc6-4d0a-94b1-02a598669546', '95f1b803-0510-46a1-9d04-9ac2ee05efa1', 'illo est ratione doloremque quia maiores aut', TRUE),
  ('ce8a9149-9ebe-4e37-a73a-2ae454ef5aa7', '394d0f15-3b3e-4f14-96cc-63c2befb35c6', 'vero rerum temporibus dolor', TRUE),
  ('85ec6e2e-c203-4e64-b928-c79ce41a23fd', '394d0f15-3b3e-4f14-96cc-63c2befb35c6', 'in quibusdam tempore odit est dolorem', FALSE);

INSERT INTO posts (id, user_id, title, body) VALUES
  ('3a762080-c9b6-49fe-8c02-0bbd889215aa', '07052c8b-66a6-47c1-9dd1-5d25101be3fb', 'sunt aut facere repellat provident', 'quia et suscipit suscipit recusandae consequuntur'),
  ('905d4f98-7331-4790-8777-6aaae183af6c', '07052c8b-66a6-47c1-9dd1-5d25101be3fb', 'qui est esse', 'est rerum tempore vitae sequi sint nihil'),
  ('fdc9fbe9-3dbc-45a5-92eb-e246849bbe69', '07052c8b-66a6-47c1-9dd1-5d25101be3fb', 'ea molestias quasi exercitationem repellat', 'et iusto sed quo iure voluptatem occaecati'),
  ('3a42c1e4-da00-411e-aa73-1a038aae770a', 'c9d01fef-ee5a-4cf8-aae2-bec21529df20', 'eum et est occaecati', 'ullam et saepe reiciendis voluptatem adipisci'),
  ('95072c5a-8860-4c61-9c3b-c72273605ec5', 'c9d01fef-ee5a-4cf8-aae2-bec21529df20', 'nesciunt quas odio', 'repudiandae veniam quaerat sunt sed alias'),
  ('d908c6bd-e916-4cb3-9a85-304b0885c18e', '95f1b803-0510-46a1-9d04-9ac2ee05efa1', 'dolorem eum magni eos aperiam quia', 'ut aspernatur corporis harum nihil quis'),
  ('c568f3db-6980-46bb-bcc8-17f6c5bae0eb', '95f1b803-0510-46a1-9d04-9ac2ee05efa1', 'magnam facilis autem', 'dolore placeat quibusdam ea quo vitae'),
  ('f8189fc9-bd3a-46fb-8a41-fb85a7dbbcd9', '394d0f15-3b3e-4f14-96cc-63c2befb35c6', 'dolorem dolore est ipsam', 'dignissimos aperiam dolorem qui eum facilis'),
  ('ac3965ce-cb23-480a-8407-ecfb3e391b01', '394d0f15-3b3e-4f14-96cc-63c2befb35c6', 'nesciunt iure omnis dolorem tempora et accusantium', 'consectetur animi nesciunt iure');

INSERT INTO comments (id, post_id, user_id, body) VALUES
  ('748ae381-b999-4ecf-ab24-d558fdb3c1bb', '3a762080-c9b6-49fe-8c02-0bbd889215aa', 'c9d01fef-ee5a-4cf8-aae2-bec21529df20', 'laudantium enim quasi est quidem magnam voluptate'),
  ('923483cc-8a82-4070-a34a-1c3a99f23c24', '3a762080-c9b6-49fe-8c02-0bbd889215aa', '95f1b803-0510-46a1-9d04-9ac2ee05efa1', 'est natus enim nihil est dolore omnis'),
  ('d9604541-7fb3-4184-ae6a-3ed4c0ad1a76', '3a762080-c9b6-49fe-8c02-0bbd889215aa', '394d0f15-3b3e-4f14-96cc-63c2befb35c6', 'quis commodi fugit hic explicabo nihil'),
  ('77315e2b-87dd-4abc-ad93-fa2f6e3601a1', '905d4f98-7331-4790-8777-6aaae183af6c', '07052c8b-66a6-47c1-9dd1-5d25101be3fb', 'non repudiandae cupiditate vitae aliquid'),
  ('97924bd4-d783-45f5-b538-9515c344bd2e', '905d4f98-7331-4790-8777-6aaae183af6c', 'c9d01fef-ee5a-4cf8-aae2-bec21529df20', 'harum non quasi et ratione tempore iure'),
  ('012cc410-9866-4266-a2bb-010fa86cf038', 'fdc9fbe9-3dbc-45a5-92eb-e246849bbe69', '95f1b803-0510-46a1-9d04-9ac2ee05efa1', 'quia molestiae reprehenderit quasi aspernatur'),
  ('620f6115-6170-4ef9-ad9a-63d32ee04ad2', 'fdc9fbe9-3dbc-45a5-92eb-e246849bbe69', '394d0f15-3b3e-4f14-96cc-63c2befb35c6', 'tempora officiis consequuntur architecto nostrum'),
  ('a5c228e0-a64a-4282-be56-4e880cd7a164', '3a42c1e4-da00-411e-aa73-1a038aae770a', '07052c8b-66a6-47c1-9dd1-5d25101be3fb', 'illo quis nostrum accusamus eos aperiam'),
  ('495243a6-5f09-4edb-af28-2044b5a9f780', '95072c5a-8860-4c61-9c3b-c72273605ec5', 'c9d01fef-ee5a-4cf8-aae2-bec21529df20', 'provident id voluptas et blanditiis'),
  ('deb24a30-c710-4675-8c9b-3b0aead729f7', 'd908c6bd-e916-4cb3-9a85-304b0885c18e', '95f1b803-0510-46a1-9d04-9ac2ee05efa1', 'laudantium eos ut commodi ea');

INSERT INTO albums (id, user_id, title) VALUES
  ('8e6c49fe-d648-4658-92c3-d9e8752e3fd1', '07052c8b-66a6-47c1-9dd1-5d25101be3fb', 'quidem molestiae enim'),
  ('baa3e886-68d0-4109-8413-c11caf11a7a8', '07052c8b-66a6-47c1-9dd1-5d25101be3fb', 'sunt qui excepturi placeat culpa'),
  ('c7f3542e-0426-4bdd-bce1-868f0a16ec08', 'c9d01fef-ee5a-4cf8-aae2-bec21529df20', 'omnis laborum odio'),
  ('a2d0bea2-727a-43df-b634-8943dae89ef0', 'c9d01fef-ee5a-4cf8-aae2-bec21529df20', 'non esse culpa molestiae omnis sed optio'),
  ('0e445f4d-93bc-403a-bd78-f0922e6078e4', '95f1b803-0510-46a1-9d04-9ac2ee05efa1', 'eaque aut omnis a');

INSERT INTO photos (id, album_id, title, url, thumbnail_url) VALUES
  ('03a234e8-2d21-48cd-8aa1-a25cabca2901', '8e6c49fe-d648-4658-92c3-d9e8752e3fd1', 'accusamus beatae ad facilis cum similique qui sunt', 'https://via.placeholder.com/600/92c952', 'https://via.placeholder.com/150/92c952'),
  ('8a808147-e650-41b4-bbaf-a516f7d5112b', '8e6c49fe-d648-4658-92c3-d9e8752e3fd1', 'reprehenderit est deserunt velit ipsam', 'https://via.placeholder.com/600/771796', 'https://via.placeholder.com/150/771796'),
  ('1bb702fb-f95b-4b37-a7eb-6f86541bb3ea', 'baa3e886-68d0-4109-8413-c11caf11a7a8', 'officia porro iure quia iusto qui ipsa ut modi', 'https://via.placeholder.com/600/24f355', 'https://via.placeholder.com/150/24f355'),
  ('1fa26e37-322b-41a7-9f51-538d1f7ad3f0', 'c7f3542e-0426-4bdd-bce1-868f0a16ec08', 'culpa odio esse rerum omnis laboriosam voluptate repudiandae', 'https://via.placeholder.com/600/d32776', 'https://via.placeholder.com/150/d32776'),
  ('8e9febdc-df8e-4f75-9db4-918887f14f69', 'a2d0bea2-727a-43df-b634-8943dae89ef0', 'ab rerum non rerum consequatur ut ea unde', 'https://via.placeholder.com/600/f66b97', 'https://via.placeholder.com/150/f66b97'),
  ('9268ccf7-ba2a-4a35-810b-52cc77333c8c', '0e445f4d-93bc-403a-bd78-f0922e6078e4', 'laboriosam odit nam necessitatibus et illum dolores reiciendis', 'https://via.placeholder.com/600/56a8c2', 'https://via.placeholder.com/150/56a8c2');
