CREATE DATABASE IF NOT EXISTS fullstack6;
USE fullstack6;

-- ============================================================
-- USERS (public profile)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id       INT          PRIMARY KEY AUTO_INCREMENT,
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
CREATE TABLE IF NOT EXISTS user_passwords (
  user_id       INT         PRIMARY KEY,
  password_hash VARCHAR(255) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- TODOS
-- ============================================================
CREATE TABLE IF NOT EXISTS todos (
  id        INT          PRIMARY KEY AUTO_INCREMENT,
  user_id   INT          NOT NULL,
  title     VARCHAR(200) NOT NULL,
  completed BOOLEAN      NOT NULL DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- POSTS
-- ============================================================
CREATE TABLE IF NOT EXISTS posts (
  id      INT          PRIMARY KEY AUTO_INCREMENT,
  user_id INT          NOT NULL,
  title   VARCHAR(200) NOT NULL,
  body    TEXT         NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- COMMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS comments (
  id      INT  PRIMARY KEY AUTO_INCREMENT,
  post_id INT  NOT NULL,
  user_id INT  NOT NULL,
  body    TEXT NOT NULL,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- ALBUMS
-- ============================================================
CREATE TABLE IF NOT EXISTS albums (
  id      INT          PRIMARY KEY AUTO_INCREMENT,
  user_id INT          NOT NULL,
  title   VARCHAR(200) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- PHOTOS
-- ============================================================
CREATE TABLE IF NOT EXISTS photos (
  id            INT          PRIMARY KEY AUTO_INCREMENT,
  album_id      INT          NOT NULL,
  title         VARCHAR(200) NOT NULL,
  url           VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500) NOT NULL,
  FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE
);

-- ============================================================
-- ACTIVITY LOGS (admin)
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id         INT         PRIMARY KEY AUTO_INCREMENT,
  user_id    INT,
  action     VARCHAR(200) NOT NULL,
  created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- SEED DATA
-- All passwords are "password" hashed with bcrypt
-- Hash : $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
-- ============================================================

INSERT INTO users (username, name, email, phone, website, role) VALUES
  ('admin',   'Admin System',   'admin@example.com',  '555-0000', 'admin.local',   'admin'),
  ('bret',    'Leanne Graham',  'sincere@april.biz',  '1-770-736-8031', 'hildegard.org', 'user'),
  ('antonette','Ervin Howell',  'shanna@melissa.tv',  '010-692-6593',   'anastasia.net', 'user'),
  ('samantha', 'Clementine Bauch','nathan@yesenia.net','1-463-123-4447', 'ramiro.info',   'user'),
  ('karianne', 'Patricia Lebsack','julianne@kory.org', '493-170-9623',   'kory.biz',      'user');

-- password_hash = bcrypt("password123", 10)
INSERT INTO user_passwords (user_id, password_hash) VALUES
  (1, '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
  (2, '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
  (3, '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
  (4, '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
  (5, '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

INSERT INTO todos (user_id, title, completed) VALUES
  (2, 'delectus aut autem', FALSE),
  (2, 'quis ut nam facilis et officia qui', FALSE),
  (2, 'fugiat veniam minus', FALSE),
  (2, 'et porro tempora', TRUE),
  (2, 'laboriosam mollitia et enim quasi adipisci quia provident illum', FALSE),
  (3, 'qui ullam ratione quibusdam voluptatem quia omnis', FALSE),
  (3, 'illo expedita consequatur quia in', TRUE),
  (3, 'quo adipisci enim quam ut ab', TRUE),
  (4, 'molestiae perspiciatis ipsa', FALSE),
  (4, 'illo est ratione doloremque quia maiores aut', TRUE),
  (5, 'vero rerum temporibus dolor', TRUE),
  (5, 'in quibusdam tempore odit est dolorem', FALSE);

INSERT INTO posts (user_id, title, body) VALUES
  (2, 'sunt aut facere repellat provident', 'quia et suscipit suscipit recusandae consequuntur'),
  (2, 'qui est esse', 'est rerum tempore vitae sequi sint nihil'),
  (2, 'ea molestias quasi exercitationem repellat', 'et iusto sed quo iure voluptatem occaecati'),
  (3, 'eum et est occaecati', 'ullam et saepe reiciendis voluptatem adipisci'),
  (3, 'nesciunt quas odio', 'repudiandae veniam quaerat sunt sed alias'),
  (4, 'dolorem eum magni eos aperiam quia', 'ut aspernatur corporis harum nihil quis'),
  (4, 'magnam facilis autem', 'dolore placeat quibusdam ea quo vitae'),
  (5, 'dolorem dolore est ipsam', 'dignissimos aperiam dolorem qui eum facilis'),
  (5, 'nesciunt iure omnis dolorem tempora et accusantium', 'consectetur animi nesciunt iure');

INSERT INTO comments (post_id, user_id, body) VALUES
  (1, 3, 'laudantium enim quasi est quidem magnam voluptate'),
  (1, 4, 'est natus enim nihil est dolore omnis'),
  (1, 5, 'quis commodi fugit hic explicabo nihil'),
  (2, 2, 'non repudiandae cupiditate vitae aliquid'),
  (2, 3, 'harum non quasi et ratione tempore iure'),
  (3, 4, 'quia molestiae reprehenderit quasi aspernatur'),
  (3, 5, 'tempora officiis consequuntur architecto nostrum'),
  (4, 2, 'illo quis nostrum accusamus eos aperiam'),
  (5, 3, 'provident id voluptas et blanditiis'),
  (6, 4, 'laudantium eos ut commodi ea');

INSERT INTO albums (user_id, title) VALUES
  (2, 'quidem molestiae enim'),
  (2, 'sunt qui excepturi placeat culpa'),
  (3, 'omnis laborum odio'),
  (3, 'non esse culpa molestiae omnis sed optio'),
  (4, 'eaque aut omnis a');

INSERT INTO photos (album_id, title, url, thumbnail_url) VALUES
  (1, 'accusamus beatae ad facilis cum similique qui sunt',
     'https://via.placeholder.com/600/92c952', 'https://via.placeholder.com/150/92c952'),
  (1, 'reprehenderit est deserunt velit ipsam',
     'https://via.placeholder.com/600/771796', 'https://via.placeholder.com/150/771796'),
  (2, 'officia porro iure quia iusto qui ipsa ut modi',
     'https://via.placeholder.com/600/24f355', 'https://via.placeholder.com/150/24f355'),
  (3, 'culpa odio esse rerum omnis laboriosam voluptate repudiandae',
     'https://via.placeholder.com/600/d32776', 'https://via.placeholder.com/150/d32776'),
  (4, 'ab rerum non rerum consequatur ut ea unde',
     'https://via.placeholder.com/600/f66b97', 'https://via.placeholder.com/150/f66b97'),
  (5, 'laboriosam odit nam necessitatibus et illum dolores reiciendis',
     'https://via.placeholder.com/600/56a8c2', 'https://via.placeholder.com/150/56a8c2');
