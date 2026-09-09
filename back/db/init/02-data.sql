SET NAMES utf8mb4;

INSERT INTO topics (title, description) VALUES
    ('Java', 'Le langage Java, la JVM et son écosystème (Spring, Jakarta EE, Quarkus...).'),
    ('JavaScript', 'Le langage du web, côté navigateur comme côté serveur.'),
    ('TypeScript', 'JavaScript typé : outillage, patterns et bonnes pratiques.'),
    ('Angular', 'Le framework front-end Angular : composants, RxJS, routing.'),
    ('Python', 'Python et son écosystème : scripting, data, web.'),
    ('DevOps', 'CI/CD, conteneurs, orchestration et observabilité.'),
    ('Base de données', 'SQL, NoSQL, modélisation et optimisation des requêtes.'),
    ('Sécurité', 'Authentification, chiffrement, OWASP et bonnes pratiques.')
ON DUPLICATE KEY UPDATE description = VALUES(description);

