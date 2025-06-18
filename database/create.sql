/*
DROP TABLE IF EXISTS
           aerosales.discount,
           aerosales.review,
           aerosales.favorite,
           aerosales.purchase,
           aerosales.trip,
           aerosales.contact_detail,
           aerosales.auth_data,
           aerosales."user",
           aerosales.airport,
           aerosales.airline,
           aerosales.city
CASCADE;

DROP TYPE IF EXISTS
          aerosales.purchase_status,
          aerosales.user_role;

DROP SCHEMA IF EXISTS aerosales;
*/

CREATE SCHEMA IF NOT EXISTS aerosales;

CREATE TABLE aerosales.city (
    id SERIAL,
    name VARCHAR(100) NOT NULL,
    timezone VARCHAR(50) NOT NULL,
    CONSTRAINT city_pk PRIMARY KEY (id)
);

CREATE TABLE aerosales.airline (
    id SERIAL,
    name VARCHAR(100) NOT NULL,
    logo_url VARCHAR(2048),
    CONSTRAINT airline_pk PRIMARY KEY (id)
);

CREATE TABLE aerosales.airport (
    id SERIAL,
    city INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,

    CONSTRAINT airport_pk PRIMARY KEY (id),
    CONSTRAINT airport_city_fk FOREIGN KEY (city) REFERENCES aerosales.city(id),
    CONSTRAINT airport_city_name_unique UNIQUE (city, name)
);

CREATE TYPE aerosales.user_role AS ENUM ('admin', 'user');

CREATE TABLE aerosales."user" (
    id SERIAL,
    surname VARCHAR(50) NOT NULL,
    firstname VARCHAR(50) NOT NULL,
    lastname VARCHAR(50),
    birth_date DATE NOT NULL,
    role aerosales.user_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT user_pk PRIMARY KEY (id)
);

CREATE TABLE aerosales.auth_data (
    user_id INTEGER,
    login VARCHAR(64) UNIQUE NOT NULL,
    password VARCHAR(256) NOT NULL,

    CONSTRAINT auth_data_pk PRIMARY KEY (user_id),
    CONSTRAINT auth_data_user_fk FOREIGN KEY (user_id) REFERENCES aerosales."user"(id) ON DELETE CASCADE
);

CREATE TABLE aerosales.contact_detail (
    user_id INTEGER,
    email VARCHAR(128) UNIQUE NOT NULL,
    phone VARCHAR(32) UNIQUE,

    CONSTRAINT contact_detail_pk PRIMARY KEY (user_id),
    CONSTRAINT contact_detail_user_fk FOREIGN KEY (user_id) REFERENCES aerosales."user"(id) ON DELETE CASCADE
);

CREATE TABLE aerosales.trip (
    id SERIAL,
    departure_airport INTEGER NOT NULL,
    arrival_airport INTEGER NOT NULL,
    departure_date TIMESTAMPTZ NOT NULL,
    arrival_date TIMESTAMPTZ NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    available_seats INTEGER NOT NULL,
    airline INTEGER NOT NULL,

    CONSTRAINT trip_pk PRIMARY KEY (id),
    CONSTRAINT trip_departure_aiport_fk FOREIGN KEY (departure_airport) REFERENCES aerosales.airport(id),
    CONSTRAINT trip_arrival_airport_fk FOREIGN KEY (arrival_airport) REFERENCES aerosales.airport(id),
    CONSTRAINT trip_airline_fk FOREIGN KEY (airline) REFERENCES aerosales.airline(id),
    CONSTRAINT trip_available_seats_check CHECK (available_seats >= 0)
);

CREATE TYPE aerosales.purchase_status AS ENUM ('paid', 'refunded', 'canceled');

CREATE TABLE aerosales.purchase (
    id SERIAL,
    user_id INTEGER NOT NULL,
    trip_id INTEGER NOT NULL,
    number_of_seats INTEGER NOT NULL DEFAULT 1,
    purchase_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    status aerosales.purchase_status NOT NULL DEFAULT 'paid',

    CONSTRAINT purchase_pk PRIMARY KEY (id),
    CONSTRAINT purchase_user_fk FOREIGN KEY (user_id) REFERENCES aerosales."user"(id) ON DELETE CASCADE,
    CONSTRAINT purchase_trip_fk FOREIGN KEY (trip_id) REFERENCES aerosales.trip(id) ON DELETE CASCADE
);

CREATE TABLE aerosales.favorite (
    user_id INTEGER NOT NULL,
    trip_id INTEGER NOT NULL,
    saved_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT favorite_pk PRIMARY KEY (user_id, trip_id),
    CONSTRAINT favorite_user_fk FOREIGN KEY (user_id) REFERENCES aerosales."user"(id) ON DELETE CASCADE,
    CONSTRAINT favorite_trip_fk FOREIGN KEY (trip_id) REFERENCES aerosales.trip(id) ON DELETE CASCADE
);

CREATE TABLE aerosales.review (
    id SERIAL,
    user_id INTEGER NOT NULL,
    trip_id INTEGER NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT review_pk PRIMARY KEY (id),
    CONSTRAINT review_user_fk FOREIGN KEY (user_id) REFERENCES aerosales."user"(id) ON DELETE CASCADE,
    CONSTRAINT review_trip_fk FOREIGN KEY (trip_id) REFERENCES aerosales.trip(id) ON DELETE CASCADE,
    CONSTRAINT review_rating_check CHECK (rating BETWEEN 1 AND 5)
);

CREATE TABLE aerosales.discount (
    id SERIAL,
    trip_id INTEGER NOT NULL,
    percentage INTEGER NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT discount_pk PRIMARY KEY (id),
    CONSTRAINT discount_trip_fk FOREIGN KEY (trip_id) REFERENCES aerosales.trip(id) ON DELETE CASCADE,
    CONSTRAINT discount_percentage_check CHECK (percentage > 0 AND percentage <= 100)
);