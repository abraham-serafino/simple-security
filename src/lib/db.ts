import { Pool } from "pg"

let pool: Pool | null = null

export default function db() {
    const {
        SIMPLESECURITY_DB_HOST: host,
        SIMPLESECURITY_DB_PORT: port,
        SIMPLESECURITY_DB_NAME: database,
        SIMPLESECURITY_DB_PW: password,
        SIMPLESECURITY_DB_USERNAME: user
    } = process.env as unknown as {
        SIMPLESECURITY_DB_HOST: string
        SIMPLESECURITY_DB_PORT: number
        SIMPLESECURITY_DB_NAME: string
        SIMPLESECURITY_DB_PW: string
        SIMPLESECURITY_DB_USERNAME: string
    }

    if (pool === null) {
        pool = new Pool({ user, password, host, database, port })
    }

    return pool
}
