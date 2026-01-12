CREATE TABLE utilisateur (
    id_utilisateur SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    mot_passe_hash TEXT NOT NULL,
    type_utilisateur VARCHAR(20) NOT NULL,
    actif BOOLEAN NOT NULL
);

CREATE TABLE association (
    id_association SERIAL PRIMARY KEY,
    date_creation_association DATE,
    nom_association VARCHAR(255) NOT NULL,
    ufr VARCHAR(100),
    statut VARCHAR(20),
    email_contact VARCHAR(255),
    insta_contact VARCHAR(255),
    tel_contact VARCHAR(20),
    id_utilisateur INT UNIQUE,
    FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur)
);

CREATE TABLE membre (
    id_membre SERIAL PRIMARY KEY,
    prenom VARCHAR(100) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    tel VARCHAR(20),
    date_adhesion DATE NOT NULL,
    statut_membre VARCHAR(50),
    date_fin_adhesion DATE,
    id_association INT NOT NULL,
    FOREIGN KEY (id_association) REFERENCES association(id_association)
);

CREATE TABLE dirigeant (
    id_dirigeant SERIAL PRIMARY KEY,
    prenom VARCHAR(100),
    nom VARCHAR(100),
    date_naissance DATE,
    mail VARCHAR(255),
    tel VARCHAR(20),
    role VARCHAR(50),
    date_debut_mandat DATE,
    date_fin_mandat DATE,
    id_association INT NOT NULL,
    FOREIGN KEY (id_association) REFERENCES association(id_association)
);

CREATE TABLE type_document (
    id_type_document SERIAL PRIMARY KEY,
    libelle VARCHAR(100) UNIQUE NOT NULL,
    obligatoire BOOLEAN NOT NULL,
    duree_validite_mois INT
);

CREATE TABLE document (
    id_document SERIAL PRIMARY KEY,
    nom_fichier VARCHAR(255) NOT NULL,
    date_depot DATE NOT NULL,
    date_expiration DATE,
    statut VARCHAR(30),
    commentaire_refus TEXT,
    id_association INT NOT NULL,
    id_type_document INT NOT NULL,
    FOREIGN KEY (id_association) REFERENCES association(id_association),
    FOREIGN KEY (id_type_document) REFERENCES type_document(id_type_document)
);

CREATE TABLE notification (
    id_notification SERIAL PRIMARY KEY,
    date_envoi DATE NOT NULL,
    sujet VARCHAR(255),
    message TEXT,
    type VARCHAR(20),
    id_association INT NOT NULL,
    FOREIGN KEY (id_association) REFERENCES association(id_association)
);
