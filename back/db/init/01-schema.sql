SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Table : users

CREATE TABLE IF NOT EXISTS users (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    email       VARCHAR(255) NOT NULL,
    username    VARCHAR(100) NOT NULL,
    password    VARCHAR(255) NOT NULL,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT uq_users_username UNIQUE (username)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Table : topics (thèmes / sujets)

CREATE TABLE IF NOT EXISTS topics (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    title       VARCHAR(100) NOT NULL,
    description VARCHAR(500)     NULL,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_topics PRIMARY KEY (id),
    CONSTRAINT uq_topics_title UNIQUE (title)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Table : articles
-- FK : author_id -> users.id, topic_id -> topics.id

CREATE TABLE IF NOT EXISTS articles (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    title       VARCHAR(255) NOT NULL,
    content     TEXT         NOT NULL,
    author_id   BIGINT       NOT NULL,
    topic_id    BIGINT       NOT NULL,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_articles PRIMARY KEY (id),
    CONSTRAINT fk_articles_author
        FOREIGN KEY (author_id) REFERENCES users (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_articles_topic
        FOREIGN KEY (topic_id) REFERENCES topics (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_articles_author (author_id),
    INDEX idx_articles_topic (topic_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Table : comments
-- FK : author_id -> users.id, article_id -> articles.id

CREATE TABLE IF NOT EXISTS comments (
    id          BIGINT   NOT NULL AUTO_INCREMENT,
    content     TEXT     NOT NULL,
    author_id   BIGINT   NOT NULL,
    article_id  BIGINT   NOT NULL,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_comments PRIMARY KEY (id),
    CONSTRAINT fk_comments_author
        FOREIGN KEY (author_id) REFERENCES users (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_comments_article
        FOREIGN KEY (article_id) REFERENCES articles (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_comments_author (author_id),
    INDEX idx_comments_article (article_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Table de jointure : user_topic (abonnement ManyToMany users <-> topics)
-- Clé primaire composite (user_id, topic_id) pour empêcher les doublons.

CREATE TABLE IF NOT EXISTS user_topic (
    user_id       BIGINT   NOT NULL,
    topic_id      BIGINT   NOT NULL,
    subscribed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_user_topic PRIMARY KEY (user_id, topic_id),
    CONSTRAINT fk_user_topic_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_user_topic_topic
        FOREIGN KEY (topic_id) REFERENCES topics (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_user_topic_topic (topic_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

