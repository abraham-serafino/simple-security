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

    const folderRoutePath = `${path}/${folderName}`
        .replace(topLevelFolder, "")
        .toLowerCase()

    const fileRoutePath =
        `${currentPath}/${fileName.replace(/\..*/, "")}`
            .replace(topLevelFolder, "")
            .toLowerCase()

    let Controller = null

    if (
        lowerCaseFileName === `controller.js` ||
        lowerCaseFileName ===
            `${folderName.toLowerCase()}.controller.js`
    ) {
        routeName = folderRoutePath
        Controller = require(moduleName).default
    } else if (lowerCaseFileName.endsWith(".controller.js")) {
        routeName = fileRoutePath
        Controller = require(moduleName).default
    }

    if (typeof Controller === "function") {
        handlers = Controller
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
                if (typeof handlers.get === "function") {
                    expressApp.get(routeName, handlers.get)
                }

                if (typeof handlers.post === "function") {
                    expressApp.post(routeName, handlers.post)
                }

                if (typeof handlers.put === "function") {
                    expressApp.put(routeName, handlers.put)
                }

                if (typeof handlers.delete === "function") {
                    expressApp.delete(routeName, handlers.delete)
                }
            }
        }
    }

    traverseFolder(topLevelFolder)

    expressApp.listen(port, () => {
        console.log(`Listening on :${port}...`)
    })
}
