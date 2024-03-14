create table public.users
(
    id       serial
        constraint users_pk
            primary key,
    email    varchar(120)          not null unique,
    password varchar(50)           not null unique,
    is_admin boolean default false not null
);

create table public.apps
(
    id       serial
        constraint apps_pk
            primary key,
    name    varchar(240)          not null,
    secret_token varchar(160)     not null
);

create table public.sessions
(
    user_id integer not null
        constraint sessions_users_id_fk
            references public.users (id),
    app_id integer not null
        constraint sessions_apps_id_fk
            references public.apps (id),
    device_id varchar(120)                  not null,
    login_time timestamp default now()      not null
);

grant all on schema public to simple_security;
grant all privileges on all tables in schema public TO simple_security;

grant all privileges on sequence public.users_id_seq to simple_security;
grant all privileges on sequence public.apps_id_seq to simple_security;