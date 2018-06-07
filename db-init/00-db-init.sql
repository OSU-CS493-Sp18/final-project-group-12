/* initialize beer, breweries, and distributors */
DROP DATABASE IF EXISTS beerapi;

CREATE DATABASE beerapi;

USE beerapi;


CREATE TABLE breweries(
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    zip INT NOT NULL,
    phone VARCHAR(15) NOT NULL,

    PRIMARY KEY (id)
);

CREATE TABLE beer(
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    style VARCHAR(24) NOT NULL,
    abv FLOAT NULL,
    ibu FLOAT NULL,
    description TEXT NULL,
    image LONGBLOB NULL,
    brewerid INT NOT NULL,

    FOREIGN KEY (brewerid) REFERENCES breweries(id)
        ON DELETE CASCADE,

    PRIMARY KEY (id)
);

CREATE TABLE distributors(
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    zip INT NOT NULL,
    ownerid CHAR(24) NOT NULL,


    PRIMARY KEY (id)
);

CREATE TABLE beerDistributors(
    beerid INT NOT NULL,
    distributorid INT NOT NULL,

    PRIMARY KEY (beerid, distributorid)
);
