import { readdirSync as readDir, statSync as getFileStats } from "fs"
import express from "express"

const port = process.env.SIMPLESECURITY_PORT

type expressMethodName = "get" | "put" | "post" | "delete"

const getRouteNameAndHandlers = ({
    topLevelFolder = "",
    path = "",
    currentPath = "",
    folderName = "",
    fileName = "",
    moduleName = ""
}) => {
    let handlers = null
    let routeName = ""

    const lowerCaseFileName = fileName.toLowerCase()
    const folderRoutePath = `${path}/${folderName}`.replace(
        topLevelFolder,
        ""
    )
    const fileRoutePath =
        `${currentPath}/${fileName.replace(/\..*/, "")}`.replace(
            topLevelFolder,
            ""
        )

    if (
        lowerCaseFileName === `api.js` ||
        lowerCaseFileName === `${folderName}.api.js`
    ) {
        routeName = folderRoutePath
        handlers = require(moduleName)
    } else if (lowerCaseFileName.endsWith(".api.js")) {
        routeName = fileRoutePath
        handlers = require(moduleName)
    } else {
        for (const requestMethod of ["get", "post", "put", "delete"]) {
            if (
                lowerCaseFileName === `${requestMethod}.js` ||
                lowerCaseFileName ===
                    `${folderName}.${requestMethod}.js`
            ) {
                routeName = folderRoutePath
                handlers = {
                    [requestMethod]: require(moduleName).default
                }
            } else if (
                lowerCaseFileName.endsWith(`.${requestMethod}.js`)
            ) {
                routeName = fileRoutePath
                handlers = {
                    [requestMethod]: require(moduleName).default
                }
            }
        }
    }

    return { routeName, handlers }
}

export default (topLevelFolder = "./dist") => {
    const expressApp = express()

    const traverseFolder = (path: string, folderName = "") => {
        let currentPath = path

        if (folderName !== "") {
            currentPath = `${path}/${folderName}`
        }

        const files = readDir(currentPath)

        for (const file of files) {
            const filePath = `${currentPath}/${file}`
            const moduleName = filePath.replace(topLevelFolder, ".")

            const stats = getFileStats(filePath)

            if (stats.isDirectory()) {
                traverseFolder(currentPath, file)
            }

            const { routeName, handlers } = getRouteNameAndHandlers({
                topLevelFolder,
                path,
                currentPath,
                folderName,
                fileName: file,
                moduleName
            })

            if (handlers !== null && routeName !== "") {
                console.log(
                    "routeName: ",
                    routeName,
                    "- handlers: ",
                    handlers
                )

                for (const k of Object.keys(handlers)) {
                    const kIsAnExpressMethodName = [
                        "post",
                        "get",
                        "put",
                        "delete"
                    ].includes(k.toLowerCase())

                    const kIsAFunction =
                        typeof handlers[k] === "function"

                    if (kIsAnExpressMethodName && kIsAFunction) {
                        // e.g. expressApp.post("/user/:id/address", k)
                        expressApp[k as expressMethodName](
                            routeName,
                            handlers[k]
                        )
                    }
                }
            }
        }
    }

    traverseFolder(topLevelFolder)

    expressApp.listen(port, () => {
        console.log(`Listening on :${port}...`)
    })
}
