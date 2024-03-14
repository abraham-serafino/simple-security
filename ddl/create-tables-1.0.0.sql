create table public.users
(
    id       serial
        constraint users_pk
            primary key,
    email    varchar(120)          not null,
    password varchar(50)           not null,
    is_admin boolean default false not null
);

-- alter sequence users_id_seq owner to simple_security;

create table public.apps
(
    id       serial
        constraint apps_pk
            primary key,
    name    varchar(240)          not null,
    secret_token varchar(160)     not null
);
--
-- alter sequence apps_id_seq owner to simple_security;
--
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
